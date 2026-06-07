# Getting Started

This guide takes you from downloading Browso to asking your first question.

## 1. Download Browso

Open the [Releases page](/releases.html) and choose the download for your
computer:

- **Apple Silicon Mac:** most Macs released from late 2020 onward
- **Intel Mac:** older Macs with an Intel processor
- **Windows:** 64-bit Windows installer
- **Linux:** 64-bit AppImage

Install or open the downloaded application as you normally would on your
platform.

> If macOS warns that it cannot verify the application, open Browso from Finder
> using **Control-click > Open**, or allow it in **System Settings > Privacy &
> Security**. Only do this for a download from Browso's official release page.

## 2. Choose How The AI Runs

Browso needs an AI provider. It starts with **Ollama**, which runs models on
your computer and is the simplest option for keeping page context local.

1. Install and start [Ollama](https://ollama.com/).
2. Open a terminal and install Browso's default model:

```bash
ollama pull gemma4:e2b
```

3. Open Browso.
4. Open **Settings > AI**.
5. Keep **Ollama (Local)** selected and choose the installed model.

The usual Ollama address is `http://127.0.0.1:11434`. Change it only if your
Ollama server uses a different address.

OpenAI and Anthropic are also supported, but their API key must be configured
for the Browso installation. Page context sent to either service leaves your
computer.

## 3. Browse Normally

Use Browso like a regular browser:

- enter a website address or search in the address bar
- use the plus button to open another tab
- use the two-column button to view two tabs side by side
- use the bot button or `Ctrl+E` / `Cmd+E` to show or hide the AI panel

The default search engine is DuckDuckGo. Change it in **Settings > General**.

## 4. Ask Your First Question

Open a page, then type in the AI panel:

```text
Summarize this page and tell me the three most important points.
```

Browso automatically includes the active page and a screenshot. If you select
text before asking a question, Browso gives that selection priority.

Other useful first prompts:

```text
Explain the selected paragraph in simple language.
Compare the two open tabs.
Find the return policy on this page.
Is this page showing any suspicious signs?
```

## 5. Know When Browso Will Stop

Browso can read pages and perform ordinary browsing steps. It stops and gives
control back to you before sensitive actions such as:

- signing in or entering a password
- sending a form, email, message, or application
- buying, booking, or checking out
- deleting account data
- handling CAPTCHA challenges

You should review important information yourself before acting on it.

## Quick Fixes

### The AI Does Not Answer

Open **Settings > AI** and check that:

- Ollama is running
- the Ollama address is correct
- an installed model is selected

For a cloud provider, check that its API key is available to Browso.

### A Page Does Not Work With The Agent

Some sites block automation or change their layout frequently. Try reloading
the page, making the request more specific, or completing login and CAPTCHA
steps yourself.

### The AI Panel Is Missing

Click the bot button in the toolbar or press `Ctrl+E` / `Cmd+E`.

### Browso Uses Too Much Space

Drag the left edge of the AI panel, or change its width in
**Settings > Workspace**.

Next: [Using Browso](./using-browso.md)
