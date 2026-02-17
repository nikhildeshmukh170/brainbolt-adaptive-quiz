import { QuizQuestion, AnswerResponse, Metrics, LeaderboardUser } from "./types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

if (!process.env.NEXT_PUBLIC_API_URL) {
  console.warn("NEXT_PUBLIC_API_URL is not set. Using default: http://localhost:4000");
}

// Generic request helper
async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
    ...options,
  });

  if (!res.ok) {
    throw new Error(`API Error: ${res.status}`);
  }

  return res.json();
}

function mapDifficulty(level: number): "easy" | "medium" | "hard" {
  if (level <= 3) return "easy";
  if (level <= 6) return "medium";
  return "hard";
}

function mapQuestion(api: Record<string, unknown>): QuizQuestion {
  return {
    questionId: String(api.id),
    question: String(api.question),
    choices: Array.isArray(api.options) ? api.options.map(String) : [],
    difficulty: mapDifficulty(Number(api.difficulty)),
  };
}


//////////////////////////////////////////////////////////
// QUIZ
//////////////////////////////////////////////////////////

export const getNextQuestion = async (userId: string, sessionId: string) => {
  const data = await request<Record<string, unknown>>(
    `/v1/quiz/next?userId=${userId}&sessionId=${sessionId}`
  );

  return mapQuestion(data);
};

function generateKey() {
  return Math.random().toString(36).slice(2);
}

export const submitAnswer = async (
  userId: string,
  questionId: string,
  selectedValue: string
) => {
  return request<AnswerResponse>(`/v1/quiz/answer`, {
    method: "POST",
    body: JSON.stringify({
      userId,
      questionId,
      selected: selectedValue,
      idempotencyKey: generateKey(),
    }),
  });
};



export const getMetrics = (userId: string) =>
  request<Metrics>(`/v1/quiz/metrics?userId=${userId}`);

//////////////////////////////////////////////////////////
// LEADERBOARD
//////////////////////////////////////////////////////////

export const getScoreLeaderboard = () =>
  request<LeaderboardUser[]>(`/v1/leaderboard/score`);

export const getStreakLeaderboard = () =>
  request<LeaderboardUser[]>(`/v1/leaderboard/streak`);


//////////////////////////////////////////////////////////
// SERVER FETCH (SSR)
//////////////////////////////////////////////////////////

function mapMetrics(api: Record<string, unknown> | null | undefined) {
  if (!api) return null;

  // accuracy may come as ratio or percentage
  const accuracy =
    api.accuracy !== undefined
      ? Math.round(Number(api.accuracy) * 100)
      : api.correct && api.total
      ? Math.round((Number(api.correct) / Number(api.total)) * 100)
      : 0;

  // difficulty distribution normalize
  const diff = (api.difficultyDistribution || api.difficultyStats || api.difficultyCounts || {}) as Record<string, unknown>;

  const difficultyDistribution = {
    easy: Number(diff.easy ?? diff["1"] ?? 0),
    medium: Number(diff.medium ?? diff["3"] ?? 0),
    hard: Number(diff.hard ?? diff["5"] ?? 0),
  };

  // recent answers normalize
  const recentRaw = Array.isArray(api.recentPerformance) ? api.recentPerformance : Array.isArray(api.recent) ? api.recent : Array.isArray(api.recentAnswers) ? api.recentAnswers : [];
  const recentPerformance = recentRaw.map((v: unknown) => Boolean(v));

  return {
    accuracy,
    difficultyDistribution,
    recentPerformance,
  };
}

export async function getMetricsSSR(userId: string) {
  try {
    const res = await fetch(
      `${BASE_URL}/v1/quiz/metrics?userId=${userId}`,
      { cache: "no-store" }
    );

    if (!res.ok) return null;

    const data = await res.json();
    return mapMetrics(data);
  } catch {
    return null;
  }
}
