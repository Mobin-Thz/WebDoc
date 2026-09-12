import type { MetadataRoute } from 'next'

import { getChapters, getLessons, getSubjects } from '@/lib/data'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SERVER_URL ?? 'http://localhost:3000'
  const subjects = await getSubjects()
  const entries: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/subjects`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/about`, changeFrequency: 'monthly', priority: 0.3 },
  ]
  for (const subject of subjects) {
    entries.push({ url: `${base}/subjects/${subject.slug}`, lastModified: subject.updatedAt, priority: 0.8 })
    const chapters = await getChapters(subject.id)
    for (const chapter of chapters) {
      entries.push({ url: `${base}/subjects/${subject.slug}/${chapter.slug}`, lastModified: chapter.updatedAt, priority: 0.7 })
      const lessons = await getLessons(chapter.id)
      entries.push(...lessons.map((lesson) => ({ url: `${base}/lessons/${lesson.slug}`, lastModified: lesson.updatedAt, priority: 0.6 })))
    }
  }
  return entries
}
