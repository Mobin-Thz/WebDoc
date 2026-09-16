import type { Metadata } from 'next'
import { JetBrains_Mono, Vazirmatn } from 'next/font/google'
import type { ReactNode } from 'react'

import { Header } from '@/components/Header'
import './styles.css'

const sans = Vazirmatn({ subsets: ['arabic', 'latin'], variable: '--font-sans' })
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SERVER_URL ?? 'http://localhost:3000'),
  title: { default: 'WebDoc', template: '%s | WebDoc' },
  description: 'Clear, structured lessons for technical learners.',
}

const themeScript = `try{const t=localStorage.getItem('webdoc:theme');document.documentElement.dataset.theme=t||((matchMedia('(prefers-color-scheme: dark)').matches)?'dark':'light')}catch{}`

export default function FrontendLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth" className={`${sans.variable} ${mono.variable}`}>
      <head><script dangerouslySetInnerHTML={{ __html: themeScript }} /></head>
      <body>
        <Header />
        <main id="main">{children}</main>
        <footer className="site-footer"><p>© {new Date().getFullYear()} WebDoc · Built for focused learning.</p></footer>
      </body>
    </html>
  )
}
