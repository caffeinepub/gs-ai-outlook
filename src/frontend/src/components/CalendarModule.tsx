import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  CalendarIcon,
  Clock,
  Loader2,
  MapPin,
  Plus,
  Trash2,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import {
  type CalendarEvent,
  useCreateEvent,
  useDeleteEvent,
  useEvents,
} from "../hooks/useQueries";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function bigintToDate(ts: bigint): Date {
  const ms = Number(ts / 1_000_000n);
  if (ms < 1_000_000) return new Date(0);
  return new Date(ms);
}

function formatEventTime(start: bigint, end: bigint): string {
  const s = bigintToDate(start);
  const e = bigintToDate(end);
  if (s.getTime() === 0) return "";
  const opts: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
  };
  return `${s.toLocaleTimeString([], opts)} – ${e.toLocaleTimeString([], opts)}`;
}

function formatEventDate(ts: bigint): string {
  const d = bigintToDate(ts);
  if (d.getTime() === 0) return "";
  return d.toLocaleDateString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

interface NewEventForm {
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
}

interface Props {
  isReady: boolean;
}

export default function CalendarModule({ isReady }: Props) {
  const today = new Date();
  const [viewDate, setViewDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<NewEventForm>({
    title: "",
    description: "",
    location: "",
    startDate: "",
    endDate: "",
  });

  const { data: events = [], isLoading } = useEvents();
  const createEvent = useCreateEvent();
  const deleteEvent = useDeleteEvent();

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Map event dates to day numbers for the current month
  const eventDaySet = new Set<number>();
  for (const ev of events) {
    const d = bigintToDate(ev.startTime);
    if (d.getFullYear() === year && d.getMonth() === month) {
      eventDaySet.add(d.getDate());
    }
  }

  const handleCreateEvent = async () => {
    if (!form.title.trim() || !form.startDate || !form.endDate) {
      toast.error("Please fill in title, start date, and end date");
      return;
    }
    try {
      const startMs = new Date(form.startDate).getTime();
      const endMs = new Date(form.endDate).getTime();
      if (endMs <= startMs) {
        toast.error("End time must be after start time");
        return;
      }
      await createEvent.mutateAsync({
        title: form.title,
        description: form.description,
        location: form.location,
        startTime: BigInt(startMs) * 1_000_000n,
        endTime: BigInt(endMs) * 1_000_000n,
      });
      toast.success("Event created");
      setForm({
        title: "",
        description: "",
        location: "",
        startDate: "",
        endDate: "",
      });
      setDialogOpen(false);
    } catch {
      toast.error("Failed to create event");
    }
  };

  const handleDeleteEvent = async (id: string) => {
    try {
      await deleteEvent.mutateAsync(id);
      toast.success("Event deleted");
    } catch {
      toast.error("Failed to delete event");
    }
  };

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  // Upcoming events sorted
  const upcomingEvents = [...events].sort((a, b) =>
    Number(a.startTime - b.startTime),
  );

  return (
    <div className="flex h-full">
      {/* Calendar grid panel */}
      <div className="w-80 flex-shrink-0 flex flex-col border-r border-border">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <h2 className="font-display font-semibold text-foreground">
            {MONTHS[month]} {year}
          </h2>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={prevMonth}
            >
              <span className="text-sm">‹</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={nextMonth}
            >
              <span className="text-sm">›</span>
            </Button>
          </div>
        </div>

        <div className="px-3 py-3">
          {/* Day labels */}
          <div className="grid grid-cols-7 mb-1">
            {DAYS.map((d) => (
              <div
                key={d}
                className="text-center text-xs text-muted-foreground py-1 font-medium"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 gap-0.5">
            {/* Empty cells for first row */}
            {Array.from({ length: firstDayOfWeek }, (_, i) => `ec${i}`).map(
              (k) => (
                <div key={k} />
              ),
            )}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
              const isToday =
                today.getDate() === day &&
                today.getMonth() === month &&
                today.getFullYear() === year;
              const hasEvents = eventDaySet.has(day);
              return (
                <div
                  key={day}
                  className={`relative h-8 w-full flex flex-col items-center justify-center rounded-md text-sm transition-colors cursor-pointer hover:bg-accent ${
                    isToday
                      ? "bg-primary/20 text-primary font-semibold"
                      : "text-foreground"
                  }`}
                >
                  {day}
                  {hasEvents && (
                    <span className="absolute bottom-1 h-1 w-1 rounded-full bg-primary" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* New event button */}
        <div className="px-3 pb-3 mt-auto">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button
                data-ocid="calendar.new_event.button"
                className="w-full gap-2"
                size="sm"
              >
                <Plus className="h-4 w-4" />
                New Event
              </Button>
            </DialogTrigger>
            <DialogContent
              data-ocid="event.dialog"
              className="sm:max-w-md bg-popover border-border"
            >
              <DialogHeader>
                <DialogTitle className="font-display">
                  New Calendar Event
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">
                    Title *
                  </Label>
                  <Input
                    data-ocid="event.title.input"
                    placeholder="Team standup"
                    value={form.title}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, title: e.target.value }))
                    }
                    className="bg-input border-border"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">
                    Description
                  </Label>
                  <Textarea
                    placeholder="Optional details…"
                    value={form.description}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, description: e.target.value }))
                    }
                    className="bg-input border-border resize-none h-20"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">
                    Location
                  </Label>
                  <Input
                    placeholder="Conference Room A / Zoom link"
                    value={form.location}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, location: e.target.value }))
                    }
                    className="bg-input border-border"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">
                      Start *
                    </Label>
                    <Input
                      type="datetime-local"
                      value={form.startDate}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, startDate: e.target.value }))
                      }
                      className="bg-input border-border text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">
                      End *
                    </Label>
                    <Input
                      type="datetime-local"
                      value={form.endDate}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, endDate: e.target.value }))
                      }
                      className="bg-input border-border text-xs"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="ghost"
                  onClick={() => setDialogOpen(false)}
                  className="text-muted-foreground"
                >
                  Cancel
                </Button>
                <Button
                  data-ocid="event.submit_button"
                  onClick={handleCreateEvent}
                  disabled={createEvent.isPending}
                  className="gap-2"
                >
                  {createEvent.isPending && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  Create Event
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Events list panel */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="font-display font-semibold text-foreground">
            Upcoming Events
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {events.length} events scheduled
          </p>
        </div>

        <ScrollArea className="flex-1 scrollbar-thin">
          {isLoading || !isReady ? (
            <div className="p-4 space-y-3">
              {["s1", "s2", "s3", "s4"].map((k) => (
                <Skeleton key={k} className="h-20 w-full rounded-xl" />
              ))}
            </div>
          ) : upcomingEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 gap-3 text-center px-6">
              <CalendarIcon className="h-10 w-10 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">
                No upcoming events
              </p>
              <p className="text-xs text-muted-foreground/60">
                Click "New Event" to add one
              </p>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {upcomingEvents.map((event, idx) => (
                <EventCard
                  key={event.id}
                  event={event}
                  idx={idx}
                  onDelete={handleDeleteEvent}
                  isDeleting={deleteEvent.isPending}
                  formatDate={formatEventDate}
                  formatTime={formatEventTime}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}

function EventCard({
  event,
  idx,
  onDelete,
  isDeleting,
  formatDate,
  formatTime,
}: {
  event: CalendarEvent;
  idx: number;
  onDelete: (id: string) => void;
  isDeleting: boolean;
  formatDate: (ts: bigint) => string;
  formatTime: (s: bigint, e: bigint) => string;
}) {
  return (
    <motion.div
      data-ocid={`calendar.event.item.${idx + 1}`}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: idx * 0.04 }}
      className="rounded-xl border border-border bg-card p-4 group hover:border-primary/20 transition-colors"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm text-foreground truncate font-display">
            {event.title}
          </h4>
          {event.description && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {event.description}
            </p>
          )}
          <div className="flex flex-wrap gap-3 mt-2">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <CalendarIcon className="h-3 w-3" />
              <span>{formatDate(event.startTime)}</span>
            </div>
            {formatTime(event.startTime, event.endTime) && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{formatTime(event.startTime, event.endTime)}</span>
              </div>
            )}
            {event.location && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <span className="truncate max-w-[120px]">{event.location}</span>
              </div>
            )}
          </div>
        </div>
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7 text-muted-foreground/0 group-hover:text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
          onClick={() => onDelete(event.id)}
          disabled={isDeleting}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </motion.div>
  );
}
