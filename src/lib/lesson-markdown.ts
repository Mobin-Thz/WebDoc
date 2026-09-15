import {
  convertLexicalToMarkdown,
  convertMarkdownToLexical,
  type SanitizedServerEditorConfig,
} from '@payloadcms/richtext-lexical'
import type { SanitizedConfig } from 'payload'
import { parseDocument, stringify } from 'yaml'

import { getYouTubeID } from '@/blocks/YouTube'
import { slugify } from '@/lib/slug'

export const MARKDOWN_MAX_BYTES = 1_000_000
export const MARKDOWN_EXPORT_MAX_BYTES = 10_000_000
export const codeLanguages = ['text', 'bash', 'css', 'html', 'javascript', 'json', 'python', 'sql', 'typescript'] as const

export type LessonMarkdownMetadata = {
  displayOrder: number
  slug: string
  summary: string
  title: string
}

type Node = { children?: Node[]; fields?: Record<string, unknown>; format?: unknown; tag?: string; text?: string; type?: string; value?: unknown; version?: number }

export class MarkdownError extends Error {}

const plainText = (node?: Node): string =>
  typeof node?.text === 'string' ? node.text : (node?.children ?? []).map(plainText).join(' ').replace(/\s+/g, ' ').trim()

const fail = (message: string): never => {
  throw new MarkdownError(message)
}

const normalizeSource = (markdown: string) => markdown.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n')

const filenameTitle = (filename: string) =>
  filename.replace(/^.*[\\/]/, '').replace(/\.md$/i, '').replace(/[-_]+/g, ' ').trim() || 'Untitled lesson'

const parseFrontmatter = (markdown: string) => {
  if (!markdown.startsWith('---\n')) return { body: markdown, values: {} as Record<string, unknown> }
  const end = markdown.indexOf('\n---', 4)
  if (end < 0) fail('Frontmatter must end with a closing --- line.')
  const closingLineEnd = markdown.indexOf('\n', end + 4)
  const source = markdown.slice(4, end)
  const document = parseDocument(source, { uniqueKeys: true })
  if (document.errors.length) fail(`Invalid frontmatter: ${document.errors[0].message}`)
  const values = document.toJS()
  if (values === null) return { body: closingLineEnd < 0 ? '' : markdown.slice(closingLineEnd + 1), values: {} as Record<string, unknown> }
  if (!values || Array.isArray(values) || typeof values !== 'object') fail('Frontmatter must be a mapping.')
  const allowed = new Set(['title', 'slug', 'summary', 'displayOrder'])
  for (const key of Object.keys(values)) if (!allowed.has(key)) fail(`Unsupported frontmatter field: ${key}.`)
  for (const field of ['title', 'slug', 'summary']) {
    if (field in values && typeof values[field] !== 'string') fail(`${field} must be a string.`)
  }
  if ('displayOrder' in values && (typeof values.displayOrder !== 'number' || !Number.isFinite(values.displayOrder))) {
    fail('displayOrder must be a number.')
  }
  return { body: closingLineEnd < 0 ? '' : markdown.slice(closingLineEnd + 1), values: values as Record<string, unknown> }
}

