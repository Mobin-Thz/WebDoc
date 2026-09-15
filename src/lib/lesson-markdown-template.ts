export const LESSON_MARKDOWN_TEMPLATE = `---
title: Working With Files
slug: working-with-files
summary: Learn how to create and inspect files safely.
displayOrder: 1
---

# Working With Files

Files store information used by your programs.

## Create a file

Use \`touch\` to create an empty file.

\`\`\`bash
touch notes.txt
\`\`\`

<callout kind="tip">Practice in a temporary directory.</callout>
`

export const AI_AUTHORING_PROMPT = `Return only a WebDoc Markdown lesson file, with no explanation or enclosing code fence. Use YAML frontmatter with title, slug, summary, and displayOrder. Use only paragraphs, H2-H4 headings, bold, italic, inline code, lists, quotes, links, fenced code, <callout kind="info|warning|tip">plain text</callout>, and <youtube url="VALID_YOUTUBE_URL" title="Title" />. Do not use tables, task lists, HTML, MDX, external images, local files, or invented media IDs. Include practical examples and safety warnings for destructive commands.`
