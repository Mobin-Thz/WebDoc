'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function DashboardNavLink() {
  const current = usePathname() === '/admin'
  return <Link aria-current={current ? 'page' : undefined} className="nav__link dashboard-nav-link" href="/admin">{current && <span className="nav__link-indicator" />}Dashboard</Link>
}
