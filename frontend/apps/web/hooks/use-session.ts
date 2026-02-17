"use client";

import { useEffect, useState } from "react";
import { useSessionStore } from "@/store/session-store";

export function useSession() {
  const store = useSessionStore();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  return hydrated ? store : null;
}
