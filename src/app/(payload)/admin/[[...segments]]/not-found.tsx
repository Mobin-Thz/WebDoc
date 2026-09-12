import config from '@payload-config'
import { generatePageMetadata, NotFoundPage } from '@payloadcms/next/views'

import { importMap } from '../importMap.js'

type Props = {
  params: Promise<{ segments: string[] }>
  searchParams: Promise<Record<string, string | string[]>>
}

export const generateMetadata = ({ params, searchParams }: Props) =>
  generatePageMetadata({ config, params, searchParams })

export default function NotFound({ params, searchParams }: Props) {
  return NotFoundPage({ config, params, searchParams, importMap })
}
