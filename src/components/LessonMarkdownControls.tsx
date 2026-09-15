'use client'

import { useDocumentInfo, useField, useForm, useFormInitializing, useFormProcessing } from '@payloadcms/ui'
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
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState('')
  const disabled = busy || processing || initializing

  const importFile = async (file?: File) => {
    if (!file) return
    if (!file.name.toLowerCase().endsWith('.md')) return setStatus('Choose a .md file.')
    if (file.size > 1_000_000) return setStatus('Markdown files must be 1 MB or smaller.')
    if (id && !window.confirm('Replace this lesson body with the imported Markdown?')) return
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
      if (!id) {
        title.setValue(result.metadata.title)
        slug.setValue(result.metadata.slug)
        summary.setValue(result.metadata.summary)
        displayOrder.setValue(result.metadata.displayOrder)
      }
      setStatus('Markdown imported. Review the lesson, choose a chapter if needed, then save or publish.')
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

  return <div className="lesson-markdown-controls">
    <input accept=".md,text/markdown" aria-label="Import Markdown file" hidden onChange={(event) => void importFile(event.target.files?.[0])} ref={input} type="file" />
    <button className="btn btn--style-secondary" disabled={disabled} onClick={() => input.current?.click()} type="button">Import Markdown</button>
    <button className="btn btn--style-secondary" disabled={disabled} onClick={() => void exportFile()} type="button">Export Markdown</button>
    <button className="btn btn--style-secondary" disabled={disabled} onClick={() => download(LESSON_MARKDOWN_TEMPLATE, 'webdoc-lesson-template.md')} type="button">Download Template</button>
    <button className="btn btn--style-secondary" disabled={disabled} onClick={() => void navigator.clipboard.writeText(AI_AUTHORING_PROMPT).then(() => setStatus('AI prompt copied.')).catch(() => setStatus('Could not copy the AI prompt.'))} type="button">Copy AI Prompt</button>
    <span aria-live="polite" className="lesson-markdown-status">{status}</span>
  </div>
}
