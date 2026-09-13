import Link from "next/link";

import type { Chapter, Lesson } from "@/payload-types";

export type NavigationChapter = { chapter: Chapter; lessons: Lesson[] };

export function LessonSidebar({
  activeSlug,
  navigation,
}: {
  activeSlug: string;
  navigation: NavigationChapter[];
}) {
  return (
    <aside className="course-nav">
      <details open>
        <summary>Course navigation</summary>
        <nav aria-label="Course navigation">
          {navigation.map(({ chapter, lessons }) => (
            <section key={chapter.id}>
              <h2>{chapter.title}</h2>
              <ol>
                {lessons.map((lesson) => (
                  <li key={lesson.id}>
                    <Link
                      aria-current={
                        lesson.slug === activeSlug ? "page" : undefined
                      }
                      href={`/lessons/${lesson.slug}`}
                    >
                      {lesson.title}
                    </Link>
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </nav>
      </details>
    </aside>
  );
}
