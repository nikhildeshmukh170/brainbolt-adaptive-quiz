import Card from "@/components/ui/card";
import ProgressBar from "@/components/ui/progress-bar";
import { getMetricsSSR } from "@/lib/api";
import { cookies } from "next/headers";


export default async function StatsPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("brainbolt_user")?.value;


  if (!userId) {
    return (
      <main className="p-6">
        <div className="text-sm opacity-70">
          Play at least one quiz question first to generate stats.
        </div>
      </main>
    );
  }

  const data = await getMetricsSSR(userId);

  if (!data) {
    return (
      <main className="p-6">
        <div className="text-sm opacity-70">
          No stats available yet. Play at least one quiz question first.
        </div>
      </main>
    );
  }

  return (
    <main className="space-y-6">
      <h1 className="text-xl font-semibold">Your Performance</h1>

      {/* Accuracy */}
      <Card>
        <div className="space-y-2">
          <div className="text-sm opacity-70">Accuracy</div>
          <div className="text-lg font-semibold">{data.accuracy}%</div>
          <ProgressBar value={data.accuracy} />
        </div>
      </Card>

      {/* Difficulty distribution */}
      <Card>
        <div className="space-y-3">
          <div className="font-medium">Difficulty Distribution</div>

          <div>
            <div className="text-xs">Easy</div>
            <ProgressBar value={data.difficultyDistribution.easy} />
          </div>

          <div>
            <div className="text-xs">Medium</div>
            <ProgressBar value={data.difficultyDistribution.medium} />
          </div>

          <div>
            <div className="text-xs">Hard</div>
            <ProgressBar value={data.difficultyDistribution.hard} />
          </div>
        </div>
      </Card>

      {/* Recent performance */}
      <Card>
        <div className="space-y-2">
          <div className="font-medium">Recent Answers</div>

          <div className="flex gap-2">
            {data.recentPerformance.map((c: boolean, i: number) => (
              <div
                key={i}
                className={`h-4 w-4 rounded-full ${
                  c ? "bg-emerald-500" : "bg-red-500"
                }`}
              />
            ))}
          </div>
        </div>
      </Card>
    </main>
  );
}
