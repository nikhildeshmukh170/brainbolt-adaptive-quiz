import express from "express";
import cors from "cors";

import quizRoutes from "./modules/quiz/quiz.routes";
import leaderboardRoutes from "./modules/leaderboard/leaderboard.routes";

export const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_, res) => res.json({ status: "ok" }));

app.use("/v1/quiz", quizRoutes);
app.use("/v1/leaderboard", leaderboardRoutes);
