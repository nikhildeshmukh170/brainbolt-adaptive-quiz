"use client";

import dynamic from "next/dynamic";

// dynamic import MUST live in a client component
const LeaderboardBoard = dynamic(
  () => import("./board"),
  {
    ssr: false,
    loading: () => (
      <div className="p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="h-5 w-40">
              <div className="h-5 w-40">
                <div className="bg-[rgba(2,6,23,0.06)] skeleton rounded h-5 w-40" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="h-4 w-12">
                <div className="bg-[rgba(2,6,23,0.06)] skeleton rounded h-4 w-12" />
              </div>
              <div className="h-4 w-24">
                <div className="bg-[rgba(2,6,23,0.06)] skeleton rounded h-4 w-24" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="h-8 w-full"><div className="bg-[rgba(2,6,23,0.06)] skeleton rounded h-8 w-full" /></div>
              <div className="h-8 w-full"><div className="bg-[rgba(2,6,23,0.06)] skeleton rounded h-8 w-full" /></div>
              <div className="h-8 w-full"><div className="bg-[rgba(2,6,23,0.06)] skeleton rounded h-8 w-full" /></div>
            </div>
          </div>
        </div>
      </div>
    ),
  }
);

export default function LeaderboardClient() {
  return <LeaderboardBoard />;
}
