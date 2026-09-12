import type { CollectionConfig } from 'payload'

import { adminsOnly, publishedOrAdmin } from '../access'
import { formatSlug } from '../lib/slug'

export const Subjects: CollectionConfig = {
  slug: 'subjects',
  access: {
    create: adminsOnly,
    delete: adminsOnly,
    read: publishedOrAdmin,
    update: adminsOnly,
  },
  admin: {
    defaultColumns: ['title', 'slug', 'displayOrder', '_status'],
    livePreview: {
      url: ({ data }) => `/api/preview?secret=${encodeURIComponent(process.env.PREVIEW_SECRET ?? '')}&path=${encodeURIComponent(`/subjects/${data.slug}`)}`,
    },
    useAsTitle: 'title',
  },
  defaultSort: 'displayOrder',
  versions: { drafts: { autosave: true }, maxPerDoc: 50 },
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      name: 'slug',
      type: 'text',
      hooks: { beforeValidate: [formatSlug] },
      index: true,
      required: true,
      unique: true,
    },
    { name: 'description', type: 'textarea', required: true },
    { name: 'coverImage', type: 'upload', relationTo: 'media' },
    { name: 'displayOrder', type: 'number', defaultValue: 0, index: true, required: true },
    { name: 'featured', type: 'checkbox', defaultValue: false, index: true },
  ],
}
