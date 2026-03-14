import { Button } from "@/components/ui/button";
import { Brain, Loader2, Mail, Shield, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function LoginScreen() {
  const { login, isLoggingIn, isInitializing } = useInternetIdentity();

  const features = [
    {
      icon: Brain,
      label: "GS Copilot AI",
      desc: "Smart compose, summarize & rewrite",
    },
    {
      icon: Shield,
      label: "Zero-Knowledge Encryption",
      desc: "Your keys, your data",
    },
    {
      icon: Zap,
      label: "Priority Inbox 2.0",
      desc: "Context-aware email triage",
    },
    {
      icon: Mail,
      label: "Unified Workspace",
      desc: "Email, calendar & tasks in one place",
    },
  ];

  return (
    <div className="min-h-screen bg-background flex overflow-hidden">
      {/* Left panel – branding */}
      <div className="hidden lg:flex flex-col w-1/2 relative bg-sidebar overflow-hidden">
        {/* Background gradient mesh */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 20% 40%, oklch(0.78 0.14 200 / 0.25) 0%, transparent 60%), radial-gradient(ellipse 60% 80% at 80% 80%, oklch(0.65 0.15 280 / 0.2) 0%, transparent 60%)",
          }}
        />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "linear-gradient(oklch(0.85 0.01 260) 1px, transparent 1px), linear-gradient(90deg, oklch(0.85 0.01 260) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="relative z-10 flex flex-col h-full p-12">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-3"
          >
            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shadow-glow">
              <span className="text-primary-foreground font-display font-bold text-lg">
                GS
              </span>
            </div>
            <span className="text-sidebar-foreground font-display font-semibold text-xl tracking-tight">
              AI Outlook
            </span>
          </motion.div>

          {/* Hero text */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-auto mb-8"
          >
            <h1 className="font-display text-5xl font-bold text-sidebar-foreground leading-tight">
              Email, reimagined
              <br />
              <span className="text-primary">for the AI era.</span>
            </h1>
            <p className="mt-4 text-sidebar-foreground/60 text-lg font-body leading-relaxed max-w-md">
              A next-generation intelligent workspace that transforms how you
              communicate, schedule, and stay focused.
            </p>
          </motion.div>

          {/* Feature pills */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-2 gap-3 mb-8"
          >
            {features.map(({ icon: Icon, label, desc }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.5 + i * 0.1 }}
                className="flex items-start gap-3 p-3 rounded-lg bg-sidebar-accent/40 border border-sidebar-border"
              >
                <div className="flex-shrink-0 h-8 w-8 rounded-md bg-sidebar-primary/20 flex items-center justify-center">
                  <Icon className="h-4 w-4 text-sidebar-primary" />
                </div>
                <div>
                  <p className="text-sidebar-foreground text-xs font-semibold leading-tight">
                    {label}
                  </p>
                  <p className="text-sidebar-foreground/50 text-xs mt-0.5 leading-snug">
                    {desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Footer */}
          <p className="text-sidebar-foreground/30 text-xs">
            © {new Date().getFullYear()} GS AI Outlook. Built with love using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-sidebar-foreground/50 transition-colors"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>

      {/* Right panel – login form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-full max-w-sm"
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-display font-bold">
                GS
              </span>
            </div>
            <span className="font-display font-semibold text-lg tracking-tight">
              AI Outlook
            </span>
          </div>

          <h2 className="font-display text-3xl font-bold text-foreground">
            Welcome back
          </h2>
          <p className="mt-2 text-muted-foreground font-body text-sm">
            Sign in to access your intelligent workspace.
          </p>

          <div className="mt-10 space-y-4">
            <Button
              data-ocid="auth.login.button"
              className="w-full h-12 font-semibold text-base shadow-glow transition-all hover:scale-[1.02] active:scale-[0.98]"
              onClick={login}
              disabled={isLoggingIn || isInitializing}
            >
              {isLoggingIn || isInitializing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-4 w-4" />
                  Sign in with Internet Identity
                </>
              )}
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              Secure, decentralized authentication — no passwords required.
            </p>
          </div>

          <div className="mt-16 flex items-center gap-4">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">
              trusted by professionals
            </span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <div className="mt-4 flex items-center justify-center gap-6 text-xs text-muted-foreground">
            <span>🔒 End-to-end encrypted</span>
            <span>🌐 Decentralized</span>
            <span>⚡ AI-powered</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
