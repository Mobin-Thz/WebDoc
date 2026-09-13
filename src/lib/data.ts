import config from "@payload-config";
import { draftMode } from "next/headers";
import { getPayload } from "payload";
import { cache } from "react";

import type { Chapter, Lesson, Search, Subject } from "@/payload-types";

type PayloadClient = Awaited<ReturnType<typeof getPayload>>;
type AccessOptions = { draft: boolean; overrideAccess: boolean };

const getAccessOptions = async (): Promise<AccessOptions> => {
  const preview = (await draftMode()).isEnabled;
  return { draft: preview, overrideAccess: preview };
};

const withCms = async <T>(
  query: (payload: PayloadClient, access: AccessOptions) => Promise<T>,
) => {
  const [payload, access] = await Promise.all([
    getPayload({ config }),
    getAccessOptions(),
  ]);
  return query(payload, access);
};

export async function getSubjects(featured?: boolean) {
  return withCms(async (payload, access) => {
    const result = await payload.find({
      collection: "subjects",
      depth: 1,
      limit: 100,
      ...access,
      sort: "displayOrder",
      where: featured ? { featured: { equals: true } } : undefined,
    });
    return result.docs as Subject[];
  });
}

export const getSubject = cache(async (slug: string) =>
  withCms(async (payload, access) => {
    const result = await payload.find({
      collection: "subjects",
      depth: 1,
      limit: 1,
      ...access,
      where: { slug: { equals: slug } },
    });
    return result.docs[0] as Subject | undefined;
  }),
);

export async function getChapters(subjectID: number) {
  return withCms(async (payload, access) => {
    const result = await payload.find({
      collection: "chapters",
      depth: 1,
      limit: 100,
      ...access,
      sort: "displayOrder",
      where: { subject: { equals: subjectID } },
    });
    return result.docs as Chapter[];
  });
}

export const getChapter = cache(async (subjectID: number, slug: string) =>
  withCms(async (payload, access) => {
    const result = await payload.find({
      collection: "chapters",
      depth: 1,
      limit: 1,
      ...access,
      where: {
        and: [{ subject: { equals: subjectID } }, { slug: { equals: slug } }],
      },
    });
    return result.docs[0] as Chapter | undefined;
  }),
);

export async function getLessons(chapterID: number) {
  return withCms(async (payload, access) => {
    const result = await payload.find({
      collection: "lessons",
      depth: 2,
      limit: 500,
      ...access,
      sort: "displayOrder",
      where: { chapter: { equals: chapterID } },
    });
    return result.docs as Lesson[];
  });
}

export const getLesson = cache(async (slug: string) =>
  withCms(async (payload, access) => {
    const result = await payload.find({
      collection: "lessons",
      depth: 3,
      limit: 1,
      ...access,
      where: { slug: { equals: slug } },
    });
    return result.docs[0] as Lesson | undefined;
  }),
);

export async function getRecentLessons(limit = 6) {
  return withCms(async (payload, access) => {
    const result = await payload.find({
      collection: "lessons",
      depth: 2,
      limit,
      ...access,
      sort: "-updatedAt",
    });
    return result.docs as Lesson[];
  });
}

export async function searchLessons(query: string) {
  if (!query.trim()) return [];
  return withCms(async (payload) => {
    const result = await payload.find({
      collection: "search",
      depth: 2,
      limit: 50,
      overrideAccess: false,
      sort: "-priority",
      where: {
        or: [
          { title: { like: query } },
          { summary: { like: query } },
          { content: { like: query } },
        ],
      },
    });
    return result.docs as Search[];
  });
}

export const relation = <T extends { id: number }>(
  value: number | T,
): T | null => (typeof value === "object" ? value : null);
