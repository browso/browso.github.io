# Publishing Blog Posts And Documentation

The website is generated from Markdown. GitHub Actions rebuilds and publishes
the HTML after a Markdown file is pushed to `main`.

## Add A Blog Post

Create a file in `content/blog` with a lowercase, hyphenated filename:

```text
content/blog/my-article-title.md
```

Use this format:

```markdown
---
title: "My article title"
date: "2026-06-07"
description: "One short sentence used on the blog index and in search metadata."
author: "Browso team"
---

# My article title

Write the article in Markdown.
```

The `title`, `date`, and `description` fields are required. The filename becomes
the public URL:

```text
https://browso.org/blog/my-article-title.html
```

## Update Documentation

Edit or add Markdown files in `content/docs`. The filename becomes the
documentation URL. For example:

```text
content/docs/architecture.md
https://browso.org/docs/architecture.html
```

The documentation index is `content/docs/index.md`.

## Local Preview

Generate the static pages:

```bash
node scripts/build-content.mjs
```

Then serve the repository with any static HTTP server.
