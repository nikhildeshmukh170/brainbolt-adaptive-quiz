"use client";

import { useState } from "react";
import Card from "@/components/ui/card";
import { useScoreBoard, useStreakBoard } from "@/hooks/use-leaderboard";

export default function LeaderboardBoard() {
  const [tab, setTab] = useState<"score" | "streak">("score");

  const score = useScoreBoard();
  const streak = useStreakBoard();

  const data = tab === "score" ? score.data : streak.data;

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-2">
        <button
          className={`px-4 py-2 rounded-[var(--radius)] ${
            tab === "score" ? "bg-[rgb(var(--color-primary))] text-white" : "bg-[rgb(var(--color-card))]"
          }`}
          onClick={() => setTab("score")}
        >
          Score
        </button>

        <button
          className={`px-4 py-2 rounded-[var(--radius)] ${
            tab === "streak" ? "bg-[rgb(var(--color-primary))] text-white" : "bg-[rgb(var(--color-card))]"
          }`}
          onClick={() => setTab("streak")}
        >
          Streak
        </button>
      </div>

      {/* Table */}
      <Card>
        <div className="space-y-2">
          {data ? (
            data.map((u, i) => (
              <div
                key={u.userId}
                className="flex items-center justify-between border-b border-black/10 pb-2 last:border-none"
              >
                <span className="font-medium">#{i + 1}</span>
                <span className="opacity-70">{u.userId.slice(0, 6)}</span>

                {tab === "score" ? (
                  <span className="font-semibold">{u.score}</span>
                ) : (
                  <span className="font-semibold">{u.streak}</span>
                )}
              </div>
            ))
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between border-b border-black/10 pb-2 last:border-none">
                <div className="h-4 w-8 bg-[rgba(2,6,23,0.06)] skeleton rounded" />
                <div className="h-4 w-20 bg-[rgba(2,6,23,0.06)] skeleton rounded" />
                <div className="h-4 w-10 bg-[rgba(2,6,23,0.06)] skeleton rounded" />
              </div>
              <div className="h-8 w-full bg-[rgba(2,6,23,0.06)] skeleton rounded" />
              <div className="h-8 w-full bg-[rgba(2,6,23,0.06)] skeleton rounded" />
              <div className="h-8 w-full bg-[rgba(2,6,23,0.06)] skeleton rounded" />
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
