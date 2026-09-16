# WebDoc

WebDoc is a self-hosted educational publishing platform for structured technical learning. It combines a focused public reading experience with a complete Payload CMS admin panel, using the hierarchy:

```text
Subject
└── Chapter
    └── Lesson
```

Authors can draft, preview, revise, search, and publish lessons from `/admin`. Readers can browse subjects, follow chapters in order, search published content, navigate a course from a lesson sidebar, use an automatic table of contents, and keep lightweight reading progress in their browser.

## Highlights

### Reader experience

- Featured subjects and the five most recently updated lessons on the homepage
- Subject, chapter, and lesson pages with breadcrumbs and ordered navigation
- Wide, distraction-reduced lesson layout with course navigation and an in-page outline
- Previous and next lesson links across the complete subject
- Full-text search over published lesson titles, summaries, and content
- Syntax-highlighted code blocks with a copy button
- Images with required alternative text, captions, responsive sizes, and PDF downloads
- Light and dark themes that follow the system preference and persist locally
- Per-chapter visited-lesson progress stored in the browser—no reader account required
- Responsive layouts, keyboard skip navigation, semantic landmarks, and accessible controls

### Publishing experience

- Payload CMS dashboard with desktop navigation, collection icons, and clear action controls
- Multiple administrator accounts with equal content-management permissions
- Drafts, autosave, up to 50 versions per document, preview, and responsive live preview
- Ordered subjects, chapters, and lessons through simple `displayOrder` fields
- A constrained Lexical editor for headings, lists, quotes, links, code, media, YouTube, and callouts
- Markdown import/export, a downloadable lesson template, and a reusable AI-authoring prompt
- Automatic slugs, reading-time estimates, search indexing, SEO fields, and image variants
- REST and GraphQL APIs supplied by Payload

### Publication and safety rules

- Anonymous visitors can read only published content.
- A chapter is public only when both the chapter and its subject are published.
- A lesson is public only when the lesson, its chapter, and its subject are published.
- Draft lessons are not added to the public search index.
- Only authenticated administrators can create, update, delete, upload, import, or export content.
- Preview mode requires both an authenticated administrator session and `PREVIEW_SECRET`.
- Lesson Markdown rejects unsafe links, unsupported HTML/MDX, unknown tags, tables, task lists, and non-CMS images.

## Technology

| Area | Implementation |
| --- | --- |
| Application | Next.js 16 App Router, React 19, TypeScript |
| CMS | Payload CMS 3 |
| Database | PostgreSQL 17 through `@payloadcms/db-postgres` |
| Editor | Payload Lexical rich text with custom code, YouTube, and callout blocks |
| Search and SEO | Payload Search and SEO plugins |
| Styling | Plain CSS with Vazirmatn and JetBrains Mono |
| Media | Local persistent storage, Sharp image processing, 10 MB upload limit |
| Tests | Vitest and Playwright |
| Package manager | pnpm through Corepack |

## Architecture

```text
Public pages ─┐
Admin panel ──┼── Next.js + Payload CMS ── PostgreSQL
REST/GraphQL ─┘             │
                            └── media/ or a mounted media volume
```

The public site calls Payload through its local API. Payload owns authentication, access control, drafts, versions, media, and generated APIs. PostgreSQL stores content and metadata; uploaded files are stored separately in `media/`.

## Requirements

- Node.js 22.14 or newer
- Corepack, included with supported Node.js releases
- Docker with Compose, or an existing PostgreSQL instance
- Chromium installed by Playwright when running browser tests

## Quick start

From the repository root:

```bash
cp .env.example .env
corepack enable
corepack pnpm install
docker compose up -d postgres
corepack pnpm migrate
corepack pnpm seed
corepack pnpm dev
```

On Windows PowerShell, use `Copy-Item .env.example .env` instead of `cp`.

Then open:

