"use client";

import { useEffect } from "react";
import { useSessionStore } from "@/store/session-store";

export default function useSyncUser() {
  const userId = useSessionStore((s) => s.userId);

  useEffect(() => {
    if (!userId) return;

    document.cookie = `brainbolt_user=${userId}; path=/`;
  }, [userId]);
}
