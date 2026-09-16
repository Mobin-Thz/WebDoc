import Link from 'next/link'

import { SearchForm } from '@/components/SearchForm'
import { SubjectCard } from '@/components/SubjectCard'
import { getRecentLessons, getSubjects, relation } from '@/lib/data'
import type { Chapter } from '@/payload-types'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const [featured, recent, allSubjects] = await Promise.all([getSubjects(true), getRecentLessons(5), getSubjects()])
  const subjects = featured.length ? featured : allSubjects.slice(0, 3)
  return (
    <>
      <section className="hero">
        <div className="container hero-inner">
          <p className="eyebrow">Learn with clarity</p>
          <h1>Technical knowledge,<br /><span>structured for humans.</span></h1>
          <p className="hero-copy">Focused subjects, ordered chapters, and practical lessons designed for steady progress.</p>
          <SearchForm />
          {allSubjects[0] && <Link className="button" href={`/subjects/${allSubjects[0].slug}`}>Start learning</Link>}
        </div>
      </section>
      <section className="container section">
        <div className="section-heading"><div><p className="eyebrow">Browse</p><h2>Featured subjects</h2></div><Link href="/subjects">View all subjects →</Link></div>
        {subjects.length ? <div className="card-grid">{subjects.map((subject) => <SubjectCard key={subject.id} subject={subject} />)}</div> : <p className="empty">No subjects have been published yet.</p>}
      </section>
      <section className="container section">
        <div className="section-heading"><div><p className="eyebrow">Keep current</p><h2>Recently updated</h2></div></div>
        <div className="lesson-list">
          {recent.map((lesson) => {
            const chapter = relation<Chapter>(lesson.chapter)
            return <Link key={lesson.id} href={`/lessons/${lesson.slug}`}><span><strong>{lesson.title}</strong><small>{chapter?.title ?? 'Lesson'} · {lesson.readingTime} min read</small></span><span aria-hidden="true">→</span></Link>
          })}
          {!recent.length && <p className="empty">Published lessons will appear here.</p>}
        </div>
      </section>
    </>
  )
}
