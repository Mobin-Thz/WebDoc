import type { Access, Where } from 'payload'

export const adminsOnly: Access = ({ req }) => Boolean(req.user)

const publishedChapter: Where = {
  and: [
    { _status: { equals: 'published' } },
    { 'subject._status': { equals: 'published' } },
  ],
}

const publishedLesson: Where = {
  and: [
    { _status: { equals: 'published' } },
    { 'chapter._status': { equals: 'published' } },
    { 'chapter.subject._status': { equals: 'published' } },
  ],
}

export const publishedOrAdmin: Access = ({ req }) =>
  req.user
    ? true
    : {
        _status: { equals: 'published' },
      }

export const publishedChapterOrAdmin: Access = ({ req }) =>
  req.user ? true : publishedChapter

export const publishedLessonOrAdmin: Access = ({ req }) =>
  req.user ? true : publishedLesson
