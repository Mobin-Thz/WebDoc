import { describe, expect, it } from 'vitest'

import { getYouTubeID } from '@/blocks/YouTube'
import { buildToc, lexicalToText, readingTime, type LexicalContent } from '@/lib/content'
import { slugify } from '@/lib/slug'

const content = {
  root: {
    children: [
      { type: 'heading', tag: 'h2', children: [{ type: 'text', text: 'Hello World' }] },
      { type: 'paragraph', children: [{ type: 'text', text: 'A short lesson.' }] },
      { type: 'heading', tag: 'h3', children: [{ type: 'text', text: 'Hello World' }] },
    ],
  },
} satisfies LexicalContent

describe('content utilities', () => {
  it('extracts text and estimates at least one minute', () => {
    expect(lexicalToText(content)).toBe('Hello World A short lesson. Hello World')
    expect(readingTime(content)).toBe(1)
  })

  it('creates stable unique heading anchors', () => {
    expect(buildToc(content)).toEqual([
      { id: 'hello-world', level: 2, text: 'Hello World' },
      { id: 'hello-world-2', level: 3, text: 'Hello World' },
    ])
  })

  it('normalizes slugs', () => expect(slugify('  Linux & Files  ')).toBe('linux-files'))
})

describe('YouTube validation', () => {
  it('accepts supported URLs and rejects arbitrary embeds', () => {
    expect(getYouTubeID('https://youtu.be/abc123')).toBe('abc123')
    expect(getYouTubeID('https://www.youtube.com/watch?v=abc123')).toBe('abc123')
    expect(getYouTubeID('https://example.com/embed/abc123')).toBeNull()
  })
})
