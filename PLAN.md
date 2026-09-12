# Documentation Website — Five-Stage Implementation Plan

## Summary

Build a public English documentation website with Next.js and Payload CMS. Payload will provide the admin panel, secure administrator authentication, media management, drafts, and rich-text editing, avoiding a separate custom CMS. The reading experience will follow the useful patterns from Linux1st—long-form lessons, code blocks, images, structured navigation, and previous/next links—with a cleaner responsive design.

## Stage 1 — Project Foundation

- Create a TypeScript project using Next.js App Router and Payload CMS.
- Use SQLite and local media storage for the initial local-only version.
- Add environment configuration, local development scripts, and setup instructions.
- Style the public site with plain CSS; do not add a UI framework.

**Done when:** the public homepage and protected Payload admin panel run locally.

## Stage 2 — Content Structure and Admin Panel

Create these collections:

- `Course`: top-level subject with title, description, slug, order, and publication status.
- `Chapter`: belongs to a course and contains a title, slug, and order.
- `Lesson`: belongs to a chapter and contains a title, slug, order, summary, and lesson body.
- `Media`: stores images with required alternative text and an optional caption.
- `User`: authenticates administrators; all administrators initially have equal permissions.

Configure the lesson editor to support headings, paragraphs, lists, links, quotes, inline images, and code blocks. Enable drafts and publishing. Use a numeric order field instead of building custom drag-and-drop sorting.

**Done when:** an administrator can create, edit, order, preview, publish, and delete the complete Course → Chapter → Lesson hierarchy.

## Stage 3 — Public Pages and Navigation

- `/`: display published courses and their documentation structure.
- `/courses/[courseSlug]`: display a course overview with its chapters and lessons.
- `/courses/[courseSlug]/[chapterSlug]/[lessonSlug]`: display the complete lesson.
- Add a responsive sidebar containing the Course → Chapter → Lesson tree and highlight the active lesson.
- Add breadcrumbs, an in-page table of contents, and previous/next lesson links based on content order.
- Return a proper 404 page for missing or unpublished content.

**Done when:** visitors can navigate the complete published hierarchy on desktop and mobile without accessing drafts.

## Stage 4 — Documentation Reading Experience

- Render Payload rich text safely without injecting raw administrator HTML.
- Render responsive images with captions and required alternative text.
- Add syntax highlighting and a copy button to code blocks.
- Generate stable heading anchors for the lesson table of contents.
- Add page title and description metadata for each course and lesson.
- Keep typography, line length, spacing, and contrast optimized for long-form reading.

**Done when:** text, images, links, lists, quotes, and code remain readable and accessible across common screen sizes.

## Stage 5 — Verification and Local Delivery

- Verify administrator login and confirm anonymous users cannot access `/admin`.
- Test multiple administrators with equal content-management access.
- Test hierarchy ordering, drafts, publishing, embedded images, code blocks, invalid URLs, and previous/next navigation.
- Run type checking, linting, and a production build.
- Perform manual accessibility and responsive checks on desktop and mobile.
- Add a small set of English sample content demonstrating the complete hierarchy and editor features.
- Document the exact commands required to install, start, and build the project locally.

**Done when:** a new developer can start the project from the README and complete the full create-to-publish workflow without undocumented steps.

## Assumptions and Deferred Features

- The interface and content are entirely in English.
- Published content is public; visitors do not need accounts.
- Multiple administrators are supported with the same permissions.
- Comments, search, public user accounts, custom administrator roles, and online deployment are excluded from the first version.
- When online deployment is required, SQLite and local media storage can be replaced with PostgreSQL and object storage.
