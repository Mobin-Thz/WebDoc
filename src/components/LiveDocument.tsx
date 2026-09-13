"use client";

import { useLivePreview } from "@payloadcms/live-preview-react";
import type { ReactNode } from "react";

import type { Chapter, Lesson, Subject } from "@/payload-types";
import { RichText } from "./RichText";
import { MediaView } from "./MediaView";
import type { LexicalContent } from "@/lib/content";

const serverURL = process.env.NEXT_PUBLIC_SERVER_URL ?? "http://localhost:3000";

export function LiveSubject({
  initialData,
  lessonCount,
}: {
  initialData: Subject;
  lessonCount: number;
}) {
  const { data } = useLivePreview<Subject>({
    initialData,
    serverURL,
    depth: 1,
  });
  return (
    <div className="subject-hero">
      <div>
        <p className="eyebrow">Subject · {lessonCount} lessons</p>
        <h1>{data.title}</h1>
        <p className="lede">{data.description}</p>
      </div>
      <MediaView media={data.coverImage} priority />
    </div>
  );
}

export function LiveChapter({
  children,
  initialData,
}: {
  children?: ReactNode;
  initialData: Chapter;
}) {
  const { data } = useLivePreview<Chapter>({
    initialData,
    serverURL,
    depth: 1,
  });
  return (
    <>
      <p className="eyebrow">Chapter</p>
      <h1>{data.title}</h1>
      <p className="lede">{data.description}</p>
      {children}
    </>
  );
}

export function LiveLesson({ initialData }: { initialData: Lesson }) {
  const { data } = useLivePreview<Lesson>({ initialData, serverURL, depth: 3 });
  return (
    <article className="lesson-article">
      <header>
        <p className="eyebrow">Lesson</p>
        <h1>{data.title}</h1>
        <p className="lede">{data.summary}</p>
        <p className="lesson-meta">
          {data.readingTime} min read · Updated{" "}
          {new Date(data.updatedAt).toLocaleDateString("en-US", {
            dateStyle: "medium",
          })}
        </p>
      </header>
      <RichText content={data.content as unknown as LexicalContent} />
    </article>
  );
}
