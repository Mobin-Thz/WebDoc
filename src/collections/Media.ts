import path from "node:path";
import type { CollectionConfig } from "payload";

import { adminsOnly } from "../access";

export const Media: CollectionConfig = {
  slug: "media",
  access: {
    create: adminsOnly,
    delete: adminsOnly,
    read: () => true,
    update: adminsOnly,
  },
  admin: { useAsTitle: "filename" },
  upload: {
    staticDir: path.resolve(process.cwd(), "media"),
    mimeTypes: [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "application/pdf",
    ],
    imageSizes: [
      { name: "thumbnail", width: 320, height: 200, position: "centre" },
      { name: "card", width: 720, height: 450, position: "centre" },
      { name: "content", width: 1440, withoutEnlargement: true },
    ],
  },
  fields: [
    { name: "alt", type: "text", required: true },
    { name: "caption", type: "text" },
  ],
};
