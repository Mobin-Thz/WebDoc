import Link from 'next/link'

import type { Subject } from '@/payload-types'
import { MediaView } from './MediaView'

export function SubjectCard({ subject }: { subject: Subject }) {
  return (
    <article className="card subject-card">
      <MediaView media={subject.coverImage} />
      <div className="card-body">
        <p className="eyebrow">Subject</p>
        <h2><Link href={`/subjects/${subject.slug}`}>{subject.title}</Link></h2>
        <p>{subject.description}</p>
        <Link className="text-link" href={`/subjects/${subject.slug}`}>Explore subject →</Link>
      </div>
    </article>
  )
}
