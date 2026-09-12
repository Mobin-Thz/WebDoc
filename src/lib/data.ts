import config from '@payload-config'
import { draftMode } from 'next/headers'
import { getPayload } from 'payload'

import type { Chapter, Lesson, Search, Subject } from '@/payload-types'

const cms = () => getPayload({ config })
const access = async () => {
  const preview = (await draftMode()).isEnabled
  return { draft: preview, overrideAccess: preview }
}

export async function getSubjects(featured?: boolean) {
  const payload = await cms()
  const result = await payload.find({
    collection: 'subjects',
    depth: 1,
    limit: 100,
    ...(await access()),
    sort: 'displayOrder',
    where: featured ? { featured: { equals: true } } : undefined,
  })
  return result.docs as Subject[]
}

export async function getSubject(slug: string) {
  const payload = await cms()
  const result = await payload.find({
    collection: 'subjects',
    depth: 1,
    limit: 1,
    ...(await access()),
    where: { slug: { equals: slug } },
  })
  return result.docs[0] as Subject | undefined
}

export async function getChapters(subjectID: number) {
  const payload = await cms()
  const result = await payload.find({
    collection: 'chapters',
    depth: 1,
    limit: 100,
    ...(await access()),
    sort: 'displayOrder',
    where: { subject: { equals: subjectID } },
  })
  return result.docs as Chapter[]
}

export async function getChapter(subjectID: number, slug: string) {
  const payload = await cms()
  const result = await payload.find({
    collection: 'chapters',
    depth: 1,
    limit: 1,
    ...(await access()),
    where: { and: [{ subject: { equals: subjectID } }, { slug: { equals: slug } }] },
  })
  return result.docs[0] as Chapter | undefined
}

export async function getLessons(chapterID: number) {
  const payload = await cms()
  const result = await payload.find({
    collection: 'lessons',
    depth: 2,
    limit: 500,
    ...(await access()),
    sort: 'displayOrder',
    where: { chapter: { equals: chapterID } },
  })
  return result.docs as Lesson[]
}

export async function getLesson(slug: string) {
  const payload = await cms()
  const result = await payload.find({
    collection: 'lessons',
    depth: 3,
    limit: 1,
    ...(await access()),
    where: { slug: { equals: slug } },
  })
  return result.docs[0] as Lesson | undefined
}

export async function getRecentLessons(limit = 6) {
  const payload = await cms()
  const result = await payload.find({
    collection: 'lessons',
    depth: 2,
    limit,
    ...(await access()),
    sort: '-updatedAt',
  })
  return result.docs as Lesson[]
}

export async function searchLessons(query: string) {
  if (!query.trim()) return []
  const payload = await cms()
  const result = await payload.find({
    collection: 'search',
    depth: 2,
    limit: 50,
    overrideAccess: false,
    sort: '-priority',
    where: {
      or: [
        { title: { like: query } },
        { summary: { like: query } },
        { content: { like: query } },
      ],
    },
  })
  return result.docs as Search[]
}

export const relation = <T extends { id: number }>(value: number | T): T | null =>
  typeof value === 'object' ? value : null
