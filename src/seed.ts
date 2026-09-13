import "dotenv/config";
import config from "@payload-config";
import { getPayload } from "payload";

import type { Lesson } from "./payload-types";

const text = (value: string, format = 0) => ({
  detail: 0,
  format,
  mode: "normal",
  style: "",
  text: value,
  type: "text",
  version: 1,
});
const paragraph = (value: string) => ({
  children: [text(value)],
  direction: "ltr",
  format: "",
  indent: 0,
  type: "paragraph",
  version: 1,
});
const heading = (value: string) => ({
  children: [text(value)],
  direction: "ltr",
  format: "",
  indent: 0,
  tag: "h2",
  type: "heading",
  version: 1,
});
const block = (fields: Record<string, unknown>) => ({
  fields: { ...fields, blockName: "" },
  format: "",
  type: "block",
  version: 2,
});
const content = (
  title: string,
  body: string,
  command: string,
): Lesson["content"] =>
  ({
    root: {
      children: [
        heading(title),
        paragraph(body),
        block({
          blockType: "callout",
          kind: "tip",
          text: "Try each command in a safe practice environment.",
        }),
        block({ blockType: "code", language: "bash", code: command }),
      ],
      direction: "ltr",
      format: "",
      indent: 0,
      type: "root",
      version: 1,
    },
  }) as Lesson["content"];

async function seed() {
  const payload = await getPayload({ config });
  const existing = await payload.find({
    collection: "subjects",
    limit: 1,
    overrideAccess: true,
  });
  if (existing.totalDocs) {
    payload.logger.info("Seed skipped: content already exists.");
    await payload.destroy();
    return;
  }
  const subject = await payload.create({
    collection: "subjects",
    overrideAccess: true,
    data: {
      _status: "published",
      description:
        "A practical introduction to Linux concepts and command-line work.",
      displayOrder: 1,
      featured: true,
      slug: "linux-fundamentals",
      title: "Linux Fundamentals",
    },
  });
  const chapter = await payload.create({
    collection: "chapters",
    overrideAccess: true,
    data: {
      _status: "published",
      description:
        "Build confidence with the terminal and the Linux filesystem.",
      displayOrder: 1,
      slug: "getting-started",
      subject: subject.id,
      title: "Getting Started",
    },
  });
  await payload.create({
    collection: "lessons",
    overrideAccess: true,
    data: {
      _status: "published",
      chapter: chapter.id,
      content: content(
        "Meet the shell",
        "The shell reads commands and asks the operating system to run them.",
        "whoami\npwd",
      ),
      displayOrder: 1,
      readingTime: 1,
      slug: "meet-the-shell",
      summary: "Learn what a shell is and run your first commands.",
      title: "Meet the Shell",
    },
  });
  await payload.create({
    collection: "lessons",
    overrideAccess: true,
    data: {
      _status: "published",
      chapter: chapter.id,
      content: content(
        "Navigate safely",
        "Absolute and relative paths let you move through the filesystem.",
        "ls -la\ncd /tmp",
      ),
      displayOrder: 2,
      readingTime: 1,
      slug: "navigate-the-filesystem",
      summary: "Understand paths and move around the filesystem.",
      title: "Navigate the Filesystem",
    },
  });
  payload.logger.info("Seeded Linux Fundamentals with two lessons.");
  await payload.destroy();
}

await seed();
process.exit(0);
