import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Calendar,
  CheckSquare,
  Loader2,
  LogOut,
  Mail,
  Moon,
  PenSquare,
  Sun,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import CalendarModule from "./CalendarModule";
import ComposeModal from "./ComposeModal";
import MailModule from "./MailModule";
import TasksModule from "./TasksModule";

type Module = "mail" | "calendar" | "tasks";

interface AppShellProps {
  isDark: boolean;
  onToggleTheme: () => void;
  isReady: boolean;
  isInitializing: boolean;
}

export default function AppShell({
  isDark,
  onToggleTheme,
  isReady,
  isInitializing,
}: AppShellProps) {
  const [activeModule, setActiveModule] = useState<Module>("mail");
  const [composeOpen, setComposeOpen] = useState(false);
  const { identity, clear } = useInternetIdentity();

  const principal = identity?.getPrincipal().toString() ?? "";
  const initials =
    principal.length > 0 ? principal.substring(0, 2).toUpperCase() : "GS";

  const navItems: {
    id: Module;
    icon: React.ElementType;
    label: string;
    ocid: string;
  }[] = [
    { id: "mail", icon: Mail, label: "Mail", ocid: "nav.mail.link" },
    {
      id: "calendar",
      icon: Calendar,
      label: "Calendar",
      ocid: "nav.calendar.link",
    },
    { id: "tasks", icon: CheckSquare, label: "Tasks", ocid: "nav.tasks.link" },
  ];

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex h-screen overflow-hidden bg-background">
        {/* Sidebar */}
        <aside className="w-16 flex-shrink-0 flex flex-col items-center py-4 gap-2 bg-sidebar sidebar-glow border-r border-sidebar-border z-10">
          {/* Logo */}
          <div className="mb-4 h-10 w-10 rounded-xl bg-sidebar-primary flex items-center justify-center shadow-glow flex-shrink-0">
            <span className="text-sidebar-primary-foreground font-display font-bold text-sm">
              GS
            </span>
          </div>

          {/* Compose button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                data-ocid="nav.compose.button"
                size="icon"
                className="h-10 w-10 rounded-xl mb-2 bg-sidebar-primary/20 hover:bg-sidebar-primary/30 text-sidebar-primary border border-sidebar-primary/20"
                onClick={() => setComposeOpen(true)}
              >
                <PenSquare className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Compose</TooltipContent>
          </Tooltip>

          {/* Nav items */}
          <nav className="flex flex-col gap-1 flex-1 w-full px-2">
            {navItems.map(({ id, icon: Icon, label, ocid }) => (
              <Tooltip key={id}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    data-ocid={ocid}
                    onClick={() => setActiveModule(id)}
                    className={`w-full h-10 rounded-lg flex items-center justify-center transition-all ${
                      activeModule === id
                        ? "bg-sidebar-primary/20 text-sidebar-primary shadow-sm"
                        : "text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">{label}</TooltipContent>
              </Tooltip>
            ))}
          </nav>

          {/* Bottom controls */}
          <div className="flex flex-col items-center gap-2 pb-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  data-ocid="nav.theme.toggle"
                  size="icon"
                  variant="ghost"
                  className="h-9 w-9 rounded-lg text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                  onClick={onToggleTheme}
                >
                  {isDark ? (
                    <Sun className="h-4 w-4" />
                  ) : (
                    <Moon className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                {isDark ? "Light mode" : "Dark mode"}
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  data-ocid="auth.logout.button"
                  size="icon"
                  variant="ghost"
                  className="h-9 w-9 rounded-lg text-sidebar-foreground/50 hover:text-destructive hover:bg-destructive/10"
                  onClick={clear}
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Sign out</TooltipContent>
            </Tooltip>

            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-sidebar-accent text-sidebar-foreground text-xs font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-hidden relative">
          {isInitializing && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="flex items-center gap-3 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <span className="text-sm font-body">
                  Loading your workspace…
                </span>
              </div>
            </div>
          )}

          <AnimatePresence mode="wait">
            {activeModule === "mail" && (
              <motion.div
                key="mail"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                <MailModule isReady={isReady} />
              </motion.div>
            )}
            {activeModule === "calendar" && (
              <motion.div
                key="calendar"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                <CalendarModule isReady={isReady} />
              </motion.div>
            )}
            {activeModule === "tasks" && (
              <motion.div
                key="tasks"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                <TasksModule isReady={isReady} />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      <ComposeModal open={composeOpen} onClose={() => setComposeOpen(false)} />
    </TooltipProvider>
  );
}
