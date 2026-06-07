# Using Browso

This page explains the parts of Browso you will use most often.

## Tabs, Search, And Split View

The top of the window contains normal browser controls:

- **Back, Forward, and Reload** control the active tab.
- The **address bar** accepts either a website address or a search.
- The **plus button** opens a new tab.
- The **two-column button** shows two tabs side by side.
- The **bot button** opens and closes the AI panel.

You can change the homepage and default search engine in
**Settings > General**.

## Asking About A Page

The AI panel works with the page you are viewing. Ask direct questions such as:

```text
Summarize this article.
What does the selected text mean?
List the requirements shown on this page.
Turn this table into a clean list.
```

Browso sends the current page context automatically. You do not need to paste
the page text into chat.

`Enter` sends a message. `Shift+Enter` adds a new line.

## Researching Across Tabs

Open the pages you want to compare, then ask clearly:

```text
Compare these open tabs. Show the main differences and include the source URLs.
```

Browso recognizes research, shopping, extraction, developer, and defensive
security requests from your wording. There is no mode switch to manage.

For better results:

- open only the pages that matter
- say what you want compared
- ask Browso to identify missing or conflicting information
- verify prices, dates, and other changing details on the original sites

## Letting Browso Browse

Browso can search, open results, read pages, click, type ordinary text, scroll,
and wait for pages to load. Describe the outcome you want:

```text
Search for the official documentation and find the installation requirements.
Compare three laptops under my budget and explain the tradeoffs.
Find the support contact on this website.
```

The AI panel shows the current step while Browso is working. The message box is
temporarily locked until the task finishes.

Browso may be unable to continue when a site requires login, payment, a CAPTCHA,
or another sensitive action. Complete that step yourself and then give Browso a
new instruction.

## Saving Useful Pages

Click the bookmark button in the AI panel to save the current page for future
questions. You can also add a note:

```text
/save Use this source when comparing warranty terms
```

Saved pages stay on your computer. Browso searches them when they are relevant
to a later question. It does not automatically save every page you visit.

Use `/notes` to see recently saved pages. Review or delete saved pages in
**Settings > Data**.

## Memory

Memory is for short preferences and instructions, not complete page copies or
full chat logs.

To save a preference directly, type:

```text
@Prefer short answers with links to the source
```

Review, delete, or disable memory in **Settings > Memory**. Memory belongs to
the active context.

## Profiles And Contexts

Use **Settings > Profiles** to keep different kinds of work separate.

A profile can represent an area such as Personal, Work, or Study. Each profile
can contain multiple contexts, such as “Project Alpha” and “Weekly Research.”
Each context has its own:

- AI conversation
- saved memories
- pages saved for AI knowledge

Profiles and contexts do not create separate website logins. Browser cookies,
tabs, cache, AI provider, and general settings are shared.

## Managing Your Data

Open **Settings > Data** to:

- clear the current AI conversation
- review or delete saved pages
- clear cached website files without signing out
- clear cookies and site storage, which signs you out of websites

Browso does not keep a separate general browsing-history database.

## Updating Browso

Open **Settings > General** and select **Check Now**. When an update is
available, Browso can download it and restart to install it. If in-app updating
is unavailable for your build, Browso opens the release page for a manual
download.

See also: [Commands](./commands.md) and
[Safety And Privacy](./safety-and-privacy.md).
