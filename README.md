# WebDoc

WebDoc is an English technical-learning publishing platform. It combines a Next.js App Router frontend, Payload CMS for editorial management, PostgreSQL for persistence, and a source-managed shadcn/ui component layer.

Content follows a simple hierarchy:

```text
Subject
  └── Chapter
        └── Lesson
```

The public site exposes published content to readers. Authenticated administrators create drafts, upload media, manage revisions, use live preview, and publish lessons from Payload's admin panel.

## Features

- Subject, chapter, and lesson publishing workflow.
- Drafts, autosave, revisions, and authenticated administration through Payload CMS.
- Public visibility rules that hide unpublished documents and unpublished ancestors.
- Lexical lesson editor with headings, emphasis, lists, quotes, links, uploads, code, YouTube, and callouts.
- Search powered by Payload's search plugin over lesson titles, summaries, and extracted text.
- Live Preview for subjects, chapters, and lessons.
- SEO metadata, canonical lesson URLs, Open Graph images, sitemap, and robots routes.
- Local image/PDF uploads with generated image sizes.
- Browser-only reading progress for lessons.
- System-aware light/dark theme switching through `next-themes`.
- shadcn/ui primitives for buttons, inputs, cards, badges, alerts, breadcrumbs, and progress indicators.

## Requirements

- Node.js `22.14` or newer.
- Corepack, which is included with Node.js.
- Docker Desktop or another PostgreSQL 17 instance.

The project uses pnpm through Corepack. The package manager version is pinned in `package.json`.

## Quick start

### 1. Configure the environment

```powershell
Copy-Item .env.example .env
```

Replace both sample secrets before creating an administrator:

- `PAYLOAD_SECRET`: at least 32 random characters.
- `PREVIEW_SECRET`: a separate random secret used by preview URLs.

The database values in `.env.example` match the included Docker Compose service and are suitable only for local development.

### 2. Start PostgreSQL

```powershell
docker compose up -d postgres
```

### 3. Install dependencies and apply migrations

```powershell
corepack enable
corepack pnpm install
corepack pnpm migrate
```

### 4. Start the development server

```powershell
corepack pnpm dev
```

Open:

