import config from '@payload-config'
import { describe, expect, it } from 'vitest'

import {
  MarkdownError,
  exportLessonMarkdown,
  importLessonMarkdown,
  lessonMarkdownEditorConfig,
} from '@/lib/lesson-markdown'
import { LESSON_MARKDOWN_TEMPLATE } from '@/lib/lesson-markdown-template'
import { lessonMarkdownEndpoints } from '@/collections/lessonMarkdownEndpoints'

const editorConfig = lessonMarkdownEditorConfig(await config)

describe('lesson Markdown', () => {
  it('imports YAML, normalizes CRLF, and removes the title heading', async () => {
    const result = await importLessonMarkdown({
      editorConfig,
      filename: 'fallback-title.md',
      markdown: '\uFEFF---\r\ntitle: Frontmatter title\r\nsummary: |\r\n  A multiline\r\n  summary.\r\ndisplayOrder: 4\r\n---\r\n\r\n# Ignored title\r\n\r\n## Body\r\n\r\nText.',
    })

    expect(result.metadata).toEqual({ displayOrder: 4, slug: 'frontmatter-title', summary: 'A multiline\nsummary.', title: 'Frontmatter title' })
    expect(result.content.root.children).toHaveLength(2)
    expect(result.content.root.children[0]).toMatchObject({ tag: 'h2', type: 'heading' })
  })

  it('round-trips editor blocks and uses a safe code fence', async () => {
    const tick = String.fromCharCode(96)
    const fence = tick.repeat(3)
    const result = await importLessonMarkdown({
      editorConfig,
      filename: 'lesson.md',
      markdown: ['# Lesson', '', 'Intro.', '', `${fence}bash`, `echo ${fence}`, fence, '', '<callout kind="tip">Safe.</callout>', '', '<youtube url="https://youtu.be/abc123" title="Watch" />'].join('\n'),
    })
    const markdown = await exportLessonMarkdown({ ...result.metadata, content: result.content, editorConfig })

    expect(markdown).toContain(tick.repeat(4) + 'bash')
    expect(markdown).toContain('<callout kind="tip">')
    expect(markdown).toContain('<youtube title="Watch" url="https://youtu.be/abc123"/>')
  })

  it('rejects unsafe and unsupported input before conversion', async () => {
    await expect(importLessonMarkdown({ editorConfig, filename: 'bad.md', markdown: '# Bad\n\n[Click](javascript:alert(1))' })).rejects.toBeInstanceOf(MarkdownError)
    await expect(importLessonMarkdown({ editorConfig, filename: 'bad.md', markdown: '# Bad\n\n| one | two |\n| --- | --- |' })).rejects.toBeInstanceOf(MarkdownError)
    await expect(importLessonMarkdown({ editorConfig, filename: 'bad.md', markdown: '# Bad\n\n<unknown />' })).rejects.toBeInstanceOf(MarkdownError)
  })

  it('validates media references and the downloadable template', async () => {
    await importLessonMarkdown({ editorConfig, filename: 'media.md', markdown: '# Media\n\n![media:42]()', validateMedia: async (ids) => expect(ids).toEqual(['42']) })
    await expect(importLessonMarkdown({ editorConfig, filename: 'template.md', markdown: LESSON_MARKDOWN_TEMPLATE })).resolves.toMatchObject({ metadata: { slug: 'working-with-files' } })
  })

  it('exports internal document links as site-relative URLs', async () => {
    const imported = await importLessonMarkdown({ editorConfig, filename: 'lesson.md', markdown: '# Lesson\n\n[Read more](/placeholder)' })
    const link = imported.content.root.children[0]?.children?.[0]
    if (!link?.fields) throw new Error('Expected imported Markdown link.')
    link.fields = { doc: { relationTo: 'lessons', value: 'lesson-id' }, linkType: 'internal' }
    const markdown = await exportLessonMarkdown({
      content: imported.content,
      displayOrder: imported.metadata.displayOrder,
      editorConfig,
      resolveInternalDoc: async () => ({ slug: 'next-lesson' }),
      slug: imported.metadata.slug, summary: imported.metadata.summary, title: imported.metadata.title,
    })
    expect(markdown).toContain('[Read more](/lessons/next-lesson)')
  })

  it('does not expose conversion endpoints to anonymous visitors', async () => {
    for (const endpoint of lessonMarkdownEndpoints.filter((endpoint) => endpoint.path?.startsWith('/markdown/'))) {
      expect((await endpoint.handler({ user: null } as never) as Response).status).toBe(401)
    }
  })
})
