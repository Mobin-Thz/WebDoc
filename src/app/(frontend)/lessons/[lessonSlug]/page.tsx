import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/Breadcrumbs";
import {
  LessonSidebar,
  type NavigationChapter,
} from "@/components/LessonSidebar";
import { LiveLesson } from "@/components/LiveDocument";
import { MarkLessonVisited } from "@/components/ReadingProgress";
import { buildToc, type LexicalContent } from "@/lib/content";
import { getChapters, getLesson, getLessons, relation } from "@/lib/data";
import type { Chapter, Media, Subject } from "@/payload-types";

type Props = { params: Promise<{ lessonSlug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const lesson = await getLesson((await params).lessonSlug);
  if (!lesson) return {};
  const image = relation<Media>(
    lesson.meta?.image ?? lesson.featuredImage ?? 0,
  );
  return {
    title: lesson.meta?.title ?? lesson.title,
    description: lesson.meta?.description ?? lesson.summary,
    alternates: { canonical: `/lessons/${lesson.slug}` },
    openGraph: {
      images: image?.url ? [image.url] : undefined,
      type: "article",
    },
  };
}

export default async function LessonPage({ params }: Props) {
  const lesson = await getLesson((await params).lessonSlug);
  if (!lesson) notFound();
  const chapter = relation<Chapter>(lesson.chapter);
  const subject = chapter ? relation<Subject>(chapter.subject) : null;
  if (!chapter || !subject) notFound();

  const chapters = await getChapters(subject.id);
  const navigation: NavigationChapter[] = await Promise.all(
    chapters.map(async (item) => ({
      chapter: item,
      lessons: await getLessons(item.id),
    })),
  );
  const ordered = navigation.flatMap((item) => item.lessons);
  const currentIndex = ordered.findIndex((item) => item.id === lesson.id);
  const previous = currentIndex > 0 ? ordered[currentIndex - 1] : undefined;
  const next = currentIndex >= 0 ? ordered[currentIndex + 1] : undefined;
  const toc = buildToc(lesson.content as unknown as LexicalContent);
  const jsonLD = {
    "@context": "https://schema.org",
    "@type": "Article",
    dateModified: lesson.updatedAt,
    headline: lesson.title,
    isPartOf: { "@type": "Course", name: subject.title },
  };

  return (
    <div className="lesson-shell">
      <MarkLessonVisited lessonID={lesson.id} />
      <LessonSidebar activeSlug={lesson.slug} navigation={navigation} />
      <div className="lesson-main">
        <Breadcrumbs
          items={[
            { href: "/subjects", label: "Subjects" },
            { href: `/subjects/${subject.slug}`, label: subject.title },
            {
              href: `/subjects/${subject.slug}/${chapter.slug}`,
              label: chapter.title,
            },
            { label: lesson.title },
          ]}
        />
        <LiveLesson initialData={lesson} />
        <nav className="lesson-pager" aria-label="Lesson pagination">
          {previous ? (
            <Link href={`/lessons/${previous.slug}`}>
              <small>Previous</small>
              <strong>&larr; {previous.title}</strong>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link href={`/lessons/${next.slug}`}>
              <small>Next</small>
              <strong>{next.title} &rarr;</strong>
            </Link>
          ) : (
            <span />
          )}
        </nav>
      </div>
      <aside className="toc">
        <details open>
          <summary>On this page</summary>
          {toc.length ? (
            <nav aria-label="On this page">
              <ol>
                {toc.map((item) => (
                  <li className={`level-${item.level}`} key={item.id}>
                    <a href={`#${item.id}`}>{item.text}</a>
                  </li>
                ))}
              </ol>
            </nav>
          ) : (
            <p>No sections</p>
          )}
        </details>
      </aside>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLD).replace(/</g, "\\u003c"),
        }}
      />
    </div>
  );
}
