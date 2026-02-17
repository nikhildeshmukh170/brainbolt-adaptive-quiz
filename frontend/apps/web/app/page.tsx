"use client";

import { useEffect, useState } from "react";
import Card from "@/components/ui/card";
import Badge from "@/components/ui/badge";
import StatPill from "@/components/ui/stat-pill";
import ProgressBar from "@/components/ui/progress-bar";
import Skeleton from "@/components/ui/skeleton";
import { useSession } from "@/hooks/use-session";
import { useScoreBoard, useStreakBoard } from "@/hooks/use-leaderboard";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getMetrics } from "@/lib/api";
import { getSocket } from "@/lib/socket";
import { useRouter } from "next/navigation";
import { useSessionStore } from "@/store/session-store";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import Toast from "@/components/ui/toast";
import { getNextQuestion } from "@/lib/api";

export default function Home() {
  const session = useSession();
  const scoreQuery = useScoreBoard();
  const streakQuery = useStreakBoard();
  const router = useRouter();
  const createNew = useSessionStore((s) => s.createNewSession);
  const qc = useQueryClient();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const metricsQuery = useQuery({
    queryKey: ["metrics", session?.sessionId],
    queryFn: () => getMetrics(session!.userId),
    enabled: !!session,
    refetchInterval: 3000,
  });

  useEffect(() => {
    const socket = getSocket();

    const onUpdate = () => {
      // leaderboard and metrics may have changed
      scoreQuery.refetch();
      streakQuery.refetch();
      metricsQuery.refetch();
    };

    socket.on("leaderboard:update", onUpdate);
    socket.on("metrics:update", onUpdate);

    return () => {
      socket.off("leaderboard:update", onUpdate);
      socket.off("metrics:update", onUpdate);
    };
  }, [scoreQuery, streakQuery, metricsQuery]);

  // derive current user's entries
  const scoreData = scoreQuery.data ?? [];
  const streakData = streakQuery.data ?? [];
  const userId = session?.userId;

  const scoreEntry = scoreData.find((u: { userId: string; score: number }) => u.userId === userId);
  const streakEntry = streakData.find((u: { userId: string; streak: number }) => u.userId === userId);
  const rank = scoreData.findIndex((u: { userId: string; score: number }) => u.userId === userId);

  const accuracy = metricsQuery.data?.accuracy ?? 0;
const storeAnswered = useSessionStore((s) => s.answered);
const answered = storeAnswered ?? metricsQuery.data?.recentPerformance?.length ?? 0;

// adaptive quiz → progress based on activity instead of fixed total
const progress = Math.min(100, answered * 10);


  return (
  <main className="mx-auto max-w-3xl space-y-6 p-4">

    {/* Header */}
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">BrainBolt</h1>
          <p className="text-sm opacity-70">Adaptive Infinite Quiz Platform</p>
        </div>
        <Badge>LIVE</Badge>
      </div>
    </Card>

    {/* Top Section */}
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

      <Card>
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">New Experience</h2>
          <p className="text-sm opacity-80 leading-relaxed">
            Choose an answer → Apply → Submit.  
            Your difficulty adapts automatically and leaderboard updates live.
          </p>
        </div>
      </Card>

      <Card>
        <div className="space-y-3">
          <div className="text-sm font-medium opacity-70">Quick Actions</div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => setConfirmOpen(true)}
              className="rounded-(--radius) bg-[rgb(var(--color-primary))] py-3 font-medium text-white transition hover:opacity-90"
            >
              Start Quiz
            </button>

            <div className="grid grid-cols-2 gap-3">
              <a
                href="/leaderboard"
                className="rounded-(--radius) bg-[rgb(var(--color-card))] py-2 text-center text-sm hover:opacity-80"
              >
                Leaderboard
              </a>

              <a
                href="/stats"
                className="rounded-(--radius) bg-[rgb(var(--color-card))] py-2 text-center text-sm hover:opacity-80"
              >
                Stats
              </a>
            </div>
          </div>
        </div>
      </Card>

    </div>

    {/* Player Stats */}
    <div className="grid grid-cols-3 gap-4">
      <StatPill label="Score" value={scoreEntry?.score ?? 0} />
      <StatPill label="Streak" value={streakEntry?.streak ?? 0} />
      <StatPill label="Rank" value={rank >= 0 ? rank + 1 : "-"} />
    </div>

    {/* Progress */}
    <Card>
      <div className="space-y-3">

        <div className="flex items-center justify-between">
          <span className="text-sm opacity-70">Session Progress</span>
          <span className="text-xs opacity-70">
            Answered {answered}
          </span>
        </div>

        {metricsQuery.isLoading ? (
          <Skeleton className="h-3 w-full" />
        ) : (
          <>
            <ProgressBar value={progress} />

            <div className="flex items-center justify-between text-xs opacity-70">
              <span className="font-medium">
                Accuracy {Math.round(accuracy)}%
              </span>
              <span>Streak {streakEntry?.streak ?? 0}</span>
            </div>
          </>
        )}
      </div>
    </Card>

    {/* Dialog + Toast (unchanged) */}
    <ConfirmDialog
      open={confirmOpen}
      title="Start a new 10-question quiz"
      message="You will answer exactly 10 questions. Ready to begin?"
      onCancel={() => setConfirmOpen(false)}
      onConfirm={async () => {
        setConfirmOpen(false);
        createNew();
        const { userId, sessionId } = useSessionStore.getState();
        console.log("[Home] Quiz started with fresh session");
        await qc.prefetchQuery({
          queryKey: ["question", sessionId],
          queryFn: () => getNextQuestion(userId, sessionId),
        });
        setToastMsg("Starting 10-question quiz (0/10)...");
        setToastOpen(true);
        setTimeout(() => router.push("/quiz"), 450);
      }}
    />

    <Toast open={toastOpen} message={toastMsg} onClose={() => setToastOpen(false)} />

  </main>
);

}
