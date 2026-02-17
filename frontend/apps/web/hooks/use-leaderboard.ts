"use client";

import { useQuery } from "@tanstack/react-query";
import { getScoreLeaderboard, getStreakLeaderboard } from "@/lib/api";

export function useScoreBoard() {
  return useQuery({
    queryKey: ["leaderboard", "score"],
    queryFn: getScoreLeaderboard,
    refetchInterval: 5000, // fallback polling — more real-time
  });
}

export function useStreakBoard() {
  return useQuery({
    queryKey: ["leaderboard", "streak"],
    queryFn: getStreakLeaderboard,
    refetchInterval: 5000,
  });
}
