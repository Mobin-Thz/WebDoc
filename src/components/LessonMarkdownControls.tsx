'use client'

import { Button, useDocumentInfo, useField, useForm, useFormInitializing, useFormProcessing } from '@payloadcms/ui'
import { useRef, useState } from 'react'

import { AI_AUTHORING_PROMPT, LESSON_MARKDOWN_TEMPLATE } from '@/lib/lesson-markdown-template'
import type { LexicalContent } from '@/lib/content'

type ImportResult = {
  content: LexicalContent
  metadata: { displayOrder: number; slug: string; summary: string; title: string }
}

const message = async (response: Response) => {
  const body = await response.json().catch(() => null)
  return body?.message || `Request failed (${response.status}).`
}

const download = (contents: BlobPart, filename: string, type = 'text/markdown;charset=utf-8') => {
  const url = URL.createObjectURL(new Blob([contents], { type }))
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export function LessonMarkdownControls() {
  const input = useRef<HTMLInputElement>(null)
  const { id } = useDocumentInfo()
  const { getData } = useForm()
  const processing = useFormProcessing()
  const initializing = useFormInitializing()
  const content = useField<LexicalContent>({ path: 'content' })
  const title = useField<string>({ path: 'title' })
  const slug = useField<string>({ path: 'slug' })
  const summary = useField<string>({ path: 'summary' })
  const displayOrder = useField<number>({ path: 'displayOrder' })
  const metaTitle = useField<string>({ path: 'meta.title' })
  const metaDescription = useField<string>({ path: 'meta.description' })
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState('')
  const disabled = busy || processing || initializing

  const importFile = async (file?: File) => {
    if (!file) return
    if (!file.name.toLowerCase().endsWith('.md')) return setStatus('Choose a .md file.')
    if (file.size > 1_000_000) return setStatus('Markdown files must be 1 MB or smaller.')
    if (id && !window.confirm('Replace this lesson content, title, slug, summary, and SEO details with the imported Markdown?')) return
    setBusy(true)
    setStatus('')
    try {
      const response = await fetch('/api/lessons/markdown/import', {
        body: JSON.stringify({ filename: file.name, markdown: await file.text() }),
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      })
      if (!response.ok) throw new Error(await message(response))
      const result = await response.json() as ImportResult
      content.setValue(result.content)
      title.setValue(result.metadata.title)
      slug.setValue(result.metadata.slug)
      summary.setValue(result.metadata.summary)
      displayOrder.setValue(result.metadata.displayOrder)
      metaTitle.setValue(`${result.metadata.title} | WebDoc`)
      metaDescription.setValue(result.metadata.summary)
      setStatus('Imported. Review the chapter, then save or publish.')
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Markdown import failed.')
    } finally {
      setBusy(false)
      if (input.current) input.current.value = ''
    }
  }

  const exportFile = async () => {
    setBusy(true)
    setStatus('')
    try {
      const response = await fetch('/api/lessons/markdown/export', {
        body: JSON.stringify(getData()),
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      })
      if (!response.ok) throw new Error(await message(response))
      download(await response.blob(), `${slug.value || 'lesson'}.md`)
      setStatus('Markdown exported.')
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Markdown export failed.')
    } finally {
      setBusy(false)
    }
  }

  return <section aria-label="Markdown tools" className="lesson-markdown-controls">
    <input accept=".md,text/markdown" aria-label="Import Markdown file" hidden onChange={(event) => void importFile(event.target.files?.[0])} ref={input} type="file" />
    <div className="lesson-markdown-heading">
      <span aria-hidden="true" className="lesson-markdown-mark">MD</span>
      <span className="lesson-markdown-copy"><strong>Markdown workflow</strong><span>Import a complete lesson or export this draft.</span></span>
    </div>
    <div className="lesson-markdown-actions">
      <Button buttonStyle="primary" className="lesson-markdown-import" disabled={disabled} margin={false} onClick={() => input.current?.click()} size="small">Choose .md file</Button>
      <span aria-hidden="true" className="lesson-markdown-divider" />
      <Button buttonStyle="icon-label" disabled={disabled} margin={false} onClick={() => void exportFile()} size="small">Export .md</Button>
      <Button buttonStyle="icon-label" disabled={disabled} margin={false} onClick={() => download(LESSON_MARKDOWN_TEMPLATE, 'webdoc-lesson-template.md')} size="small">Get template</Button>
      <Button buttonStyle="icon-label" disabled={disabled} margin={false} onClick={() => void navigator.clipboard.writeText(AI_AUTHORING_PROMPT).then(() => setStatus('AI prompt copied.')).catch(() => setStatus('Could not copy the AI prompt.'))} size="small">Copy AI prompt</Button>
    </div>
    <span aria-live="polite" className="lesson-markdown-status">{status}</span>
  </section>
}
