import { Router } from "express";
import { leaderboardScore, leaderboardStreak } from "./leaderboard.controller";

const router = Router();

router.get("/score", leaderboardScore);
router.get("/streak", leaderboardStreak);

export default router;
