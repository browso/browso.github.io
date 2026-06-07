# Agent Modes And Automation

This page is a contributor reference. Users do not need to choose a mode:
Browso selects one from the wording of each request.

## Automatic Modes

| Mode | Typical request |
| --- | --- |
| Copilot | Explain, summarize, or answer from the current page |
| Research | Compare tabs, sources, evidence, or alternatives |
| Shopping | Compare products, prices, sellers, reviews, and returns |
| Scraper | Extract a table or repeatable set of fields |
| Developer | Read technical documentation or explain implementation details |
| Security | Check visible phishing and security signals defensively |

All modes use the same browser, AI provider, saved knowledge, memory, and safety
rules. A mode changes how the request is framed; it is not a separate app.

## What Automation Can Do

Browso can work in its open tabs to:

- search and navigate
- read page text and visible page state
- click ordinary controls
- enter non-sensitive text
- scroll and wait
- compare products or search results
- report the active step in the AI panel

It does not receive unrestricted access to the operating system through the
browser agent.

## When Automation Stops

Before a browser task starts, Browso checks whether it is ordinary,
consequential, or prohibited.

- Read-only and reversible browsing can continue.
- Login, checkout, submission, download, booking, and deletion require user
  control.
- CAPTCHA bypass, phishing, spam, credential theft, and offensive exploitation
  are blocked.

The user must complete sensitive steps directly. There is currently no
one-click approval that lets an existing task continue through them.

## Current Limits

- Website layout changes can break clicking and extraction.
- Login and anti-bot pages require user control.
- A screenshot and extracted page text may not always match.
- Automation uses the user's live Browso tabs rather than a separate isolated
  browser session.

Mode definitions live in `src/main/AgentModes.ts`. Browser tools are defined in
`src/main/AgentTools.ts`, and the preflight rules are in
`src/main/SafetyPolicy.ts`.
