import { z } from "zod";

export const NextQuestionQuery = z.object({
  userId: z.string().min(1)
});

export const AnswerBody = z.object({
  userId: z.string().min(1),
  questionId: z.string().min(1),
  selected: z.string().min(1),
  idempotencyKey: z.string().min(1)
});
