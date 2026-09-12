import type { Metadata } from 'next'

import { SubjectCard } from '@/components/SubjectCard'
import { getSubjects } from '@/lib/data'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = { title: 'All subjects', description: 'Browse every published WebDoc subject.' }

export default async function SubjectsPage() {
  const subjects = await getSubjects()
  return (
    <div className="container page-shell">
      <p className="eyebrow">Library</p><h1>All subjects</h1>
      <p className="lede">Choose a subject and follow its chapters in order.</p>
      {subjects.length ? <div className="card-grid">{subjects.map((subject) => <SubjectCard key={subject.id} subject={subject} />)}</div> : <p className="empty">No subjects have been published yet.</p>}
    </div>
  )
}
