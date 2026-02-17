// Question returned by GET /v1/quiz/next
export interface QuizQuestion {
  questionId: string;
  question: string;
  choices: string[];
  difficulty: "easy" | "medium" | "hard";
}


// Response after POST /v1/quiz/answer
export interface AnswerResponse {
  correct: boolean;
  correctAnswer: number;
  score: number;
  streak: number;
  maxStreak: number;
  rank: number;
}

// Metrics for /stats page
export interface Metrics {
  accuracy: number;
  difficultyDistribution: {
    easy: number;
    medium: number;
    hard: number;
  };
  recentPerformance: boolean[];
}

// Leaderboard item
export interface LeaderboardUser {
  userId: string;
  score: number;
  streak: number;
}

