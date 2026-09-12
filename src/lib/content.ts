export type LexicalNode = {
  children?: LexicalNode[]
  fields?: Record<string, unknown>
  tag?: string
  text?: string
  type?: string
}

export type LexicalContent = { root?: LexicalNode }

export type TocItem = { id: string; level: 2 | 3 | 4; text: string }

const nodeText = (node?: LexicalNode): string => {
  if (!node) return ''
  if (typeof node.text === 'string') return node.text
  if (node.type === 'block' && typeof node.fields?.code === 'string') return node.fields.code
  return (node.children ?? []).map(nodeText).join(' ')
}

export const lexicalToText = (content?: LexicalContent | null) =>
  nodeText(content?.root).replace(/\s+/g, ' ').trim()

export const readingTime = (content?: LexicalContent | null) => {
  const words = lexicalToText(content).split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(words / 200))
}

export const headingSlug = (text: string) => {
  const slug = text
    .normalize('NFKD')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
  return slug || 'section'
}

export const buildToc = (content?: LexicalContent | null): TocItem[] => {
  const counts = new Map<string, number>()
  const items: TocItem[] = []
  for (const node of content?.root?.children ?? []) {
    if (node.type !== 'heading' || !['h2', 'h3', 'h4'].includes(node.tag ?? '')) continue
    const text = nodeText(node).trim()
    if (!text) continue
    const base = headingSlug(text)
    const count = counts.get(base) ?? 0
    counts.set(base, count + 1)
    items.push({ id: count ? `${base}-${count + 1}` : base, level: Number(node.tag?.slice(1)) as 2 | 3 | 4, text })
  }
  return items
}
