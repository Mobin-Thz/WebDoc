import type { Metadata } from "next";
import Link from "next/link";

import { SearchForm } from "@/components/SearchForm";
import { searchLessons } from "@/lib/data";
import type { Lesson } from "@/payload-types";

export const metadata: Metadata = {
  title: "Search",
  robots: { index: false, follow: true },
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const query = (await searchParams).q?.trim() ?? "";
  const results = await searchLessons(query);
  return (
    <div className="container page-shell narrow">
      <p className="eyebrow">Find a lesson</p>
      <h1>Search</h1>
      <SearchForm />
      {query && (
        <p className="result-count">
          {results.length} result{results.length === 1 ? "" : "s"} for “{query}”
        </p>
      )}
      <div className="search-results">
        {results.map((result) => {
          const lesson =
            typeof result.doc.value === "object"
              ? (result.doc.value as Lesson)
              : null;
          return (
            <article key={result.id}>
              <h2>
                <Link href={`/lessons/${result.slug ?? lesson?.slug}`}>
                  {result.title ?? lesson?.title}
                </Link>
              </h2>
              <p>{result.summary ?? lesson?.summary}</p>
            </article>
          );
        })}
      </div>
      {!query && (
        <p className="empty">
          Enter a title, summary, or phrase from a lesson.
        </p>
      )}
      {query && !results.length && (
        <p className="empty">No published lessons matched your search.</p>
      )}
    </div>
  );
}