- Public site: [http://localhost:3000](http://localhost:3000)
- Admin panel: [http://localhost:3000/admin](http://localhost:3000/admin)

The seed step is optional. On a fresh database it creates a published **Linux Fundamentals** subject, one chapter, and two lessons. It never creates an administrator and skips itself when any subject already exists.

When the database has no users, `/admin` displays Payload's create-first-user screen. After the first administrator exists, only an authenticated administrator can create more users.

## Environment variables

Copy `.env.example` to `.env` and replace both sample secrets before creating an administrator.

| Variable | Required | Purpose | Local example |
| --- | --- | --- | --- |
| `DATABASE_URL` | Yes | PostgreSQL connection string | `postgres://webdoc:webdoc@localhost:5432/webdoc` |
| `PAYLOAD_SECRET` | Yes | Signs Payload authentication data; use at least 32 random characters | No safe default |
| `PREVIEW_SECRET` | Yes | Protects the draft-preview entry route | No safe default |
| `NEXT_PUBLIC_SERVER_URL` | Yes in production | Canonical public origin used by CORS, CSRF, metadata, previews, sitemap, and live preview | `http://localhost:3000` |

Generate a secret with Node.js:

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Run it twice and use different values for `PAYLOAD_SECRET` and `PREVIEW_SECRET`. Do not commit `.env`.

## Content model

| Collection | Main fields and behavior |
| --- | --- |
| `subjects` | Title, globally unique slug, description, cover image, display order, featured flag, drafts, versions |
| `chapters` | Title, slug unique within its subject, subject relation, description, display order, drafts, versions |
| `lessons` | Title, globally unique slug, chapter relation, summary, rich content, featured image, calculated reading time, display order, drafts, versions |
| `media` | JPEG, PNG, WebP, GIF, or PDF; required alt text, optional caption, generated thumbnail/card/content sizes |
| `users` | Authenticated administrators with a required name and email |
| `search` | Plugin-managed index containing published lesson title, summary, slug, and plain-text content |

Slugs are generated when needed and are not automatically changed after a later title edit. `displayOrder` controls ordering; lower values appear first.

## Public routes

| Route | Purpose |
| --- | --- |
| `/` | Homepage with search, featured subjects, and five recently updated lessons |
| `/subjects` | All published subjects |
| `/subjects/[subjectSlug]` | Subject overview and ordered chapters |
| `/subjects/[subjectSlug]/[chapterSlug]` | Chapter overview, reading progress, and ordered lessons |
| `/lessons/[lessonSlug]` | Lesson reader, course navigation, table of contents, and previous/next links |
| `/search?q=...` | Search published lessons |
| `/about` | Project introduction |
| `/admin` | Authenticated Payload CMS |
| `/api/[...slug]` | Payload REST API |
| `/api/graphql` | Payload GraphQL API |
| `/sitemap.xml` | Dynamic sitemap for published content |
| `/robots.txt` | Crawler rules; admin, API, and search pages are excluded |

Payload also exposes authenticated Markdown import/export endpoints under the lesson collection. The admin UI calls these directly.

## Publishing workflow

1. Sign in at `/admin`.
2. Upload reusable media and provide meaningful alternative text.
3. Create a subject, set its order and optional featured state, then publish it.
4. Create chapters related to that subject and set their order.
5. Create lessons related to each chapter, add a summary and content, then review the calculated reading time.
6. Use Preview or Live Preview to inspect drafts at mobile, tablet, and desktop sizes.
7. Publish the chapter and lesson. Every parent in the hierarchy must also be published before a child becomes public.

Unpublishing a subject immediately hides its public chapters and lessons without deleting them.

## Lesson editor

The editor intentionally supports a focused documentation vocabulary:

- Paragraphs and H2–H4 headings
- Bold, italic, and inline code
- Ordered and unordered lists
- Blockquotes and links
- CMS media uploads
- Fenced code blocks with a language label
- YouTube embeds using supported YouTube URLs
- `info`, `warning`, and `tip` callouts

Lesson headings generate stable, duplicate-safe anchors for the table of contents. Reading time is recalculated from the saved text at approximately 200 words per minute.

## Markdown and AI-assisted authoring

The lesson editor provides four actions:

- **Choose .md file** imports one UTF-8 Markdown document into the editor.
- **Export .md** downloads the current lesson as Markdown.
- **Get template** downloads a valid starter document.
- **Copy AI prompt** copies instructions suitable for a preferred AI writing tool.

Frontmatter can set these fields when importing a new lesson:

```yaml
---
title: Working With Files
slug: working-with-files
summary: Learn how to create and inspect files safely.
displayOrder: 1
---
```

Supported Markdown includes paragraphs, H2–H4 headings, emphasis, inline code, lists, quotes, links, fenced code, callouts, YouTube blocks, and existing CMS media references such as `![media:42]()`. Media IDs must already exist in this CMS.

The importer validates structure and references, but it cannot verify factual accuracy. Review AI-generated material and commands before publishing. See [docs/ai-authoring.md](docs/ai-authoring.md) for the canonical example and authoring instructions.

## Media storage

Development uploads are written to `media/`, which is ignored by Git. Images receive the following derived sizes:

| Name | Size |
| --- | --- |
| `thumbnail` | 320 × 200, cropped |
| `card` | 720 × 450, cropped |
| `content` | Up to 1440 px wide, never enlarged |

The Docker deployment mounts a persistent volume at `/app/media`. Back up this volume together with PostgreSQL; database records alone do not contain uploaded file data.

## Commands

| Command | Purpose |
| --- | --- |
| `corepack pnpm dev` | Start the development server and admin panel |
| `corepack pnpm build` | Create a production build |
| `corepack pnpm start` | Run the production build |
| `corepack pnpm lint` | Run ESLint |
| `corepack pnpm typecheck` | Run TypeScript without emitting files |
| `corepack pnpm test:int` | Run Vitest unit, parser, access, and optional database integration tests |
| `corepack pnpm test:e2e` | Run Playwright browser tests |
| `corepack pnpm seed` | Add the optional sample subject, chapter, and lessons |
| `corepack pnpm migrate` | Apply pending database migrations |
| `corepack pnpm migrate:create name` | Create a migration after a schema change |
| `corepack pnpm generate:types` | Regenerate `src/payload-types.ts` |
| `corepack pnpm generate:importmap` | Regenerate the Payload admin import map |
| `corepack pnpm payload` | Run the Payload CLI |

## Testing

Static checks do not require a running application:

```bash
corepack pnpm typecheck
corepack pnpm lint
```

Vitest runs pure unit tests without a database. Its Payload integration suite also runs when `DATABASE_URL` and `PAYLOAD_SECRET` are present:

```bash
docker compose up -d postgres
corepack pnpm migrate
corepack pnpm test:int
```

The public Playwright flow expects the sample lessons in a fresh database. Playwright starts the application automatically:

```bash
corepack pnpm exec playwright install chromium
corepack pnpm seed
corepack pnpm test:e2e
```

The browser suite covers the public shell, theme persistence, keyboard access, search, lesson navigation, code copying, local progress, mobile navigation, administrator login, and authenticated preview.

## Database migrations and generated files

When a Payload collection or field changes:

```bash
corepack pnpm generate:types
corepack pnpm generate:importmap
corepack pnpm migrate:create describe-the-change
corepack pnpm migrate
```

Commit the generated types, import map, and migration. Do not edit `src/payload-types.ts` or the admin import map by hand.

## Production deployment with Docker

`compose.freestyle.yml` builds the application, waits for PostgreSQL, applies migrations, starts Next.js, and persists both database and media data.

Create a production environment file containing:

```dotenv
POSTGRES_PASSWORD=use-a-long-random-password
PAYLOAD_SECRET=use-a-different-long-random-secret
PREVIEW_SECRET=use-another-long-random-secret
NEXT_PUBLIC_SERVER_URL=https://docs.example.com
```

Then run:

```bash
docker compose -f compose.freestyle.yml up -d --build
```

Place a TLS-enabled reverse proxy in front of port 3000. The repository does not include domain, TLS, email, object-storage, monitoring, or automated backup configuration. Local-volume media is appropriate for one application instance; use shared object storage before horizontally scaling the app.

## Resetting local services

Stop PostgreSQL without deleting its data:

```bash
docker compose down
```

To delete the local PostgreSQL volume as well:

```bash
docker compose down --volumes
```

The second command permanently removes local CMS database data. The development `media/` directory is separate and must be removed manually if a complete local reset is intended.

## Project structure

```text
src/
├── app/
│   ├── (frontend)/       Public pages, preview routes, and site styles
│   └── (payload)/        Payload admin and generated API routes
├── blocks/               Lexical code, YouTube, and callout blocks
├── collections/          Payload collection definitions and endpoints
├── components/           Public reader and admin components
├── lib/                  Data access, content utilities, slugs, and Markdown conversion
├── migrations/           PostgreSQL schema migrations
├── payload.config.ts     Payload, database, search, SEO, and admin configuration
├── payload-types.ts      Generated Payload types
└── seed.ts               Optional idempotent sample content
tests/
├── e2e/                  Playwright public and admin flows
└── *.test.ts             Vitest unit and integration tests
docs/
└── ai-authoring.md       Canonical Markdown and AI-authoring guide
```

## Current boundaries

WebDoc does not currently include public registration, student accounts, synchronized progress, comments, quizzes, payments, certificates, bookmarks, likes, analytics, custom administrator roles, outbound email, S3-compatible storage, or a production reverse proxy. These are deliberate version-one boundaries rather than partially implemented features.

The reading hierarchy was informed by documentation sites such as Linux1st, but WebDoc does not include their content, branding, or visual design.
