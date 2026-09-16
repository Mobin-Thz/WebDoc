import config from '@payload-config'
import '@payloadcms/next/css'
import { handleServerFunctions, RootLayout } from '@payloadcms/next/layouts'
import { Vazirmatn } from 'next/font/google'
import type { ServerFunctionClient } from 'payload'
import type { ReactNode } from 'react'

import { importMap } from './admin/importMap.js'
import './payload.css'

const sans = Vazirmatn({ subsets: ['arabic', 'latin'], variable: '--font-admin' })

const serverFunction: ServerFunctionClient = async (args) => {
  'use server'
  return handleServerFunctions({ ...args, config, importMap })
}

export default function PayloadLayout({ children }: { children: ReactNode }) {
  return (
    <RootLayout config={config} htmlProps={{ className: sans.variable }} importMap={importMap} serverFunction={serverFunction}>
      {children}
    </RootLayout>
  )
}
