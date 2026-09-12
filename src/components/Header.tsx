import Link from 'next/link'

import { SearchForm } from './SearchForm'
import { ThemeToggle } from './ThemeToggle'

export function Header() {
  return (
    <header className="site-header">
      <a className="skip-link" href="#main">Skip to content</a>
      <div className="header-inner">
        <Link className="brand" href="/">WebDoc</Link>
        <nav aria-label="Primary navigation">
          <Link href="/subjects">Subjects</Link>
          <Link href="/about">About</Link>
        </nav>
        <SearchForm compact />
        <ThemeToggle />
      </div>
    </header>
  )
}
