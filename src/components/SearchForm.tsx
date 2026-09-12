export function SearchForm({ compact = false }: { compact?: boolean }) {
  return (
    <form className={compact ? 'search-form compact' : 'search-form'} action="/search" role="search">
      <label className="sr-only" htmlFor={compact ? 'header-search' : 'hero-search'}>Search lessons</label>
      <input id={compact ? 'header-search' : 'hero-search'} name="q" type="search" placeholder="Search lessons…" />
      <button type="submit">Search</button>
    </form>
  )
}