const leadingH1 = (markdown: string) => {
  const lines = markdown.split('\n')
  const index = lines.findIndex((line) => line.trim())
  if (index < 0) return { body: markdown, title: '' }
  const match = lines[index].match(/^\s*#\s+(.+?)\s*#*\s*$/)
  if (!match) return { body: markdown, title: '' }
  lines.splice(index, 1)
  return { body: lines.join('\n').replace(/^\n+/, ''), title: match[1].trim() }
}

const normalizeHeadings = (markdown: string) => {
  let fenceLength = 0
  return markdown.split('\n').map((line) => {
    const fence = line.match(/^\s*(`{3,})([\w-]+)?\s*$/)
    if (!fenceLength && fence) {
      fenceLength = fence[1].length
      return line
    }
    if (fenceLength) {
      if (fence && fence[1].length >= fenceLength && !fence[2]) fenceLength = 0
      return line
    }
    const match = line.match(/^(\s*)(#{1,})(\s+)/)
    if (!match) return line
    return `${match[1]}${'#'.repeat(Math.min(4, Math.max(2, match[2].length)))}${match[3]}${line.slice(match[0].length)}`
  }).join('\n')
}

const extractCodeBlocks = (markdown: string) => {
  const blocks = new Map<string, Node>()
  const lines = markdown.split('\n')
  const output: string[] = []
  let code: string[] = []
  let fenceLength = 0
  let language = 'text'
  for (const line of lines) {
    const fence = line.match(/^\s*(`{3,})([\w-]+)?\s*$/)
    if (!fenceLength && fence) {
      language = fence[2] || 'text'
      if (!codeLanguages.includes(language as (typeof codeLanguages)[number])) fail(`Unsupported code language: ${language}.`)
      fenceLength = fence[1].length
      code = []
      continue
    }
    if (fenceLength) {
      if (fence && fence[1].length >= fenceLength && !fence[2]) {
        const marker = `WEBDOCCODE${crypto.randomUUID().replaceAll('-', '')}`
        blocks.set(marker, { fields: { blockName: '', blockType: 'code', code: code.join('\n'), language }, format: '', type: 'block', version: 2 })
        output.push(marker)
        fenceLength = 0
      } else code.push(line)
      continue
    }
    output.push(line)
  }
  if (fenceLength) fail('Code fence is not closed.')
  return { blocks, markdown: output.join('\n') }
}

const restoreCodeBlocks = (content: { root: { children: Node[] } }, blocks: Map<string, Node>) => {
  content.root.children = content.root.children.map((node) => {
    const marker = plainText(node)
    return node.type === 'paragraph' && blocks.has(marker) ? blocks.get(marker)! : node
  })
  return content
}

const checkURL = (value: string) => {
  if (value.startsWith('/') || value.startsWith('#')) return
  try {
    const url = new URL(value)
    if (url.protocol === 'http:' || url.protocol === 'https:') return
  } catch {
    // Fall through to the error below.
  }
  fail(`Unsupported or unsafe URL: ${value}`)
}

const validateSyntax = (markdown: string) => {
  const visible: string[] = []
  const mediaIDs = new Set<string>()
  for (const line of markdown.split('\n')) {
    if (/^\s*[-*+]\s+\[[ xX]\]\s+/.test(line)) fail('Task lists are not supported.')
    if (/^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(line)) fail('Tables are not supported.')
    if (/^\s*(import|export)\s/.test(line) || /^\s*\{.*\}\s*$/.test(line)) fail('MDX and executable expressions are not supported.')
    for (const match of line.matchAll(/!\[media:([^\]]+)\]\(\)/g)) mediaIDs.add(match[1])
    if (/!\[[^\]]*\]\([^)]*\S[^)]*\)/.test(line)) fail('Only existing CMS media references are supported for images.')
    for (const match of line.matchAll(/(?<!!)\[[^\]]*\]\(([^)\s]+)[^)]*\)/g)) checkURL(match[1])
    visible.push(line)
  }

  const text = visible.join('\n')
  for (const match of text.matchAll(/<callout kind="(info|warning|tip)">([\s\S]*?)<\/callout>/g)) {
    if (match[2].includes('<')) fail('Callouts contain plain text only.')
  }
  for (const match of text.matchAll(/<youtube url="([^"]+)" title="([^"]+)"\s*\/>/g)) {
    if (!getYouTubeID(match[1]) || !match[2].trim()) fail('YouTube blocks require a supported URL and title.')
  }
  const allowed = text
    .replace(/<callout kind="(info|warning|tip)">[\s\S]*?<\/callout>/g, '')
    .replace(/<youtube url="[^"]+" title="[^"]+"\s*\/>/g, '')
  if (/<\/?[A-Za-z][^>]*>/.test(allowed)) fail('Raw HTML and unknown custom tags are not supported.')
  return [...mediaIDs]
}

const validateNode = (node: Node) => {
  const children = () => (node.children ?? []).forEach(validateNode)
  switch (node.type) {
    case 'root': case 'paragraph': case 'quote': case 'list': case 'listitem': case 'link': case 'autolink':
      children()
      return
    case 'heading':
      if (!['h2', 'h3', 'h4'].includes(node.tag ?? '')) fail('Unsupported heading level.')
      children()
      return
    case 'text': case 'linebreak':
      return
    case 'upload':
      return
    case 'block': {
      const fields = node.fields ?? {}
      if (fields.blockType === 'code' && typeof fields.code === 'string' && codeLanguages.includes(String(fields.language) as (typeof codeLanguages)[number])) return
      if (fields.blockType === 'callout' && ['info', 'warning', 'tip'].includes(String(fields.kind)) && typeof fields.text === 'string') return
      if (fields.blockType === 'youtube' && typeof fields.url === 'string' && getYouTubeID(fields.url) && typeof fields.title === 'string') return
      fail('This editor block cannot be exported as Markdown.')
    }
    default:
      fail(`Unsupported editor node: ${node.type ?? 'unknown'}.`)
  }
}

