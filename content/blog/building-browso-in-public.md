---
title: "Building Browso in public"
date: "2026-06-07"
description: "Why Browso publishes its benchmarks, releases, and technical documentation in the open."
author: "Browso team"
---

# Building Browso in public

Browso is an AI browser designed to help people research, compare, and act on
the web while keeping important decisions under user control.

We are building the project in public because browser automation needs more than
promises. It needs visible engineering decisions, measurable performance, and
clear safety boundaries.

## What we publish

The Browso website now keeps three public records:

- **Benchmarks** show how development changes affect build and test performance.
- **Releases** preserve stable downloads and explain what changed.
- **Documentation** describes the architecture, automation model, local data,
  testing, and release process.

## A simple publishing workflow

Writing should not require editing HTML. A blog post is one Markdown file with a
small header:

```markdown
---
title: "Article title"
date: "2026-06-07"
description: "A short summary shown on the blog page."
author: "Your name"
---

# Article title

Write the article here.
```

After the file is pushed, GitHub Actions builds the article page, updates the
blog index and sitemap, and republishes the website.

## What comes next

We will use the journal for meaningful product updates, engineering notes, and
guides. Release announcements remain connected to the release catalog so users
can always find the appropriate download.
