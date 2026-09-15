# WebDoc

WebDoc is an English educational publishing platform built with Next.js, Payload CMS, and PostgreSQL. Content is organized as `Subject → Chapter → Lesson`; public readers see only published material, while multiple administrators manage drafts, revisions, media, search, and previews at `/admin`.

## Requirements

- Node.js 22.14 or newer
- Corepack (included with Node.js)
- Docker Desktop or another PostgreSQL 17 instance

## First run

```powershell
Copy-Item .env.example .env
corepack enable
docker compose up -d postgres
corepack pnpm install
corepack pnpm migrate
corepack pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) for the public website and [http://localhost:3000/admin](http://localhost:3000/admin) to create the first administrator. Payload disables the create-first-user screen after that account exists; further administrators are created by an authenticated administrator.

Replace both sample secrets in `.env` before creating an administrator. `PAYLOAD_SECRET` should be at least 32 random characters. The local database credentials in `.env.example` match `docker-compose.yml` and are intended only for local development.

## Sample content

After the migration has run, the optional idempotent seed command creates one published subject, one chapter, and two English lessons:

```powershell
corepack pnpm seed
```

The seed does not create an administrator and does nothing when any subject already exists.

## Content workflow

1. Create media with meaningful alternative text.
2. Create and publish a subject.
3. Create chapters linked to that subject.
4. Create lessons linked to chapters, using only the enabled heading, list, quote, link, code, media, YouTube, and callout tools.
5. Use Preview or Live Preview before publishing. Slugs are generated on creation and are not changed when a title changes.

### AI-assisted lesson authoring

Lesson editors include **Import Markdown**, **Export Markdown**, **Download Template**, and **Copy AI Prompt**. One UTF-8 `.md` file creates or updates one lesson body; on a new lesson, frontmatter can also set `title`, `slug`, `summary`, and `displayOrder`. Choose the chapter manually, review imported content, and save or publish normally.

Markdown supports ordinary text formatting, H2-H4 headings, lists, quotes, links, fenced code, callouts, YouTube blocks, and existing media references such as `![media:42]()`. Media IDs only work in this CMS. Tables, task lists, HTML/MDX, unknown tags, and external or local images are rejected. See [AI authoring instructions](docs/ai-authoring.md) for the canonical template and prompt.

Only authenticated administrators can write content or upload media. All administrators have equal permissions. Draft children whose parent is unpublished are also hidden from public queries.

## Commands

```powershell
corepack pnpm dev                 # development server and admin panel
corepack pnpm generate:types      # refresh generated Payload types
corepack pnpm generate:importmap  # refresh Payload admin bindings
corepack pnpm migrate:create name # create a migration after schema changes
corepack pnpm migrate             # apply pending migrations
corepack pnpm seed                # add optional sample content
corepack pnpm test:int            # unit and access-rule tests
corepack pnpm test:e2e            # Playwright browser tests (requires PostgreSQL)
corepack pnpm lint
corepack pnpm typecheck
corepack pnpm build
corepack pnpm start
```

Uploaded files are stored in `media/` and are intentionally ignored by Git. Reading progress and the selected color theme remain in each visitor's browser; no public account is created and no progress is synchronized.

## Resetting local services

Stop the database without deleting its data:

```powershell
docker compose down
```

To remove the local database volume as well, run `docker compose down --volumes`. This permanently deletes local CMS data and should only be used when a full reset is intended.

## Version-one boundaries

There is no public registration, student account, comment system, quiz, payment, certificate, bookmark, like, analytics dashboard, S3 adapter, or production deployment configuration. Linux1st influenced the clear reading hierarchy only; none of its content, branding, or visual design is included.
