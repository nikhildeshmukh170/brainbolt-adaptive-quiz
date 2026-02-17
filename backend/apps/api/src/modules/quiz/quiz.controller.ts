import { Request, Response } from "express";
import { getNextQuestion, submitAnswer } from "./quiz.service";
import { prisma } from "../../lib/prisma";

/**
 * GET /v1/quiz/next?userId=
 */
export async function nextQuestion(req: Request, res: Response) {
  try {
    const { userId } = req.validated;
    if (!userId) return res.status(400).json({ error: "userId required" });

    const question = await getNextQuestion(userId);

    // NEVER send correct answer to frontend
    const { correct, ...safeQuestion } = question as any;

    res.json(safeQuestion);
  } catch (err) {
  console.error(err);
  res.status(500).json({ error: "Failed to fetch question" });
}
}

/**
 * POST /v1/quiz/answer
 */
export async function answerQuestion(req: Request, res: Response) {
  try {
    const { userId, questionId, selected, idempotencyKey } = req.validated;

    if (!userId || !questionId || !selected || !idempotencyKey) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const result = await submitAnswer(
      userId,
      questionId,
      selected,
      idempotencyKey
    );

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to submit answer" });
  }
}

/**
 * GET /v1/quiz/metrics?userId=
 */
export async function quizMetrics(req: Request, res: Response) {
  try {
    const { userId } = req.validated;
    if (!userId) return res.status(400).json({ error: "userId required" });

    const state = await prisma.userState.findUnique({
      where: { userId }
    });

    if (!state) return res.json(null);

    res.json({
      difficulty: state.currentDifficulty,
      streak: state.streak,
      maxStreak: state.maxStreak,
      totalScore: state.totalScore,
      accuracy:
        state.totalAnswers === 0
          ? 0
          : state.correctAnswers / state.totalAnswers
    });
  } catch {
    res.status(500).json({ error: "Failed to fetch metrics" });
  }
}
