import { Toaster } from "@/components/ui/sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import AppShell from "./components/AppShell";
import LoginScreen from "./components/LoginScreen";
import { useActor } from "./hooks/useActor";
import { useInternetIdentity } from "./hooks/useInternetIdentity";

export default function App() {
  const [isDark, setIsDark] = useState(() => {
    const stored = localStorage.getItem("gs-theme");
    return stored !== "light";
  });
  const { identity, isInitializing } = useInternetIdentity();
  const { actor, isFetching } = useActor();
  const [demoInitialized, setDemoInitialized] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      document.documentElement.style.colorScheme = "dark";
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.style.colorScheme = "light";
    }
    localStorage.setItem("gs-theme", isDark ? "dark" : "light");
  }, [isDark]);

  const initMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("No actor");
      await actor.initDemoData();
    },
    onSuccess: () => {
      setDemoInitialized(true);
      void queryClient.invalidateQueries();
    },
  });

  useEffect(() => {
    if (
      identity &&
      actor &&
      !isFetching &&
      !demoInitialized &&
      !initMutation.isPending
    ) {
      initMutation.mutate();
    }
  }, [identity, actor, isFetching, demoInitialized, initMutation]);

  if (isInitializing) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="relative h-12 w-12">
            <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
            <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-primary" />
          </div>
          <p className="text-sm text-muted-foreground font-body">
            Initializing GS AI Outlook…
          </p>
        </div>
      </div>
    );
  }

  if (!identity) {
    return (
      <>
        <LoginScreen />
        <Toaster />
      </>
    );
  }

  return (
    <>
      <AppShell
        isDark={isDark}
        onToggleTheme={() => setIsDark((p) => !p)}
        isReady={demoInitialized}
        isInitializing={initMutation.isPending}
      />
      <Toaster richColors />
    </>
  );
}
