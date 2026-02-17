export type AnswerResult = {
  correct: boolean;
  scoreDelta: number;
  newDifficulty: number;
  streak: number;
  maxStreak: number;
  totalScore: number;
  rankScore: number;
  rankStreak: number;
};
