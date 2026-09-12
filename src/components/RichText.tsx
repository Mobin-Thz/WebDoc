import { Fragment, type ReactNode } from 'react'

import { getYouTubeID } from '@/blocks/YouTube'
import type { Media } from '@/payload-types'
import { buildToc, type LexicalContent, type LexicalNode } from '@/lib/content'
import { CodeSnippet } from './CodeSnippet'
import { MediaView } from './MediaView'

const children = (node: LexicalNode, headingIDs: string[]): ReactNode =>
  (node.children ?? []).map((child, index) => <Fragment key={index}>{renderNode(child, headingIDs)}</Fragment>)

const renderText = (node: LexicalNode) => {
  let value: ReactNode = node.text ?? ''
  const format = Number((node as LexicalNode & { format?: number }).format ?? 0)
  if (format & 16) value = <code>{value}</code>
  if (format & 2) value = <em>{value}</em>
  if (format & 1) value = <strong>{value}</strong>
  return value
}

const renderNode = (node: LexicalNode, headingIDs: string[]): ReactNode => {
  if (node.type === 'text') return renderText(node)
  if (node.type === 'paragraph') return <p>{children(node, headingIDs)}</p>
  if (node.type === 'heading' && ['h2', 'h3', 'h4'].includes(node.tag ?? '')) {
    const Tag = node.tag as 'h2' | 'h3' | 'h4'
    return <Tag id={headingIDs.shift()}>{children(node, headingIDs)}</Tag>
  }
  if (node.type === 'quote') return <blockquote>{children(node, headingIDs)}</blockquote>
  if (node.type === 'list') {
    const list = children(node, headingIDs)
    return (node as LexicalNode & { listType?: string }).listType === 'number' ? <ol>{list}</ol> : <ul>{list}</ul>
  }
  if (node.type === 'listitem') return <li>{children(node, headingIDs)}</li>
  if (node.type === 'linebreak') return <br />
  if (node.type === 'link' || node.type === 'autolink') {
    const fields = node.fields ?? {}
    const linked = fields.doc as { relationTo?: string; value?: { slug?: string; subject?: { slug?: string } | number } } | undefined
    const target = linked?.value
    const internal = target?.slug
      ? linked?.relationTo === 'lessons'
        ? `/lessons/${target.slug}`
        : linked?.relationTo === 'chapters' && typeof target.subject === 'object'
          ? `/subjects/${target.subject.slug}/${target.slug}`
          : linked?.relationTo === 'subjects'
            ? `/subjects/${target.slug}`
            : null
      : null
    const url = internal ?? (typeof fields.url === 'string' ? fields.url : '#')
    const external = /^https?:\/\//.test(url)
    return <a href={url} {...(external ? { rel: 'noreferrer', target: '_blank' } : {})}>{children(node, headingIDs)}</a>
  }
  if (node.type === 'upload') {
    const value = (node as LexicalNode & { value?: Media | number }).value
    return <MediaView media={value} />
  }
  if (node.type === 'block') {
    const fields = node.fields ?? {}
    if (fields.blockType === 'code' && typeof fields.code === 'string') {
      return <CodeSnippet code={fields.code} language={typeof fields.language === 'string' ? fields.language : 'text'} />
    }
    if (fields.blockType === 'youtube' && typeof fields.url === 'string') {
      const id = getYouTubeID(fields.url)
      return id ? <div className="video"><iframe src={`https://www.youtube-nocookie.com/embed/${id}`} title={typeof fields.title === 'string' ? fields.title : 'YouTube video'} allowFullScreen loading="lazy" /></div> : null
    }
    if (fields.blockType === 'callout' && typeof fields.text === 'string') {
      const kind = ['info', 'warning', 'tip'].includes(String(fields.kind)) ? String(fields.kind) : 'info'
      return <aside className={`callout ${kind}`} aria-label={`${kind} callout`}><strong>{kind}</strong><p>{fields.text}</p></aside>
    }
  }
  return children(node, headingIDs)
}

export function RichText({ content }: { content: LexicalContent }) {
  const headingIDs = buildToc(content).map((item) => item.id)
  return <div className="rich-text">{children(content.root ?? {}, headingIDs)}</div>
}
