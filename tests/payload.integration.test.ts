// @vitest-environment node
import config from "@payload-config";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { getPayload, type Payload } from "payload";

import type { Lesson } from "@/payload-types";

const enabled = Boolean(process.env.DATABASE_URL && process.env.PAYLOAD_SECRET);
const suite = enabled ? describe : describe.skip;
let payload: Payload;
let subjectID: number | undefined;
let chapterID: number | undefined;
let lessonID: number | undefined;
const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

const content: Lesson["content"] = {
  root: {
    children: [
      {
        children: [
          {
            detail: 0,
            format: 0,
            mode: "normal",
            style: "",
            text: "Private draft phrase",
            type: "text",
            version: 1,
          },
        ],
        direction: "ltr",
        format: "",
        indent: 0,
        type: "paragraph",
        version: 1,
      },
    ],
    direction: "ltr",
    format: "",
    indent: 0,
    type: "root",
    version: 1,
  },
} as Lesson["content"];

suite("Payload and PostgreSQL integration", () => {
  beforeAll(async () => {
    payload = await getPayload({ config });
    const subject = await payload.create({
      collection: "subjects",
      overrideAccess: true,
      data: {
        _status: "published",
        description: "Integration subject",
        displayOrder: 999,
        slug: `test-subject-${suffix}`,
        title: "Integration Subject",
      },
    });
    subjectID = subject.id;
    const chapter = await payload.create({
      collection: "chapters",
      overrideAccess: true,
      data: {
        _status: "published",
        description: "Integration chapter",
        displayOrder: 1,
        slug: `test-chapter-${suffix}`,
        subject: subject.id,
        title: "Integration Chapter",
      },
    });
    chapterID = chapter.id;
    const lesson = await payload.create({
      collection: "lessons",
      draft: true,
      overrideAccess: true,
      data: {
        _status: "draft",
        chapter: chapter.id,
        content,
        displayOrder: 1,
        readingTime: 1,
        slug: `test-lesson-${suffix}`,
        summary: "Integration summary",
        title: "Integration Lesson",
      },
    });
    lessonID = lesson.id;
  }, 30_000);

  afterAll(async () => {
    if (lessonID)
      await payload.delete({
        collection: "lessons",
        id: lessonID,
        overrideAccess: true,
      });
    if (chapterID)
      await payload.delete({
        collection: "chapters",
        id: chapterID,
        overrideAccess: true,
      });
    if (subjectID)
      await payload.delete({
        collection: "subjects",
        id: subjectID,
        overrideAccess: true,
      });
    await payload?.destroy();
  });

  it("hides a draft, then exposes and indexes it after publishing", async () => {
    const hidden = await payload.find({
      collection: "lessons",
      overrideAccess: false,
      where: { id: { equals: lessonID } },
    });
    expect(hidden.totalDocs).toBe(0);
    await payload.update({
      collection: "lessons",
      id: lessonID!,
      overrideAccess: true,
      data: { _status: "published" },
    });
    const visible = await payload.find({
      collection: "lessons",
      overrideAccess: false,
      where: { id: { equals: lessonID } },
    });
    expect(visible.totalDocs).toBe(1);
    const indexed = await payload.find({
      collection: "search",
      overrideAccess: false,
      where: { slug: { equals: `test-lesson-${suffix}` } },
    });
    expect(indexed.docs[0]).toMatchObject({
      content: "Private draft phrase",
      summary: "Integration summary",
    });
  });

  it("does not allow an unauthenticated caller to create an administrator", async () => {
    await expect(
      payload.create({
        collection: "users",
        overrideAccess: false,
        data: {
          email: `public-${suffix}@example.com`,
          name: "Public User",
          password: "not-a-real-password",
        },
      }),
    ).rejects.toThrow();
  });
});
