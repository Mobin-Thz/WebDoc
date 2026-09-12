import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Breadcrumbs } from '@/components/Breadcrumbs'
import { LiveSubject } from '@/components/LiveDocument'
import { getChapters, getLessons, getSubject } from '@/lib/data'

type Props = { params: Promise<{ subjectSlug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const subject = await getSubject((await params).subjectSlug)
  if (!subject) return {}
  return { title: subject.meta?.title ?? subject.title, description: subject.meta?.description ?? subject.description }
}

export default async function SubjectPage({ params }: Props) {
  const subject = await getSubject((await params).subjectSlug)
  if (!subject) notFound()
  const chapters = await getChapters(subject.id)
  const lessons = await Promise.all(chapters.map((chapter) => getLessons(chapter.id)))
  const count = lessons.reduce((total, items) => total + items.length, 0)
  return (
    <div className="container page-shell">
      <Breadcrumbs items={[{ href: '/subjects', label: 'Subjects' }, { label: subject.title }]} />
      <LiveSubject initialData={subject} lessonCount={count} />
      <div className="chapter-list">
        {chapters.map((chapter, index) => <Link key={chapter.id} href={`/subjects/${subject.slug}/${chapter.slug}`}><span className="chapter-number">{String(index + 1).padStart(2, '0')}</span><span><strong>{chapter.title}</strong><small>{chapter.description} · {lessons[index]?.length ?? 0} lessons</small></span><span aria-hidden="true">→</span></Link>)}
      </div>
    </div>
  )
}
