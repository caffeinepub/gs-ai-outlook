import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Task {
    id: string;
    title: string;
    isCompleted: boolean;
    dueDate: bigint;
    priority: string;
}
export interface CalendarEvent {
    id: string;
    startTime: bigint;
    title: string;
    endTime: bigint;
    description: string;
    location: string;
}
export interface UserProfile {
    name: string;
}
export interface Email {
    id: string;
    subject: string;
    isStarred: boolean;
    body: string;
    isRead: boolean;
    timestamp: bigint;
    senderName: string;
    category: string;
    senderEmail: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createEvent(title: string, description: string, startTime: bigint, endTime: bigint, location: string): Promise<CalendarEvent>;
    createTask(title: string, dueDate: bigint, priority: string): Promise<Task>;
    deleteEvent(id: string): Promise<void>;
    deleteTask(id: string): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getEmailById(id: string): Promise<Email | null>;
    getEmails(): Promise<Array<Email>>;
    getEvents(): Promise<Array<CalendarEvent>>;
    getTasks(): Promise<Array<Task>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    initDemoData(): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    markEmailRead(id: string): Promise<void>;
    rewriteBody(body: string, tone: string): Promise<string>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    summarizeEmail(id: string): Promise<string>;
    toggleStarEmail(id: string): Promise<void>;
    toggleTask(id: string): Promise<void>;
}
