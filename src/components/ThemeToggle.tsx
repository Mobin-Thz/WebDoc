'use client'

export function ThemeToggle() {
  const toggle = () => {
    const next = document.documentElement.dataset.theme !== 'dark'
    document.documentElement.dataset.theme = next ? 'dark' : 'light'
    localStorage.setItem('webdoc:theme', next ? 'dark' : 'light')
  }

  return (
    <button className="icon-button" type="button" onClick={toggle} aria-label="Toggle color theme">
      <span aria-hidden="true">◐</span>
    </button>
  )
}
