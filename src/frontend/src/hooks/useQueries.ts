import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CalendarEvent, Email, Task } from "../backend";
import { useActor } from "./useActor";
import { useInternetIdentity } from "./useInternetIdentity";

export type { Email, CalendarEvent, Task };

function useIsReady() {
  const { identity } = useInternetIdentity();
  const { actor, isFetching } = useActor();
  return !!identity && !!actor && !isFetching;
}

export function useEmails() {
  const { actor } = useActor();
  const isReady = useIsReady();
  return useQuery<Email[]>({
    queryKey: ["emails"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getEmails();
    },
    enabled: isReady,
    staleTime: 30_000,
  });
}

export function useEmailById(id: string | null) {
  const { actor } = useActor();
  const isReady = useIsReady();
  return useQuery<Email | null>({
    queryKey: ["email", id],
    queryFn: async () => {
      if (!actor || !id) return null;
      return actor.getEmailById(id);
    },
    enabled: isReady && !!id,
  });
}

export function useEvents() {
  const { actor } = useActor();
  const isReady = useIsReady();
  return useQuery<CalendarEvent[]>({
    queryKey: ["events"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getEvents();
    },
    enabled: isReady,
    staleTime: 30_000,
  });
}

export function useTasks() {
  const { actor } = useActor();
  const isReady = useIsReady();
  return useQuery<Task[]>({
    queryKey: ["tasks"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTasks();
    },
    enabled: isReady,
    staleTime: 30_000,
  });
}

export function useMarkEmailRead() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("No actor");
      await actor.markEmailRead(id);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["emails"] });
    },
  });
}

export function useToggleStar() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("No actor");
      await actor.toggleStarEmail(id);
    },
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ["emails"] });
      const prev = qc.getQueryData<Email[]>(["emails"]);
      qc.setQueryData<Email[]>(["emails"], (old) =>
        old?.map((e) => (e.id === id ? { ...e, isStarred: !e.isStarred } : e)),
      );
      return { prev };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.prev) qc.setQueryData(["emails"], ctx.prev);
    },
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: ["emails"] });
    },
  });
}

export function useSummarizeEmail() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("No actor");
      return actor.summarizeEmail(id);
    },
  });
}

export function useRewriteBody() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({ body, tone }: { body: string; tone: string }) => {
      if (!actor) throw new Error("No actor");
      return actor.rewriteBody(body, tone);
    },
  });
}

export function useCreateEvent() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      title: string;
      description: string;
      startTime: bigint;
      endTime: bigint;
      location: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.createEvent(
        params.title,
        params.description,
        params.startTime,
        params.endTime,
        params.location,
      );
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["events"] });
    },
  });
}

export function useDeleteEvent() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("No actor");
      await actor.deleteEvent(id);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["events"] });
    },
  });
}

export function useCreateTask() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      title: string;
      dueDate: bigint;
      priority: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.createTask(params.title, params.dueDate, params.priority);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

export function useToggleTask() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("No actor");
      await actor.toggleTask(id);
    },
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ["tasks"] });
      const prev = qc.getQueryData<Task[]>(["tasks"]);
      qc.setQueryData<Task[]>(["tasks"], (old) =>
        old?.map((t) =>
          t.id === id ? { ...t, isCompleted: !t.isCompleted } : t,
        ),
      );
      return { prev };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.prev) qc.setQueryData(["tasks"], ctx.prev);
    },
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

export function useDeleteTask() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("No actor");
      await actor.deleteTask(id);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}
