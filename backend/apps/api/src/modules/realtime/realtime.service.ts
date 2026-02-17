import { redis } from "../../lib/redis";
import { getIO } from "./socket";

export async function emitLeaderboardUpdate(userId: string) {
  const io = getIO();

  const rankScore = await redis.zrevrank("lb:score", userId);
  const rankStreak = await redis.zrevrank("lb:streak", userId);

  io.emit("leaderboard:update", {
    userId,
    rankScore: (rankScore ?? 0) + 1,
    rankStreak: (rankStreak ?? 0) + 1
  });
}
