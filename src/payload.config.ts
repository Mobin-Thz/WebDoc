import { postgresAdapter } from "@payloadcms/db-postgres";
import { searchPlugin } from "@payloadcms/plugin-search";
import { seoPlugin } from "@payloadcms/plugin-seo";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildConfig } from "payload";
import sharp from "sharp";

import { Chapters } from "./collections/Chapters";
import { Lessons } from "./collections/Lessons";
import { Media } from "./collections/Media";
import { Subjects } from "./collections/Subjects";
import { Users } from "./collections/Users";
import { lexicalToText, type LexicalContent } from "./lib/content";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const serverURL = process.env.NEXT_PUBLIC_SERVER_URL ?? "http://localhost:3000";

export default buildConfig({
  admin: {
    importMap: { baseDir: path.resolve(dirname) },
    livePreview: {
      breakpoints: [
        { name: "mobile", label: "Mobile", width: 375, height: 667 },
        { name: "tablet", label: "Tablet", width: 768, height: 1024 },
        { name: "desktop", label: "Desktop", width: 1440, height: 900 },
      ],
      collections: ["subjects", "chapters", "lessons"],
    },
    user: Users.slug,
  },
  collections: [Subjects, Chapters, Lessons, Media, Users],
  cors: [serverURL],
  csrf: [serverURL],
  db: postgresAdapter({ pool: { connectionString: process.env.DATABASE_URL } }),
  plugins: [
    seoPlugin({
      collections: ["subjects", "lessons"],
      generateDescription: ({ doc }) => doc?.summary ?? doc?.description,
      generateImage: ({ doc }) => doc?.featuredImage ?? doc?.coverImage,
      generateTitle: ({ doc }) =>
        doc?.title ? `${doc.title} | WebDoc` : "WebDoc",
      generateURL: ({ collectionSlug, doc }) =>
        collectionSlug === "lessons"
          ? `${serverURL}/lessons/${doc?.slug}`
          : `${serverURL}/subjects/${doc?.slug}`,
      uploadsCollection: "media",
    }),
    searchPlugin({
      collections: ["lessons"],
      beforeSync: ({ originalDoc, searchDoc }) => ({
        ...searchDoc,
        content: lexicalToText(originalDoc.content as LexicalContent),
        slug: originalDoc.slug,
        summary: originalDoc.summary,
      }),
      searchOverrides: {
        access: { read: () => true },
        fields: ({ defaultFields }) => [
          ...defaultFields,
          { name: "slug", type: "text", index: true },
          { name: "summary", type: "textarea" },
          { name: "content", type: "textarea" },
        ],
      },
      syncDrafts: false,
    }),
  ],
  secret: process.env.PAYLOAD_SECRET ?? "",
  sharp,
  typescript: { outputFile: path.resolve(dirname, "payload-types.ts") },
  upload: { limits: { fileSize: 10_000_000 } },
});
