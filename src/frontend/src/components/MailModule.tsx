import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Brain,
  Forward,
  Loader2,
  MailOpen,
  Reply,
  Star,
  StarOff,
  Trash2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import {
  type Email,
  useEmails,
  useMarkEmailRead,
  useSummarizeEmail,
  useToggleStar,
} from "../hooks/useQueries";

type Category = "all" | "action" | "waiting" | "newsletter" | "other";

const CATEGORY_MAP: Record<string, Category> = {
  "action required": "action",
  action: "action",
  "waiting for reply": "waiting",
  waiting: "waiting",
  newsletter: "newsletter",
  newsletters: "newsletter",
  other: "other",
};

const CATEGORY_LABELS: Record<Category, string> = {
  all: "All",
  action: "Action Required",
  waiting: "Waiting",
  newsletter: "Newsletters",
  other: "Other",
};

const AVATAR_COLORS = [
  "bg-chart-1/20 text-chart-1",
  "bg-chart-2/20 text-chart-2",
  "bg-chart-3/20 text-chart-3",
  "bg-chart-4/20 text-chart-4",
  "bg-chart-5/20 text-chart-5",
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function formatEmailDate(ts: bigint): string {
  const ms = Number(ts / 1_000_000n);
  if (ms < 1_000_000) return "—";
  const d = new Date(ms);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  const diff = now.getTime() - d.getTime();
  if (diff < 7 * 24 * 60 * 60 * 1000) {
    return d.toLocaleDateString([], { weekday: "short" });
  }
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

interface Props {
  isReady: boolean;
}

export default function MailModule({ isReady }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [category, setCategory] = useState<Category>("all");
  const [summary, setSummary] = useState<string | null>(null);

  const { data: emails = [], isLoading } = useEmails();
  const markRead = useMarkEmailRead();
  const toggleStar = useToggleStar();
  const summarize = useSummarizeEmail();

  const selectedEmail = emails.find((e) => e.id === selectedId) ?? null;

  const filteredEmails = emails.filter((e) => {
    if (category === "all") return true;
    const mapped = CATEGORY_MAP[e.category.toLowerCase()] ?? "other";
    return mapped === category;
  });

  const handleSelectEmail = (email: Email) => {
    setSelectedId(email.id);
    setSummary(null);
    if (!email.isRead) {
      markRead.mutate(email.id);
    }
  };

  const handleSummarize = async () => {
    if (!selectedEmail) return;
    try {
      const result = await summarize.mutateAsync(selectedEmail.id);
      setSummary(result);
    } catch {
      toast.error("Failed to summarize email");
    }
  };

  const categories: Category[] = [
    "all",
    "action",
    "waiting",
    "newsletter",
    "other",
  ];

  return (
    <div className="flex h-full">
      {/* Email list panel */}
      <div className="w-80 flex-shrink-0 flex flex-col border-r border-border">
        {/* Header */}
        <div className="px-4 py-3 border-b border-border">
          <h2 className="font-display font-semibold text-foreground">Inbox</h2>
          {emails.length > 0 && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {emails.filter((e) => !e.isRead).length} unread
            </p>
          )}
        </div>

        {/* Category tabs */}
        <div className="px-3 py-2 border-b border-border overflow-x-auto">
          <div className="flex gap-1 min-w-max">
            {categories.map((cat) => (
              <button
                type="button"
                key={cat}
                data-ocid="inbox.category.tab"
                onClick={() => setCategory(cat)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all whitespace-nowrap ${
                  category === cat
                    ? "bg-primary/20 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
              >
                {CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>
        </div>

        {/* Email list */}
        <ScrollArea className="flex-1 scrollbar-thin">
          {isLoading || !isReady ? (
            <div className="p-3 space-y-3">
              {["s1", "s2", "s3", "s4", "s5", "s6"].map((k) => (
                <div key={k} className="flex gap-3 p-2">
                  <Skeleton className="h-9 w-9 rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredEmails.length === 0 ? (
            <div
              data-ocid="email.list.empty_state"
              className="flex flex-col items-center justify-center h-48 gap-3 text-center px-6"
            >
              <MailOpen className="h-10 w-10 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">
                No emails in this category
              </p>
            </div>
          ) : (
            <div className="p-2 space-y-0.5">
              {filteredEmails.map((email, idx) => (
                <motion.div
                  key={email.id}
                  data-ocid={`email.list.item.${idx + 1}`}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: idx * 0.03 }}
                  onClick={() => handleSelectEmail(email)}
                  className={`email-row rounded-lg p-3 cursor-pointer ${
                    selectedId === email.id ? "selected" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div
                      className={`flex-shrink-0 h-9 w-9 rounded-full flex items-center justify-center text-sm font-semibold ${getAvatarColor(email.senderName)}`}
                    >
                      {email.senderName.charAt(0).toUpperCase()}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`text-sm truncate ${
                            !email.isRead
                              ? "font-semibold text-foreground"
                              : "text-muted-foreground"
                          }`}
                        >
                          {email.senderName}
                        </span>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {!email.isRead && (
                            <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                          )}
                          <span className="text-xs text-muted-foreground">
                            {formatEmailDate(email.timestamp)}
                          </span>
                        </div>
                      </div>

                      <p
                        className={`text-xs truncate mt-0.5 ${
                          !email.isRead
                            ? "font-medium text-foreground"
                            : "text-muted-foreground"
                        }`}
                      >
                        {email.subject}
                      </p>

                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-muted-foreground truncate flex-1 mr-2">
                          {email.body.substring(0, 80)}
                        </p>
                        <button
                          type="button"
                          data-ocid={`email.star.toggle.${idx + 1}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleStar.mutate(email.id);
                          }}
                          className="flex-shrink-0 text-muted-foreground/50 hover:text-yellow-500 transition-colors"
                        >
                          {email.isStarred ? (
                            <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
                          ) : (
                            <StarOff className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Email detail panel */}
      <div
        data-ocid="email.detail.panel"
        className="flex-1 flex flex-col overflow-hidden"
      >
        <AnimatePresence mode="wait">
          {!selectedEmail ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center gap-4 text-center p-8"
            >
              <div className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center">
                <MailOpen className="h-8 w-8 text-muted-foreground/30" />
              </div>
              <div>
                <p className="font-display font-semibold text-foreground">
                  Select an email
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Choose an email from the list to read it here
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={selectedEmail.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex-1 flex flex-col overflow-hidden"
            >
              {/* Email header */}
              <div className="px-6 py-4 border-b border-border">
                <h3 className="font-display font-semibold text-foreground text-lg leading-tight">
                  {selectedEmail.subject}
                </h3>
                <div className="mt-3 flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 ${getAvatarColor(selectedEmail.senderName)}`}
                    >
                      {selectedEmail.senderName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {selectedEmail.senderName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {selectedEmail.senderEmail}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge variant="outline" className="text-xs">
                      {selectedEmail.category}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatEmailDate(selectedEmail.timestamp)}
                    </span>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2 mt-4">
                  <Button
                    data-ocid="email.reply.button"
                    size="sm"
                    variant="outline"
                    className="gap-2 h-8"
                    onClick={() => toast.success("Reply feature coming soon")}
                  >
                    <Reply className="h-3.5 w-3.5" />
                    Reply
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-2 h-8"
                    onClick={() => toast.success("Forward feature coming soon")}
                  >
                    <Forward className="h-3.5 w-3.5" />
                    Forward
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="gap-2 h-8 ml-auto"
                    onClick={() => {
                      toggleStar.mutate(selectedEmail.id);
                    }}
                  >
                    {selectedEmail.isStarred ? (
                      <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
                    ) : (
                      <Star className="h-3.5 w-3.5" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="gap-2 h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => toast.success("Delete feature coming soon")}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    data-ocid="email.ai_summary.button"
                    size="sm"
                    variant="outline"
                    className="gap-2 h-8 border-primary/30 text-primary hover:bg-primary/10"
                    onClick={handleSummarize}
                    disabled={summarize.isPending}
                  >
                    {summarize.isPending ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Brain className="h-3.5 w-3.5" />
                    )}
                    AI Summary
                  </Button>
                </div>
              </div>

              {/* Email body */}
              <ScrollArea className="flex-1 scrollbar-thin">
                <div className="px-6 py-4 space-y-4">
                  {/* AI Summary box */}
                  <AnimatePresence>
                    {summary && (
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.25 }}
                        className="rounded-xl border border-primary/20 bg-primary/5 p-4"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Brain className="h-4 w-4 text-primary" />
                          <span className="text-sm font-semibold text-primary font-display">
                            AI Summary
                          </span>
                        </div>
                        <p className="text-sm text-foreground/80 leading-relaxed">
                          {summary}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Email body text */}
                  <div className="prose prose-sm max-w-none text-foreground/90">
                    {selectedEmail.body.split("\n").map((line) => (
                      <p
                        key={line.substring(0, 20) || Math.random().toString()}
                        className="text-sm leading-relaxed mb-2 text-foreground/80"
                      >
                        {line || <br />}
                      </p>
                    ))}
                  </div>
                </div>
              </ScrollArea>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
