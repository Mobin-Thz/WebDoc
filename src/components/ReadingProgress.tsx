"use client";

import { useEffect, useMemo, useSyncExternalStore } from "react";

import { Progress } from "@/components/ui/progress";

export const PROGRESS_KEY = "webdoc:visited-lessons:v1";
type Listener = () => void;

const listeners = new Set<Listener>();

const parseVisited = (value: string | null): Set<string> => {
  try {
    const parsed: unknown = JSON.parse(value ?? "[]");
    return new Set(
      Array.isArray(parsed)
        ? parsed.filter((item): item is string => typeof item === "string")
        : [],
    );
  } catch {
    return new Set();
  }
};

const readVisited = () => parseVisited(localStorage.getItem(PROGRESS_KEY));

const notifyProgressChanged = () => listeners.forEach((listener) => listener());

const subscribeToProgress = (listener: Listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const getProgressSnapshot = () => localStorage.getItem(PROGRESS_KEY) ?? "[]";

export function MarkLessonVisited({ lessonID }: { lessonID: number }) {
  useEffect(() => {
    const visited = readVisited();
    visited.add(String(lessonID));
    localStorage.setItem(PROGRESS_KEY, JSON.stringify([...visited]));
    notifyProgressChanged();
  }, [lessonID]);
  return null;
}

export function ChapterProgress({ lessonIDs }: { lessonIDs: number[] }) {
  const stored = useSyncExternalStore(
    subscribeToProgress,
    getProgressSnapshot,
    () => "[]",
  );
  const seen = useMemo(() => {
    const visited = parseVisited(stored);
    return lessonIDs.filter((id) => visited.has(String(id))).length;
  }, [lessonIDs, stored]);
  const percentage = lessonIDs.length
    ? Math.round((seen / lessonIDs.length) * 100)
    : 0;
  return (
    <div
      className="progress"
      aria-label={`${percentage}% of this chapter visited`}
    >
      <div>
        <span>Reading progress</span>
        <span>
          {seen}/{lessonIDs.length} lessons
        </span>
      </div>
      <Progress max={100} value={percentage} aria-label={`${percentage}% of this chapter visited`} />
    </div>
  );
}
