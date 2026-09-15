import type { Endpoint, PayloadRequest } from 'payload'

import {
  MarkdownError,
  exportLessonMarkdown,
  importLessonMarkdown,
  lessonMarkdownEditorConfig,
} from '../lib/lesson-markdown'

const badRequest = (message: string, status = 400) => Response.json({ message }, { status })

const json = async (req: PayloadRequest) => {
  try {
    const value = req.json ? await req.json() : null
    return value && typeof value === 'object' ? value as Record<string, unknown> : null
  } catch {
    return null
  }
}

const validateMedia = async (req: PayloadRequest, ids: string[]) => {
  for (const id of ids) {
    try {
      await req.payload.findByID({ collection: 'media', id, req })
    } catch {
      throw new MarkdownError(`Media ${id} does not exist in this CMS.`)
    }
  }
}

const resolveInternalDoc = async (req: PayloadRequest, relationTo: string, value: unknown) => {
  if (!['subjects', 'chapters', 'lessons'].includes(relationTo)) return null
  const embedded = value && typeof value === 'object' ? value as { id?: unknown; slug?: unknown; subject?: unknown } : undefined
  const id = embedded?.id ?? value
  const doc = typeof embedded?.slug === 'string'
    ? embedded
    : await req.payload.findByID({ collection: relationTo as 'subjects' | 'chapters' | 'lessons', depth: 1, id: String(id), req }) as { slug?: unknown; subject?: unknown }
  if (typeof doc.slug !== 'string') return null
  if (relationTo !== 'chapters') return { slug: doc.slug }
  const subject = doc.subject && typeof doc.subject === 'object' ? doc.subject as { id?: unknown; slug?: unknown } : undefined
  const subjectID = subject?.id ?? doc.subject
  const subjectDoc = typeof subject?.slug === 'string'
    ? subject
    : await req.payload.findByID({ collection: 'subjects', id: String(subjectID), req }) as { slug?: unknown }
  return typeof subjectDoc.slug === 'string' ? { slug: doc.slug, subjectSlug: subjectDoc.slug } : null
}

const importMarkdown: Endpoint['handler'] = async (req) => {
  if (!req.user) return badRequest('Unauthorized.', 401)
  const body = await json(req)
  if (typeof body?.markdown !== 'string' || typeof body.filename !== 'string') return badRequest('markdown and filename are required.')
  try {
    const result = await importLessonMarkdown({
      editorConfig: lessonMarkdownEditorConfig(req.payload.config),
      filename: body.filename,
      markdown: body.markdown,
      validateMedia: (ids) => validateMedia(req, ids),
    })
    return Response.json(result)
  } catch (error) {
    return badRequest(error instanceof Error ? error.message : 'Markdown import failed.')
  }
}

const exportMarkdown: Endpoint['handler'] = async (req) => {
  if (!req.user) return badRequest('Unauthorized.', 401)
  const body = await json(req)
  if (
    typeof body?.title !== 'string' || typeof body.slug !== 'string' || typeof body.summary !== 'string' ||
    typeof body.displayOrder !== 'number' || !body.content || typeof body.content !== 'object'
  ) return badRequest('title, slug, summary, displayOrder, and content are required.')
  try {
    const markdown = await exportLessonMarkdown({
      content: body.content as { root?: { type?: string } },
      displayOrder: body.displayOrder,
      editorConfig: lessonMarkdownEditorConfig(req.payload.config),
      resolveInternalDoc: (relationTo, value) => resolveInternalDoc(req, relationTo, value),
      slug: body.slug,
      summary: body.summary,
      title: body.title,
    })
    const filename = `${body.slug.replace(/[^a-z0-9-]/gi, '-') || 'lesson'}.md`
    return new Response(markdown, {
      headers: {
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Type': 'text/markdown; charset=utf-8',
      },
    })
  } catch (error) {
    return badRequest(error instanceof Error ? error.message : 'Markdown export failed.')
  }
}

export const lessonMarkdownEndpoints: Endpoint[] = [
  { handler: importMarkdown, method: 'post', path: '/markdown/import' },
  { handler: exportMarkdown, method: 'post', path: '/markdown/export' },
]