export const lessonMarkdownEditorConfig = (config: SanitizedConfig) => {
  const lessons = config.collections?.find((collection) => collection.slug === 'lessons')
  const content = lessons?.fields.find((field) => 'name' in field && field.name === 'content')
  const editorConfig = (content as { editor?: { editorConfig?: SanitizedServerEditorConfig } } | undefined)?.editor?.editorConfig
  if (!editorConfig) throw new Error('Lesson Markdown editor configuration is unavailable.')
  return editorConfig
}

export const importLessonMarkdown = async ({
  editorConfig,
  filename,
  markdown,
  validateMedia,
}: {
  editorConfig: SanitizedServerEditorConfig
  filename: string
  markdown: string
  validateMedia?: (ids: string[]) => Promise<void>
}) => {
  if (!filename.toLowerCase().endsWith('.md')) fail('Choose a .md file.')
  if (Buffer.byteLength(markdown, 'utf8') > MARKDOWN_MAX_BYTES) fail('Markdown files must be 1 MB or smaller.')
  const { body: withFrontmatterRemoved, values } = parseFrontmatter(normalizeSource(markdown))
  const { body: withoutH1, title: h1Title } = leadingH1(withFrontmatterRemoved)
  const normalized = normalizeHeadings(withoutH1)
  const { blocks, markdown: body } = extractCodeBlocks(normalized)
  const mediaIDs = validateSyntax(body)
  await validateMedia?.(mediaIDs)
  const content = restoreCodeBlocks(convertMarkdownToLexical({ editorConfig, markdown: body }) as { root: { children: Node[] } }, blocks)
  validateNode(content.root as Node)
  const firstParagraph = (content.root.children as Node[]).find((node) => node.type === 'paragraph')
  const title = String(values.title || h1Title || filenameTitle(filename)).trim()
  const summary = String(values.summary ?? plainText(firstParagraph)).trim()
  return {
    content,
    metadata: {
      displayOrder: typeof values.displayOrder === 'number' ? values.displayOrder : 0,
      slug: slugify(String(values.slug ?? title)),
      summary,
      title,
    } satisfies LessonMarkdownMetadata,
  }
}

export const exportLessonMarkdown = async ({
  content,
  displayOrder,
  editorConfig,
  resolveInternalDoc,
  slug,
  summary,
  title,
}: {
  content: { root?: Node }
  displayOrder: number
  editorConfig: SanitizedServerEditorConfig
  resolveInternalDoc?: (relationTo: string, value: unknown) => Promise<{ slug: string; subjectSlug?: string } | null>
  slug: string
  summary: string
  title: string
}) => {
  if (Buffer.byteLength(JSON.stringify({ content, displayOrder, slug, summary, title }), 'utf8') > MARKDOWN_EXPORT_MAX_BYTES) {
    fail('Export data must be 10 MB or smaller.')
  }
  if (!title.trim() || !slug.trim() || !summary.trim() || !Number.isFinite(displayOrder)) fail('Title, slug, summary, and display order are required for export.')
  const data = structuredClone(content)
  const resolveLinks = async (node?: Node): Promise<void> => {
    const fields = node?.fields
    if ((node?.type === 'link' || node?.type === 'autolink') && fields?.linkType === 'internal') {
      const doc = fields.doc as { relationTo?: unknown; value?: unknown } | undefined
      const relationTo = doc?.relationTo
      const resolver = resolveInternalDoc
      if (!resolver || typeof relationTo !== 'string') fail('Internal link cannot be resolved for Markdown export.')
      const relation = relationTo as string
      const target = await resolver!(relation, doc?.value)
      const href = target && (relation === 'lessons' ? `/lessons/${target.slug}` : relation === 'subjects' ? `/subjects/${target.slug}` : relation === 'chapters' && target.subjectSlug ? `/subjects/${target.subjectSlug}/${target.slug}` : null)
      if (!href) fail('Internal link cannot be resolved for Markdown export.')
      node.fields = { ...fields, linkType: 'custom', url: href }
    }
    for (const child of node?.children ?? []) await resolveLinks(child)
  }
  await resolveLinks(data.root)
  validateNode(data.root as Node)
  const body = convertLexicalToMarkdown({ data: data as never, editorConfig }).trim()
  return `${stringify({ displayOrder, slug, summary, title }).trim()}\n---\n\n# ${title.trim()}\n\n${body}\n`
}
