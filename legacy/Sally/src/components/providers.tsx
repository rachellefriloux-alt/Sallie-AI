"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect, ReactNode } from "react";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { NotificationProvider } from "@/components/NotificationProvider";
import { ThemePresetSync } from "@/components/ThemePresetSync";
import { RealtimeProvider } from "@/hooks/useRealtimeUpdates";
import { KeyboardShortcuts } from "@/components/KeyboardShortcuts";
import { NotificationToast } from "@/components/NotificationToast";
import { FloatingGhostAvatar } from "@/components/FloatingGhostAvatar";
import { GhostNotifications } from "@/components/GhostNotifications";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { registerServiceWorker } from "@/lib/pwa-register";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
            retry: 2,
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
          },
        },
      })
  );

  useEffect(() => {
    registerServiceWorker();
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <NotificationProvider>
          <RealtimeProvider>
            <ThemePresetSync />
            <KeyboardShortcuts />
            <NotificationToast />
            {children}
            <FloatingGhostAvatar />
            <GhostNotifications />
            <PWAInstallPrompt />
          </RealtimeProvider>
        </NotificationProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
