import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "About the WebDoc learning platform.",
};

export default function AboutPage() {
  return (
    <div className="container page-shell narrow">
      <p className="eyebrow">About</p>
      <h1>Learning should feel navigable.</h1>
      <p className="lede">
        WebDoc is an English educational publishing platform that organizes
        technical material into subjects, chapters, and focused lessons.
      </p>
      <div className="prose">
        <h2>Built for understanding</h2>
        <p>
          Each subject follows a clear sequence while still making it easy to
          search, jump between lessons, and return to what you have visited.
        </p>
        <h2>Focused by design</h2>
        <p>
          The reading interface keeps course navigation, lesson content, and the
          current page outline close at hand without distracting from the
          material.
        </p>
      </div>
    </div>
  );
}
