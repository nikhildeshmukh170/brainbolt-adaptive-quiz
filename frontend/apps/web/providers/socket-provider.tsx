"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getSocket } from "@/lib/socket";

export default function SocketProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const qc = useQueryClient();

  useEffect(() => {
    const socket = getSocket();

    socket.on("connect", () => {
      console.log("socket connected");
    });

    socket.on("leaderboard:update", () => {
      // refresh both leaderboards
      qc.invalidateQueries({ queryKey: ["leaderboard"] });
    });

    return () => {
      socket.off("leaderboard:update");
    };
  }, [qc]);

  return children;
}
