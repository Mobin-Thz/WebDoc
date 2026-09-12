import type { Metadata } from 'next'
import Link from 'next/link'

import './(frontend)/styles.css'

export const metadata: Metadata = { title: 'Page not found | WebDoc' }

export default function GlobalNotFound() {
  return (
    <html lang="en">
      <body>
        <main id="main">
          <div className="container page-shell narrow not-found">
            <p className="eyebrow">404</p>
            <h1>That page is not in the curriculum.</h1>
            <p className="lede">It may have moved, remained a draft, or never existed.</p>
            <Link className="button" href="/subjects">Browse subjects</Link>
          </div>
        </main>
      </body>
    </html>
  )
}
