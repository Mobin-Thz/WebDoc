import type { CollectionConfig } from "payload";

import { adminsOnly, publishedChapterOrAdmin } from "../access";
import { formatSlug } from "../lib/slug";

export const Chapters: CollectionConfig = {
  slug: "chapters",
  access: {
    create: adminsOnly,
    delete: adminsOnly,
    read: publishedChapterOrAdmin,
    update: adminsOnly,
  },
  admin: {
    defaultColumns: ["title", "subject", "displayOrder", "_status"],
    livePreview: {
      url: async ({ data, req }) => {
        const subjectID =
          typeof data.subject === "object" ? data.subject?.id : data.subject;
        if (!subjectID || !data.slug) return null;
        const subject = await req.payload.findByID({
          collection: "subjects",
          id: String(subjectID),
          req,
        });
        const path = `/subjects/${subject.slug}/${data.slug}`;
        return `/api/preview?secret=${encodeURIComponent(process.env.PREVIEW_SECRET ?? "")}&path=${encodeURIComponent(path)}`;
      },
    },
    useAsTitle: "title",
  },
  defaultSort: "displayOrder",
  indexes: [{ fields: ["subject", "slug"], unique: true }],
  versions: { drafts: { autosave: true }, maxPerDoc: 50 },
  fields: [
    { name: "title", type: "text", required: true },
    {
      name: "slug",
      type: "text",
      hooks: { beforeValidate: [formatSlug] },
      index: true,
      required: true,
    },
    {
      name: "subject",
      type: "relationship",
      relationTo: "subjects",
      index: true,
      required: true,
    },
    { name: "description", type: "textarea", required: true },
    {
      name: "displayOrder",
      type: "number",
      defaultValue: 0,
      index: true,
      required: true,
    },
  ],
};
