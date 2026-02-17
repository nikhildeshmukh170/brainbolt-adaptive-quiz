"use client";

import QueryProvider from "./query-provider";
import ThemeProvider from "./theme-provider";
import SocketProvider from "./socket-provider";
import useSyncUser from "@/hooks/use-sync-user";

function Inner({ children }: { children: React.ReactNode }) {
  useSyncUser();
  return children;
}

export default function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <SocketProvider>
          <Inner>{children}</Inner>
        </SocketProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}

