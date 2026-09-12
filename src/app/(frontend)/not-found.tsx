import Link from 'next/link'

export default function NotFound() {
  return <div className="container page-shell narrow not-found"><p className="eyebrow">404</p><h1>That page is not in the curriculum.</h1><p className="lede">It may have moved, remained a draft, or never existed.</p><Link className="button" href="/subjects">Browse subjects</Link></div>
}