- Public site: [http://localhost:3000](http://localhost:3000)
- Payload admin: [http://localhost:3000/admin](http://localhost:3000/admin)

The first visit to `/admin` allows creation of the first administrator. Additional administrators must be created by an authenticated administrator.

## Environment variables

| Variable | Purpose | Example |
| --- | --- | --- |
| `DATABASE_URL` | PostgreSQL connection string | `postgres://webdoc:webdoc@localhost:5432/webdoc` |
| `PAYLOAD_SECRET` | Payload encryption and authentication secret | random 32+ character value |
| `PREVIEW_SECRET` | Secret used to enable draft preview routes | random secret |
| `NEXT_PUBLIC_SERVER_URL` | Public base URL used by Payload, metadata, CORS, and preview | `http://localhost:3000` |

Never commit `.env` or production secrets. The committed `.env.example` contains development placeholders only.

## Project architecture

```text
src/
├── app/
│   ├── (frontend)/       Public pages, layouts, styles, preview routes
│   └── (payload)/        Payload admin and API routes
├── blocks/               Custom Lexical editor blocks
├── collections/          Payload collection definitions
├── components/           Public UI and client interaction components
│   └── ui/               Source-managed shadcn/ui primitives
├── lib/                  CMS access, content parsing, slugs, utilities
├── migrations/           Payload database migrations
├── editor.ts             Lexical editor feature configuration
├── payload.config.ts     Payload CMS configuration
└── seed.ts               Optional idempotent sample data
```

### Frontend and routing

The public app uses the Next.js App Router and route groups. The `(frontend)` group does not appear in URLs; `(payload)` contains the CMS integration.

| Route | Purpose |
| --- | --- |
| `/` | Homepage with featured subjects and recently updated lessons |
| `/about` | About page |
| `/subjects` | Subject library |
| `/subjects/[subjectSlug]` | Subject overview and chapter list |
| `/subjects/[subjectSlug]/[chapterSlug]` | Chapter overview and lesson list |
| `/lessons/[lessonSlug]` | Lesson reader with navigation, table of contents, and JSON-LD |
| `/search?q=...` | Lesson search |
| `/admin` | Payload administration |
| `/api/...` | Payload REST/GraphQL and frontend preview endpoints |
| `/sitemap.xml` | Generated sitemap |
| `/robots.txt` | Robots metadata |

Pages fetch CMS data on the server. Independent homepage queries run in parallel, and repeated subject/chapter/lesson lookups are request-deduplicated with React `cache`.

### Payload collections

#### Subjects

Subjects have a title, generated slug, description, optional cover image, display order, and featured flag. Slugs are generated when a document is created and are not automatically changed when the title changes.

#### Chapters

Chapters belong to a subject and have a title, generated slug, description, and display order. The subject/slug pair is unique.

#### Lessons

Lessons belong to a chapter and have a title, generated slug, summary, Lexical content, optional featured image, reading time, and display order. Reading time is recalculated from the content before a lesson is saved.

#### Media

Media supports JPEG, PNG, WebP, GIF, and PDF files. Images receive thumbnail, card, and content sizes. Every media item requires meaningful alternative text.

#### Users

Users are authenticated Payload administrators. There is no public registration or student account system.

### Access control and publication

All create, update, and delete operations require an authenticated user. Public reads are restricted as follows:

- Subjects must be published.
- Chapters must be published and their subject must be published.
- Lessons must be published and both their chapter and subject must be published.
- Administrators can read and manage drafts.

These rules are defined in [src/access.ts](src/access.ts) and reused by the collection configurations.

### Drafts and preview

Payload draft mode is exposed through the frontend preview endpoints:

- `/api/preview?secret=...&path=...` enables preview for a validated path.
- `/api/exit-preview` exits draft mode.

Live Preview components subscribe to Payload's live-preview data for subjects, chapters, and lessons. The server URL comes from `NEXT_PUBLIC_SERVER_URL`.

### Lesson content

The editor configuration in [src/editor.ts](src/editor.ts) enables:

- Paragraphs and headings (`h2`, `h3`, `h4`).
- Bold, italic, and inline code.
- Ordered and unordered lists.
- Block quotes.
- Internal and external links.
- Media uploads.
- Custom code, YouTube, and callout blocks.

[src/lib/content.ts](src/lib/content.ts) extracts plain text, calculates reading time, generates heading slugs, and builds the lesson table of contents. [src/components/RichText.tsx](src/components/RichText.tsx) renders the supported Lexical nodes.

## UI, styling, and themes

The project uses shadcn/ui in source form rather than consuming a compiled component library. Components live in `src/components/ui` and are configured by [components.json](components.json).

Current primitives include:

- `Button`
- `Input`
- `Card`
- `Badge`
- `Alert`
- `Breadcrumb`
- `Progress`

The project uses the shadcn Base UI preset, Tailwind CSS v4, `class-variance-authority`, `clsx`, and `tailwind-merge`.

Theme handling is provided by `next-themes`:

- The provider is mounted in the frontend layout.
- Themes are applied with the `class` attribute.
- `system` is the default preference.
- The toggle is hydration-safe and switches between light and dark modes.
- Theme CSS should use shadcn semantic variables such as `--background`, `--foreground`, `--primary`, `--muted`, and `--border`.

Editorial layouts and rich-text presentation still use the app stylesheet in `src/app/(frontend)/styles.css`; shadcn primitives handle reusable controls and surfaces.

## Content workflow

1. Upload media and provide accurate alternative text.
2. Create and publish a subject.
3. Create chapters linked to that subject.
4. Create lessons linked to chapters.
5. Add content using the enabled editor features and custom blocks.
6. Use Preview or Live Preview to check draft content.
7. Publish the lesson.

The public site will not expose a draft lesson when its chapter or subject is unpublished.

## Commands

Run commands from the project root:

```powershell
corepack pnpm dev                 # Start Next.js and Payload development mode
corepack pnpm build               # Create a production build
corepack pnpm start               # Start the production server
corepack pnpm lint                # Run ESLint
corepack pnpm typecheck           # Run TypeScript without emitting files
corepack pnpm test:int            # Run Vitest unit/integration tests
corepack pnpm test:e2e            # Run Playwright browser tests
corepack pnpm test                # Alias for test:int
corepack pnpm migrate             # Apply pending Payload migrations
corepack pnpm migrate:create name # Create a migration after schema changes
corepack pnpm generate:types      # Regenerate src/payload-types.ts
corepack pnpm generate:importmap  # Regenerate Payload admin import bindings
corepack pnpm seed                 # Insert optional sample content
```

The Playwright suite starts `corepack pnpm dev` automatically when no compatible server is already running. End-to-end tests require PostgreSQL and valid environment variables.

## Sample content

After migrations are applied, run:

```powershell
corepack pnpm seed
```

The seed is idempotent. It creates one published subject, one chapter, and two English lessons only when no subject exists. It never creates an administrator.

## Database and uploads

The included `docker-compose.yml` starts PostgreSQL 17 with:

- Database: `webdoc`
- User: `webdoc`
- Password: `webdoc`
- Port: `5432`

Uploaded files are stored in the local `media/` directory and are ignored by Git. Production deployments should use durable storage and a suitable backup strategy before relying on uploaded media.

To stop PostgreSQL while preserving its volume:

```powershell
docker compose down
```

To permanently remove the local database volume:

```powershell
docker compose down --volumes
```

The second command deletes local CMS data and should be used only for an intentional reset.

## Testing strategy

- `tests/access.test.ts` verifies administrator and publication access rules.
- `tests/content.test.ts` verifies text extraction, reading time, heading anchors, slug normalization, and YouTube URL validation.
- `tests/payload.integration.test.ts` contains database-backed integration coverage and skips when the integration environment is unavailable.
- `tests/e2e/admin.spec.ts` covers the admin surface.
- `tests/e2e/public.spec.ts` covers public navigation and content behavior.

Before opening a pull request, run:

```powershell
corepack pnpm typecheck
corepack pnpm lint
corepack pnpm test:int
corepack pnpm build
```

## Schema and generated files

When changing a Payload collection:

1. Update the collection definition in `src/collections`.
2. Create a migration with `corepack pnpm migrate:create <name>`.
3. Apply it with `corepack pnpm migrate`.
4. Regenerate types with `corepack pnpm generate:types`.
5. Regenerate the admin import map when required.
6. Run typecheck, tests, lint, and a production build.

Do not manually edit `src/payload-types.ts` or the generated Payload admin import map. They are derived artifacts.

## Deployment notes

The repository includes application configuration but does not prescribe a production hosting provider. A production deployment needs:

- A managed PostgreSQL database.
- A persistent media storage strategy or an object-storage adapter.
- Secure values for all environment variables.
- A migration step before starting the new application version.
- A deployment URL in `NEXT_PUBLIC_SERVER_URL`.
- Backups for database content and uploaded media.
- A process for creating the initial administrator.

Run the production application with:

```powershell
corepack pnpm build
corepack pnpm start
```

The app currently uses Google-hosted fonts through `next/font/google`; builds need network access to download them unless the fonts are changed to locally hosted assets.

## Current boundaries

The version-one scope intentionally does not include public registration, student accounts, comments, quizzes, payments, certificates, bookmarks, likes, analytics dashboards, cloud media storage, or a provider-specific deployment configuration.

Reading progress and theme preference are stored only in each visitor's browser. They are not associated with a user account or synchronized across devices.
