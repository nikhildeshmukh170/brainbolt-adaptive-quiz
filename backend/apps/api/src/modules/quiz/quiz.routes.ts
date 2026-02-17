import { Router } from "express";
import { nextQuestion, answerQuestion, quizMetrics } from "./quiz.controller";
import { validateBody, validateQuery } from "../../middleware/validate";
import { AnswerBody, NextQuestionQuery } from "../../types/quiz.types";

const router = Router();

router.get("/next", validateQuery(NextQuestionQuery), nextQuestion);
router.post("/answer", validateBody(AnswerBody), answerQuestion);
router.get("/metrics", validateQuery(NextQuestionQuery), quizMetrics);

export default router;
