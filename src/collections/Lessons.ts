import type { CollectionConfig } from "payload";

import { adminsOnly, publishedLessonOrAdmin } from "../access";
import { lessonEditor } from "../editor";
import { readingTime, type LexicalContent } from "../lib/content";
import { formatSlug } from "../lib/slug";

export const Lessons: CollectionConfig = {
  slug: "lessons",
  access: {
    create: adminsOnly,
    delete: adminsOnly,
    read: publishedLessonOrAdmin,
    update: adminsOnly,
  },
  admin: {
    defaultColumns: ["title", "chapter", "displayOrder", "_status"],
    livePreview: {
      url: ({ data }) =>
        `/api/preview?secret=${encodeURIComponent(process.env.PREVIEW_SECRET ?? "")}&path=${encodeURIComponent(`/lessons/${data.slug}`)}`,
    },
    useAsTitle: "title",
  },
  defaultSort: "displayOrder",
  hooks: {
    beforeChange: [
      ({ data }) => {
        if (data.content)
          data.readingTime = readingTime(data.content as LexicalContent);
        return data;
      },
    ],
  },
  versions: { drafts: { autosave: true }, maxPerDoc: 50 },
  fields: [
    { name: "title", type: "text", required: true },
    {
      name: "slug",
      type: "text",
      hooks: { beforeValidate: [formatSlug] },
      index: true,
      required: true,
      unique: true,
    },
    {
      name: "chapter",
      type: "relationship",
      relationTo: "chapters",
      index: true,
      required: true,
    },
    { name: "summary", type: "textarea", required: true },
    { name: "content", type: "richText", editor: lessonEditor, required: true },
    { name: "featuredImage", type: "upload", relationTo: "media" },
    {
      name: "readingTime",
      type: "number",
      admin: { readOnly: true },
      defaultValue: 1,
      required: true,
    },
    {
      name: "displayOrder",
      type: "number",
      defaultValue: 0,
      index: true,
      required: true,
    },
  ],
};
