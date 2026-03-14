import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, CheckSquare, Loader2, Plus, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import {
  type Task,
  useCreateTask,
  useDeleteTask,
  useTasks,
  useToggleTask,
} from "../hooks/useQueries";

function formatDueDate(ts: bigint): string {
  const ms = Number(ts / 1_000_000n);
  if (ms < 1_000_000) return "";
  const d = new Date(ms);
  const now = new Date();
  const diff = d.getTime() - now.getTime();
  if (diff < 0)
    return `Overdue · ${d.toLocaleDateString([], { month: "short", day: "numeric" })}`;
  if (diff < 24 * 60 * 60 * 1000) return "Due today";
  if (diff < 2 * 24 * 60 * 60 * 1000) return "Due tomorrow";
  return `Due ${d.toLocaleDateString([], { month: "short", day: "numeric" })}`;
}

function PriorityBadge({ priority }: { priority: string }) {
  const p = priority.toLowerCase();
  const cls =
    p === "high"
      ? "priority-high"
      : p === "medium"
        ? "priority-medium"
        : "priority-low";
  return (
    <span
      className={`${cls} inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium`}
    >
      {priority}
    </span>
  );
}

interface Props {
  isReady: boolean;
}

export default function TasksModule({ isReady }: Props) {
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");

  const { data: tasks = [], isLoading } = useTasks();
  const createTask = useCreateTask();
  const toggleTask = useToggleTask();
  const deleteTask = useDeleteTask();

  const filteredTasks = tasks.filter((t) => {
    if (filter === "active") return !t.isCompleted;
    if (filter === "completed") return t.isCompleted;
    return true;
  });

  const handleCreate = async () => {
    if (!title.trim()) {
      toast.error("Please enter a task title");
      return;
    }
    try {
      const dueDateMs = dueDate
        ? BigInt(new Date(dueDate).getTime()) * 1_000_000n
        : BigInt(Date.now() + 7 * 24 * 60 * 60 * 1000) * 1_000_000n;
      await createTask.mutateAsync({ title, dueDate: dueDateMs, priority });
      toast.success("Task created");
      setTitle("");
      setDueDate("");
      setPriority("Medium");
    } catch {
      toast.error("Failed to create task");
    }
  };

  const handleToggle = (id: string) => {
    toggleTask.mutate(id);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTask.mutateAsync(id);
      toast.success("Task deleted");
    } catch {
      toast.error("Failed to delete task");
    }
  };

  const completedCount = tasks.filter((t) => t.isCompleted).length;
  const totalCount = tasks.length;

  return (
    <div className="flex h-full">
      {/* Add task + filters panel */}
      <div className="w-80 flex-shrink-0 flex flex-col border-r border-border">
        <div className="px-4 py-3 border-b border-border">
          <h2 className="font-display font-semibold text-foreground">Tasks</h2>
          {totalCount > 0 && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {completedCount} of {totalCount} completed
            </p>
          )}
        </div>

        {/* Progress bar */}
        {totalCount > 0 && (
          <div className="px-4 py-3 border-b border-border">
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${(completedCount / totalCount) * 100}%` }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1.5">
              {Math.round((completedCount / totalCount) * 100)}% done
            </p>
          </div>
        )}

        {/* Add task form */}
        <div className="px-4 py-4 border-b border-border space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            New Task
          </p>
          <Input
            placeholder="Task title…"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            className="bg-input border-border h-9"
          />
          <Input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="bg-input border-border h-9 text-sm"
          />
          <div className="flex gap-2">
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger className="flex-1 h-9 bg-input border-border text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Button
              data-ocid="tasks.add.button"
              size="sm"
              className="h-9 px-3 gap-1"
              onClick={handleCreate}
              disabled={createTask.isPending}
            >
              {createTask.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              Add
            </Button>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="px-4 py-3 border-b border-border">
          <div className="flex gap-1">
            {(["all", "active", "completed"] as const).map((f) => (
              <button
                type="button"
                key={f}
                onClick={() => setFilter(f)}
                className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-all capitalize ${
                  filter === f
                    ? "bg-primary/20 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tasks list */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="font-display font-semibold text-foreground capitalize">
            {filter === "all"
              ? "All Tasks"
              : filter === "active"
                ? "Active Tasks"
                : "Completed Tasks"}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {filteredTasks.length}{" "}
            {filteredTasks.length === 1 ? "task" : "tasks"}
          </p>
        </div>

        <ScrollArea className="flex-1 scrollbar-thin">
          {isLoading || !isReady ? (
            <div className="p-4 space-y-3">
              {["s1", "s2", "s3", "s4", "s5"].map((k) => (
                <Skeleton key={k} className="h-16 w-full rounded-xl" />
              ))}
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 gap-3 text-center px-6">
              <CheckSquare className="h-10 w-10 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">
                {filter === "completed"
                  ? "No completed tasks yet"
                  : "No tasks here"}
              </p>
            </div>
          ) : (
            <div className="p-4 space-y-2">
              <AnimatePresence>
                {filteredTasks.map((task, idx) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    idx={idx}
                    onToggle={handleToggle}
                    onDelete={handleDelete}
                    isDeleting={deleteTask.isPending}
                    formatDue={formatDueDate}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}

function TaskRow({
  task,
  idx,
  onToggle,
  onDelete,
  isDeleting,
  formatDue,
}: {
  task: Task;
  idx: number;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
  formatDue: (ts: bigint) => string;
}) {
  const dueText = formatDue(task.dueDate);
  const isOverdue = dueText.startsWith("Overdue");

  return (
    <motion.div
      data-ocid={`tasks.item.${idx + 1}`}
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2, delay: idx * 0.03 }}
      className={`rounded-xl border p-4 group transition-colors ${
        task.isCompleted
          ? "border-border bg-card/40 opacity-60"
          : "border-border bg-card hover:border-primary/20"
      }`}
    >
      <div className="flex items-center gap-3">
        <Checkbox
          data-ocid={`tasks.checkbox.${idx + 1}`}
          checked={task.isCompleted}
          onCheckedChange={() => onToggle(task.id)}
          className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
        />
        <div className="flex-1 min-w-0">
          <p
            className={`text-sm font-medium leading-snug ${
              task.isCompleted
                ? "line-through text-muted-foreground"
                : "text-foreground"
            }`}
          >
            {task.title}
          </p>
          <div className="flex items-center gap-2 mt-1.5">
            <PriorityBadge priority={task.priority} />
            {dueText && (
              <div
                className={`flex items-center gap-1 text-xs ${
                  isOverdue ? "text-destructive" : "text-muted-foreground"
                }`}
              >
                <Calendar className="h-3 w-3" />
                <span>{dueText}</span>
              </div>
            )}
          </div>
        </div>
        <Button
          data-ocid={`tasks.delete_button.${idx + 1}`}
          size="icon"
          variant="ghost"
          className="h-7 w-7 text-muted-foreground/0 group-hover:text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all flex-shrink-0"
          onClick={() => onDelete(task.id)}
          disabled={isDeleting}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </motion.div>
  );
}
