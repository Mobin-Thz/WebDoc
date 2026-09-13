import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/Breadcrumbs";
import { LiveChapter } from "@/components/LiveDocument";
import { ChapterProgress } from "@/components/ReadingProgress";
import { getChapter, getLessons, getSubject } from "@/lib/data";

type Props = { params: Promise<{ chapterSlug: string; subjectSlug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const values = await params;
  const subject = await getSubject(values.subjectSlug);
  const chapter = subject
    ? await getChapter(subject.id, values.chapterSlug)
    : undefined;
  return chapter
    ? { title: chapter.title, description: chapter.description }
    : {};
}

export default async function ChapterPage({ params }: Props) {
  const values = await params;
  const subject = await getSubject(values.subjectSlug);
  if (!subject) notFound();
  const chapter = await getChapter(subject.id, values.chapterSlug);
  if (!chapter) notFound();
  const lessons = await getLessons(chapter.id);
  return (
    <div className="container page-shell narrow">
      <Breadcrumbs
        items={[
          { href: "/subjects", label: "Subjects" },
          { href: `/subjects/${subject.slug}`, label: subject.title },
          { label: chapter.title },
        ]}
      />
      <LiveChapter initialData={chapter}>
        <ChapterProgress lessonIDs={lessons.map((lesson) => lesson.id)} />
      </LiveChapter>
      <ol className="ordered-lessons">
        {lessons.map((lesson, index) => (
          <li key={lesson.id}>
            <Link href={`/lessons/${lesson.slug}`}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <span>
                <strong>{lesson.title}</strong>
                <small>{lesson.summary}</small>
              </span>
              <small>{lesson.readingTime} min</small>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
