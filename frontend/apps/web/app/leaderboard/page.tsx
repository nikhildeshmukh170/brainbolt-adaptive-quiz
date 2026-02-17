import LeaderboardClient from "@/components/leaderboard/leaderboard-client";

export default function LeaderboardPage() {
  return (
    <main className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Leaderboard</h1>
      </div>

      <LeaderboardClient />
    </main>
  );
}
