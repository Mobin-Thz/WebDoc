import type { Block } from 'payload'

export const getYouTubeID = (value: string) => {
  try {
    const url = new URL(value)
    if (url.hostname === 'youtu.be') return url.pathname.slice(1).split('/')[0] || null
    if (['youtube.com', 'www.youtube.com', 'm.youtube.com'].includes(url.hostname)) {
      if (url.pathname === '/watch') return url.searchParams.get('v')
      if (url.pathname.startsWith('/embed/')) return url.pathname.split('/')[2] || null
    }
  } catch {
    return null
  }
  return null
}

export const YouTubeBlock: Block = {
  slug: 'youtube',
  interfaceName: 'YouTubeBlock',
  fields: [
    {
      name: 'url',
      type: 'text',
      required: true,
      validate: (value: unknown) =>
        typeof value === 'string' && getYouTubeID(value) ? true : 'Enter a valid YouTube URL.',
    },
    { name: 'title', type: 'text', defaultValue: 'YouTube video', required: true },
  ],
  jsx: {
    export: ({ fields }) => ({ props: { title: fields.title ?? 'YouTube video', url: fields.url } }),
    import: ({ props }) => {
      const url = typeof props.url === 'string' ? props.url : ''
      const title = typeof props.title === 'string' ? props.title : ''
      return getYouTubeID(url) && title ? { title, url } : false
    },
  },
}
