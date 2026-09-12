'use client'

import { useEffect, useMemo, useSyncExternalStore } from 'react'

export const PROGRESS_KEY = 'webdoc:visited-lessons:v1'

const readVisited = () => {
  try { return new Set<string>(JSON.parse(localStorage.getItem(PROGRESS_KEY) ?? '[]')) } catch { return new Set<string>() }
}

export function MarkLessonVisited({ lessonID }: { lessonID: number }) {
  useEffect(() => {
    const visited = readVisited()
    visited.add(String(lessonID))
    localStorage.setItem(PROGRESS_KEY, JSON.stringify([...visited]))
  }, [lessonID])
  return null
}

export function ChapterProgress({ lessonIDs }: { lessonIDs: number[] }) {
  const stored = useSyncExternalStore(
    () => () => undefined,
    () => localStorage.getItem(PROGRESS_KEY) ?? '[]',
    () => '[]',
  )
  const seen = useMemo(() => {
    try {
      const visited = new Set<string>(JSON.parse(stored))
      return lessonIDs.filter((id) => visited.has(String(id))).length
    } catch {
      return 0
    }
  }, [lessonIDs, stored])
  const percentage = lessonIDs.length ? Math.round((seen / lessonIDs.length) * 100) : 0
  return (
    <div className="progress" aria-label={`${percentage}% of this chapter visited`}>
      <div><span>Reading progress</span><span>{seen}/{lessonIDs.length} lessons</span></div>
      <progress max={lessonIDs.length || 1} value={seen}>{percentage}%</progress>
    </div>
  )
}
