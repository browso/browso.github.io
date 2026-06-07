#!/usr/bin/env node

import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { basename, dirname, extname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const siteUrl = "https://browso.org";
const docOrder = [
  "index",
  "getting-started",
  "using-browso",
  "settings-and-memory",
  "commands",
  "safety-and-privacy",
  "architecture",
  "backend",
  "agent",
  "testing",
  "build-and-release",
];

function escapeHtml(value) {
  return String(value).replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      })[character],
  );
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/<[^>]+>/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function parseFrontMatter(source) {
  if (!source.startsWith("---\n")) return { attributes: {}, body: source };
  const end = source.indexOf("\n---\n", 4);
  if (end === -1) throw new Error("Front matter is missing its closing ---");

  const attributes = {};
  for (const line of source.slice(4, end).split("\n")) {
    const separator = line.indexOf(":");
    if (separator === -1) continue;
    const key = line.slice(0, separator).trim();
    const value = line.slice(separator + 1).trim().replace(/^["']|["']$/g, "");
    attributes[key] = value;
  }
  return { attributes, body: source.slice(end + 5) };
}

function inlineMarkdown(value) {
  const code = [];
  let output = escapeHtml(value).replace(/`([^`]+)`/g, (_, content) => {
    code.push(`<code>${content}</code>`);
    return `\u0000CODE${code.length - 1}\u0000`;
  });

  output = output
    .replace(
      /!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]+)")?\)/g,
      '<img src="$2" alt="$1" loading="lazy" />',
    )
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, url) => {
      const normalized = url.replace(/\.md(?=($|#))/i, ".html");
      const external = /^https?:\/\//i.test(normalized);
      return `<a href="${normalized}"${external ? ' target="_blank" rel="noopener noreferrer"' : ""}>${label}</a>`;
    })
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/__([^_]+)__/g, "<strong>$1</strong>")
    .replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, "<em>$1</em>");

  return output.replace(/\u0000CODE(\d+)\u0000/g, (_, index) => code[Number(index)]);
}

function renderTable(lines) {
  const rows = lines.map((line) =>
    line
      .replace(/^\||\|$/g, "")
      .split("|")
      .map((cell) => cell.trim()),
  );
  return `<div class="content-table-wrap"><table><thead><tr>${rows[0]
    .map((cell) => `<th>${inlineMarkdown(cell)}</th>`)
    .join("")}</tr></thead><tbody>${rows
    .slice(2)
    .map(
      (row) =>
        `<tr>${row.map((cell) => `<td>${inlineMarkdown(cell)}</td>`).join("")}</tr>`,
    )
    .join("")}</tbody></table></div>`;
}

function renderMarkdown(source) {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const html = [];
  const headings = [];
  const headingIds = new Map();
  let paragraph = [];
  let listType = null;
  let listItems = [];
  let quote = [];
  let index = 0;

  const flushParagraph = () => {
    if (paragraph.length === 0) return;
    html.push(`<p>${inlineMarkdown(paragraph.join(" "))}</p>`);
    paragraph = [];
  };
  const flushList = () => {
    if (!listType) return;
    html.push(
      `<${listType}>${listItems
        .map((item) => `<li>${inlineMarkdown(item)}</li>`)
        .join("")}</${listType}>`,
    );
    listType = null;
    listItems = [];
  };
  const flushQuote = () => {
    if (quote.length === 0) return;
    html.push(`<blockquote><p>${inlineMarkdown(quote.join(" "))}</p></blockquote>`);
    quote = [];
  };
  const flushAll = () => {
    flushParagraph();
    flushList();
    flushQuote();
  };

  while (index < lines.length) {
    const line = lines[index];
    if (line.startsWith("```")) {
      flushAll();
      const language = line.slice(3).trim();
      const code = [];
      index += 1;
      while (index < lines.length && !lines[index].startsWith("```")) {
        code.push(lines[index]);
        index += 1;
      }
      html.push(
        `<div class="code-block"><div class="code-block-header"><span>${escapeHtml(language || "text")}</span><button type="button" data-copy-code>Copy</button></div><pre><code${language ? ` class="language-${escapeHtml(language)}"` : ""}>${escapeHtml(code.join("\n"))}</code></pre></div>`,
      );
      index += 1;
      continue;
    }

    if (
      line.includes("|") &&
      index + 1 < lines.length &&
      /^\s*\|?[\s:|-]+\|[\s:|-|]*$/.test(lines[index + 1])
    ) {
      flushAll();
      const tableLines = [line, lines[index + 1]];
      index += 2;
      while (index < lines.length && lines[index].includes("|") && lines[index].trim()) {
        tableLines.push(lines[index]);
        index += 1;
      }
      html.push(renderTable(tableLines));
      continue;
    }

    const heading = /^(#{1,6})\s+(.+)$/.exec(line);
    if (heading) {
      flushAll();
      const level = heading[1].length;
      const text = heading[2].trim();
      const baseId = slugify(text);
      const occurrence = (headingIds.get(baseId) || 0) + 1;
      headingIds.set(baseId, occurrence);
      const id = occurrence === 1 ? baseId : `${baseId}-${occurrence}`;
      if (level <= 3) headings.push({ level, text: text.replace(/[*`]/g, ""), id });
      html.push(`<h${level} id="${id}">${inlineMarkdown(text)}</h${level}>`);
      index += 1;
      continue;
    }

    const unordered = /^\s*[-*]\s+(.+)$/.exec(line);
    const ordered = /^\s*\d+\.\s+(.+)$/.exec(line);
    if (unordered || ordered) {
      flushParagraph();
      flushQuote();
      const nextType = ordered ? "ol" : "ul";
      if (listType && listType !== nextType) flushList();
      listType = nextType;
      listItems.push((unordered || ordered)[1]);
      index += 1;
      continue;
    }

    const quoteLine = /^>\s?(.*)$/.exec(line);
    if (quoteLine) {
      flushParagraph();
      flushList();
      quote.push(quoteLine[1]);
      index += 1;
      continue;
    }
    if (listType && /^\s{2,}\S/.test(line)) {
      listItems[listItems.length - 1] += ` ${line.trim()}`;
      index += 1;
      continue;
    }
    if (/^(-{3,}|\*{3,})$/.test(line.trim())) {
      flushAll();
      html.push("<hr />");
      index += 1;
      continue;
    }
    if (!line.trim()) {
      flushAll();
      index += 1;
      continue;
    }
    flushList();
    flushQuote();
    paragraph.push(line.trim());
    index += 1;
  }
  flushAll();
  return { html: html.join("\n"), headings };
}

function readingTime(source) {
  return Math.max(1, Math.ceil(source.trim().split(/\s+/).filter(Boolean).length / 220));
}

function formatDate(value) {
  const date = new Date(`${value}T12:00:00Z`);
  if (Number.isNaN(date.getTime())) throw new Error(`Invalid date: ${value}`);
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function header(active) {
  const link = (href, label, key) =>
    `<a href="${href}"${active === key ? ' aria-current="page"' : ""}>${label}</a>`;
  return `<header class="site-header content-site-header">
    <a class="brand" href="/" aria-label="Browso home">
      <img src="/assets/images/browso-white-logo.png" alt="" width="32" height="32" />
      <span>Browso</span>
    </a>
    <nav aria-label="Main navigation">
      ${link("/", "Home", "home")}
      ${link("/blog/", "Blog", "blog")}
      ${link("/docs/", "Docs", "docs")}
      ${link("/benchmarks.html", "Benchmarks", "benchmarks")}
      ${link("/releases.html", "Releases", "releases")}
    </nav>
    <a class="header-cta header-github" href="https://github.com/browso/browso" target="_blank" rel="noopener noreferrer">GitHub</a>
  </header>`;
}

function footer() {
  return `<footer class="site-footer content-footer">
    <div class="footer-brand">
      <a class="brand" href="/">
        <img src="/assets/images/browso-white-logo.png" alt="" width="32" height="32" />
        <span>Browso</span>
      </a>
      <p>An AI browser that helps you browse and act.</p>
    </div>
    <div class="content-footer-links">
      <a href="/blog/">Blog</a><a href="/docs/">Documentation</a><a href="/benchmarks.html">Benchmarks</a><a href="/releases.html">Releases</a>
    </div>
    <p class="footer-copyright">© 2026 Browso. Browse further.</p>
  </footer>`;
}

function layout({ title, description, active, canonical, body, article = false }) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content="${escapeHtml(description)}" />
    <meta name="theme-color" content="#07080b" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:type" content="${article ? "article" : "website"}" />
    <meta property="og:url" content="${siteUrl}${canonical}" />
    <title>${escapeHtml(title)} · Browso</title>
    <link rel="canonical" href="${siteUrl}${canonical}" />
    <link rel="icon" type="image/svg+xml" href="/assets/icons/favicon.svg?v=2" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&amp;family=Manrope:wght@500;600;700;800&amp;display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="/resources/css/style.css" />
  </head>
  <body class="content-page">
    <div class="reading-progress" data-reading-progress></div>
    ${header(active)}
    ${body}
    ${footer()}
    <script src="/resources/js/content.js"></script>
  </body>
</html>
`;
}

function toc(headings) {
  const items = headings
    .filter((heading) => heading.level === 2 || heading.level === 3)
    .map(
      (heading) =>
        `<a class="toc-level-${heading.level}" href="#${heading.id}">${escapeHtml(heading.text)}</a>`,
    )
    .join("");
  return items
    ? `<aside class="article-toc"><strong>On this page</strong><nav>${items}</nav></aside>`
    : "";
}

async function loadMarkdown(directory) {
  const absolute = join(root, directory);
  const files = (await readdir(absolute))
    .filter((file) => extname(file) === ".md")
    .sort();
  return Promise.all(
    files.map(async (file) => {
      const source = await readFile(join(absolute, file), "utf8");
      const { attributes, body } = parseFrontMatter(source);
      const rendered = renderMarkdown(body);
      const firstHeading = rendered.headings.find((heading) => heading.level === 1);
      const slug = basename(file, ".md").toLowerCase();
      return {
        attributes,
        body,
        html: rendered.html,
        headings: rendered.headings,
        slug,
        title: attributes.title || firstHeading?.text || slug,
        description: (
          attributes.description ||
          body
            .replace(/^#.+$/gm, "")
            .replace(/[`*_[\]()#>-]/g, "")
            .trim()
            .split(/\n\n/)[0]
        )
          .replace(/\s+/g, " ")
          .slice(0, 180),
      };
    }),
  );
}

async function write(relativePath, content) {
  const destination = join(root, relativePath);
  await mkdir(dirname(destination), { recursive: true });
  await writeFile(destination, content);
}

function docNavigation(documents, currentSlug) {
  return `<aside class="docs-sidebar" data-docs-sidebar>
    <div class="docs-sidebar-heading">
      <strong>Documentation</strong>
      <button type="button" data-docs-close aria-label="Close documentation navigation">Close</button>
    </div>
    <nav>${documents
      .map(
        (document) =>
          `<a href="/docs/${document.slug === "index" ? "" : `${document.slug}.html`}"${document.slug === currentSlug ? ' aria-current="page"' : ""}>${escapeHtml(document.title)}</a>`,
      )
      .join("")}</nav>
  </aside>`;
}

async function buildDocs() {
  const documents = await loadMarkdown("content/docs");
  documents.sort(
    (left, right) => docOrder.indexOf(left.slug) - docOrder.indexOf(right.slug),
  );
  for (const document of documents) {
    const canonical =
      document.slug === "index" ? "/docs/" : `/docs/${document.slug}.html`;
    const body = `<main class="docs-layout">
      ${docNavigation(documents, document.slug)}
      <article class="content-article docs-article">
        <button class="docs-menu-button" type="button" data-docs-open>Browse documentation</button>
        <div class="article-eyebrow">Browso documentation</div>
        <div class="markdown-body">${document.html}</div>
        <div class="article-edit-link"><a href="https://github.com/browso/browso.github.io/edit/main/content/docs/${document.slug}.md" target="_blank" rel="noopener noreferrer">Edit this page on GitHub</a></div>
      </article>
      ${toc(document.headings)}
    </main>`;
    await write(
      document.slug === "index" ? "docs/index.html" : `docs/${document.slug}.html`,
      layout({
        title: document.title,
        description: document.description,
        active: "docs",
        canonical,
        body,
        article: true,
      }),
    );
  }
  return documents;
}

async function buildBlog() {
  const posts = await loadMarkdown("content/blog");
  for (const post of posts) {
    if (!post.attributes.title || !post.attributes.date || !post.attributes.description) {
      throw new Error(
        `content/blog/${post.slug}.md requires title, date, and description`,
      );
    }
  }
  posts.sort((left, right) => right.attributes.date.localeCompare(left.attributes.date));
  const cards = posts
    .map(
      (post, index) => `<article class="blog-card${index === 0 ? " blog-card-featured" : ""}">
        <div class="blog-card-top">
          <span class="blog-card-kicker">${index === 0 ? "Featured story" : "Journal"}</span>
          <div class="blog-card-meta"><time datetime="${post.attributes.date}">${formatDate(post.attributes.date)}</time><span>${readingTime(post.body)} min read</span></div>
        </div>
        <div class="blog-card-copy">
          <h2><a href="/blog/${post.slug}.html">${escapeHtml(post.title)}</a></h2>
          <p>${escapeHtml(post.description)}</p>
        </div>
        <a class="blog-read-link" href="/blog/${post.slug}.html"><span>Read article</span><b aria-hidden="true">→</b></a>
      </article>`,
    )
    .join("");
  const indexBody = `<main class="blog-index">
    <section class="content-hero">
      <span class="section-label">Browso journal</span>
      <h1>Building Browso.</h1>
    </section>
    <section class="blog-grid">${cards || '<div class="release-state">The first Browso article is being prepared.</div>'}</section>
  </main>`;
  await write(
    "blog/index.html",
    layout({
      title: "Blog",
      description: "Product updates, engineering notes, and guides from Browso.",
      active: "blog",
      canonical: "/blog/",
      body: indexBody,
    }),
  );
  for (const post of posts) {
    const body = `<main class="article-layout">
      <article class="content-article blog-article">
        <a class="article-back" href="/blog/">← All articles</a>
        <header class="article-header">
          <span class="section-label">Browso journal</span>
          <h1>${escapeHtml(post.title)}</h1>
          <p>${escapeHtml(post.description)}</p>
          <div class="article-meta"><time datetime="${post.attributes.date}">${formatDate(post.attributes.date)}</time><span>${readingTime(post.body)} min read</span><span>${escapeHtml(post.attributes.author || "Browso team")}</span></div>
        </header>
        <div class="markdown-body">${post.html.replace(/^<h1[^>]*>.*?<\/h1>\n?/, "")}</div>
      </article>
      ${toc(post.headings)}
    </main>`;
    await write(
      `blog/${post.slug}.html`,
      layout({
        title: post.title,
        description: post.description,
        active: "blog",
        canonical: `/blog/${post.slug}.html`,
        body,
        article: true,
      }),
    );
  }
  return posts;
}

async function buildSitemap(documents, posts) {
  const urls = [
    ["/", "1.0"],
    ["/blog/", "0.9"],
    ["/docs/", "0.9"],
    ["/benchmarks.html", "0.9"],
    ["/releases.html", "0.9"],
    ["/terms.html", "0.3"],
    ["/privacy.html", "0.3"],
    ["/acceptable-use.html", "0.3"],
    ...documents
      .filter((document) => document.slug !== "index")
      .map((document) => [`/docs/${document.slug}.html`, "0.7"]),
    ...posts.map((post) => [
      `/blog/${post.slug}.html`,
      "0.8",
      post.attributes.date,
    ]),
  ];
  await write(
    "sitemap.xml",
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    ([path, priority, lastmod]) => `  <url>
    <loc>${siteUrl}${path}</loc>
${lastmod ? `    <lastmod>${lastmod}</lastmod>\n` : ""}    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>
`,
  );
}

const documents = await buildDocs();
const posts = await buildBlog();
await buildSitemap(documents, posts);
console.log(
  `Built ${documents.length} documentation pages and ${posts.length} blog posts.`,
);
