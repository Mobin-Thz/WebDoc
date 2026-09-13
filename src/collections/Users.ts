import type { CollectionConfig } from "payload";

import { adminsOnly } from "../access";

export const Users: CollectionConfig = {
  slug: "users",
  auth: true,
  access: {
    create: adminsOnly,
    delete: adminsOnly,
    read: adminsOnly,
    update: adminsOnly,
  },
  admin: { defaultColumns: ["name", "email"], useAsTitle: "email" },
  fields: [{ name: "name", type: "text", required: true }],
};
