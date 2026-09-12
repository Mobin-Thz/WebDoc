import { describe, expect, it } from 'vitest'

import { adminsOnly, publishedChapterOrAdmin, publishedLessonOrAdmin, publishedOrAdmin } from '@/access'

const call = (access: typeof adminsOnly, user: unknown = null) => access({ req: { user } } as never)

describe('CMS access rules', () => {
  it('requires authentication for mutations', () => {
    expect(call(adminsOnly)).toBe(false)
    expect(call(adminsOnly, { id: 1 })).toBe(true)
  })

  it('limits public reads to published documents and ancestors', () => {
    expect(call(publishedOrAdmin)).toEqual({ _status: { equals: 'published' } })
    expect(call(publishedChapterOrAdmin)).toMatchObject({ and: expect.any(Array) })
    expect(call(publishedLessonOrAdmin)).toMatchObject({ and: expect.any(Array) })
    expect(call(publishedLessonOrAdmin, { id: 1 })).toBe(true)
  })
})
