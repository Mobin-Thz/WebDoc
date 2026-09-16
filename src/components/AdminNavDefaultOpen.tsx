'use client'

import { useNav, usePreferences } from '@payloadcms/ui'
import { useEffect, type ReactNode } from 'react'
import { PREFERENCE_KEYS } from 'payload/shared'

export default function AdminNavDefaultOpen({ children }: { children?: ReactNode }) {
  const { setNavOpen } = useNav()
  const { setPreference } = usePreferences()

  useEffect(() => {
    if (!window.matchMedia('(min-width: 769px)').matches) return
    let active = true
    void setPreference(PREFERENCE_KEYS.NAV, { open: true }).then(() => {
      if (active) setNavOpen(true)
    })
    return () => { active = false }
  }, [setNavOpen, setPreference])

  return children
}
