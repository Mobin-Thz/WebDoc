import type { Block } from "payload";

export const CalloutBlock: Block = {
  slug: "callout",
  interfaceName: "CalloutBlock",
  fields: [
    {
      name: "kind",
      type: "select",
      defaultValue: "info",
      options: ["info", "warning", "tip"],
      required: true,
    },
    { name: "text", type: "textarea", required: true },
  ],
};
