import { Request, Response } from "express";
import { redis } from "../../lib/redis";

/**
 * GET /v1/leaderboard/score
 */
export async function leaderboardScore(_: Request, res: Response) {
  const data = await redis.zrevrange("lb:score", 0, 9, "WITHSCORES");

  const result = [];
  for (let i = 0; i < data.length; i += 2) {
    result.push({
      userId: data[i],
      score: Number(data[i + 1])
    });
  }

  res.json(result);
}

/**
 * GET /v1/leaderboard/streak
 */
export async function leaderboardStreak(_: Request, res: Response) {
  const data = await redis.zrevrange("lb:streak", 0, 9, "WITHSCORES");

  const result = [];
  for (let i = 0; i < data.length; i += 2) {
    result.push({
      userId: data[i],
      maxStreak: Number(data[i + 1])
    });
  }

  res.json(result);
}
