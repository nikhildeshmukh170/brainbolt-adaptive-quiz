import { prisma } from "../../lib/prisma";
import { redis } from "../../lib/redis";
import { AnswerResult } from "./quiz.types";
import { emitLeaderboardUpdate } from "../realtime/realtime.service";


const MIN_DIFF = 1;
const MAX_DIFF = 10;

/**
 * Prevent oscillation using confidence stabilizer
 */
function adjustDifficulty(current: number, confidence: number) {
  let difficulty = current;
  let newConfidence = confidence;

  if (confidence >= 3) {
    difficulty = Math.min(MAX_DIFF, current + 1);
    newConfidence = 0;
  } else if (confidence <= -3) {
    difficulty = Math.max(MIN_DIFF, current - 1);
    newConfidence = 0;
  }

  return { difficulty, confidence: newConfidence };
}

/**
 * Inactivity streak decay (10 minutes)
 */
function applyInactivityDecay(streak: number, lastAnsweredAt?: Date | null) {
  if (!lastAnsweredAt) return streak;

  const diff = Date.now() - lastAnsweredAt.getTime();
  const TEN_MIN = 10 * 60 * 1000;

  if (diff > TEN_MIN) {
    return Math.floor(streak / 2);
  }

  return streak;
}

/**
 * Score calculation
 */
function calculateScore(
  difficulty: number,
  streak: number,
  correctAnswers: number,
  totalAnswers: number,
  recentCorrect: boolean[]
) {
  const baseScore = difficulty * 10;

  const streakMultiplier = 1 + Math.min(streak, 5) * 0.2;

  const accuracy = totalAnswers === 0 ? 0.5 : correctAnswers / totalAnswers;
  const accuracyBonus = 1 + (accuracy - 0.5);

  const recentAvg =
    recentCorrect.reduce((a, b) => a + (b ? 1 : 0), 0) / Math.max(recentCorrect.length, 1);
  const recentFactor = 0.8 + recentAvg * 0.4;

  return baseScore * streakMultiplier * accuracyBonus * recentFactor;
}

export async function getNextQuestion(userId: string) {
  let state = await prisma.userState.findUnique({
    where: { userId }
  });

  // create state if first time user
  if (!state) {
    await prisma.user.create({ data: { id: userId } });

    state = await prisma.userState.create({
      data: { userId }
    });
  }

  // Try Redis cache
  const cacheKey = `questions:${state.currentDifficulty}`;
  const cached = await redis.lpop(cacheKey);

  if (cached) {
    return JSON.parse(cached);
  }

  // fallback DB
  const question = await prisma.question.findFirst({
    where: { difficulty: state.currentDifficulty }
  });

  if (!question) throw new Error("No questions seeded");

  return question;
}

export async function submitAnswer(
  userId: string,
  questionId: string,
  selected: string,
  idempotencyKey: string
): Promise<AnswerResult> {

  // 1️⃣ IDEMPOTENCY CHECK
  const existing = await prisma.answerLog.findUnique({
    where: { idempotencyKey }
  });

  if (existing) {
    const state = await prisma.userState.findUnique({ where: { userId } });
    const rankScore = await redis.zrevrank("lb:score", userId);
    const rankStreak = await redis.zrevrank("lb:streak", userId);

    return {
      correct: existing.correct,
      scoreDelta: existing.scoreDelta,
      newDifficulty: state!.currentDifficulty,
      streak: state!.streak,
      maxStreak: state!.maxStreak,
      totalScore: state!.totalScore,
      rankScore: (rankScore ?? 0) + 1,
      rankStreak: (rankStreak ?? 0) + 1
    };
  }

  // 2️⃣ Fetch question + state
  const [question, state] = await Promise.all([
    prisma.question.findUnique({ where: { id: questionId } }),
    prisma.userState.findUnique({ where: { userId } })
  ]);

  if (!question || !state) throw new Error("Invalid request");

  // 3️⃣ Check correctness
  const correct = question.correct === selected;

  // 4️⃣ Apply inactivity decay
  let streak = applyInactivityDecay(state.streak, state.lastAnsweredAt);

  // 5️⃣ Update streak
  if (correct) streak += 1;
  else streak = 0;

  const maxStreak = Math.max(state.maxStreak, streak);

  // 6️⃣ Update confidence
  let confidence = state.confidence + (correct ? 1 : -1);

  const { difficulty, confidence: newConfidence } =
    adjustDifficulty(state.currentDifficulty, confidence);

  // 7️⃣ Calculate score
  const correctAnswers = state.correctAnswers + (correct ? 1 : 0);
  const totalAnswers = state.totalAnswers + 1;

  const recentLogs = await prisma.answerLog.findMany({
    where: { userId },
    orderBy: { answeredAt: "desc" },
    take: 5
  });

  const recentCorrect = recentLogs.map(l => l.correct);
  recentCorrect.unshift(correct);

  const scoreDelta = correct
    ? calculateScore(difficulty, streak, correctAnswers, totalAnswers, recentCorrect)
    : 0;

  const totalScore = state.totalScore + scoreDelta;

  // 8️⃣ Transaction write
  await prisma.$transaction([
    prisma.answerLog.create({
      data: {
        userId,
        questionId,
        difficulty,
        correct,
        scoreDelta,
        streakAtAnswer: streak,
        idempotencyKey
      }
    }),
    prisma.userState.update({
      where: { userId },
      data: {
        currentDifficulty: difficulty,
        confidence: newConfidence,
        streak,
        maxStreak,
        totalScore,
        correctAnswers,
        totalAnswers,
        lastAnsweredAt: new Date(),
        stateVersion: { increment: 1 }
      }
    })
  ]);

  // 9️⃣ Update leaderboard
  await redis.zadd("lb:score", totalScore, userId);
  await redis.zadd("lb:streak", maxStreak, userId);

  await emitLeaderboardUpdate(userId);

  const rankScore = await redis.zrevrank("lb:score", userId);
  const rankStreak = await redis.zrevrank("lb:streak", userId);

  return {
    correct,
    scoreDelta,
    newDifficulty: difficulty,
    streak,
    maxStreak,
    totalScore,
    rankScore: (rankScore ?? 0) + 1,
    rankStreak: (rankStreak ?? 0) + 1
  };
}
