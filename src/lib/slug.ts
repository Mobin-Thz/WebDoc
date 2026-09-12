import type { FieldHook } from 'payload'

export const slugify = (value: string) =>
  value
    .normalize('NFKD')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

export const formatSlug: FieldHook = ({ data, operation, originalDoc, value }) => {
  if (typeof value === 'string' && value.trim()) return slugify(value)
  if (operation === 'update' && originalDoc?.slug) return originalDoc.slug
  return typeof data?.title === 'string' ? slugify(data.title) : value
}
