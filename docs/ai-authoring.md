# AI lesson authoring

In the lesson editor, choose **Copy AI Prompt** and give the copied text to your preferred AI tool. Ask it to return only the Markdown file contents, then use **Import Markdown** to review the result before saving or publishing.

```md
---
title: Working With Files
slug: working-with-files
summary: Learn how to create and inspect files safely.
displayOrder: 1
---

# Working With Files

Files store information used by your programs.

## Create a file

Use `touch` to create an empty file.

```bash
touch notes.txt
```

<callout kind="tip">Practice in a temporary directory.</callout>
```

Supported content: paragraphs, H2-H4 headings, bold, italic, inline code, lists, quotes, links, fenced code, callouts, YouTube blocks, and existing CMS media references such as `![media:42]()`. Media IDs work only in this CMS; do not ask an AI to invent them.

Unsupported content is rejected: tables, task lists, HTML, MDX, unknown tags, external images, and local image files. Format validation checks structure only. Review every AI-generated lesson for accuracy and safety before publishing.
