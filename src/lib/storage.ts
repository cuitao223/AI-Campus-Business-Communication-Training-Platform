"use client";

import type { Report, TrainingSession } from "@/types";

const sessionKey = "ai-campus-negotiation-sessions";
const reportKey = "ai-campus-negotiation-reports";

export function loadSessions(): TrainingSession[] {
  return readJson<TrainingSession[]>(sessionKey, []);
}

export function getStoredSession(id: string) {
  return loadSessions().find((session) => session.id === id) ?? null;
}

export function saveSession(session: TrainingSession) {
  const sessions = loadSessions().filter((item) => item.id !== session.id);
  localStorage.setItem(sessionKey, JSON.stringify([session, ...sessions].slice(0, 20)));
}

export function saveReport(sessionId: string, report: Report) {
  const reports = readJson<Record<string, Report>>(reportKey, {});
  localStorage.setItem(reportKey, JSON.stringify({ ...reports, [sessionId]: report }));
}

export function getStoredReport(sessionId: string) {
  return readJson<Record<string, Report>>(reportKey, {})[sessionId] ?? null;
}

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const value = localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}
