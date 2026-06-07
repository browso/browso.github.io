# Browso Documentation

Browso is a desktop browser with an AI assistant built into the side panel. It
can explain the page you are viewing, compare open tabs, save useful pages, and
help with multi-step browsing tasks.

## Start Here

1. [Getting Started](./getting-started.md) explains installation, AI setup, and
   your first question.
2. [Using Browso](./using-browso.md) covers tabs, split view, research,
   automation, saved pages, profiles, and data controls.
3. [Settings, Memory, And Knowledge](./settings-and-memory.md) explains every
   settings section in more detail.
4. [Commands](./commands.md) lists the optional shortcuts available in chat.
5. [Safety And Privacy](./safety-and-privacy.md) explains what can leave your
   computer and when Browso stops for user control.

## What You Can Ask Browso To Do

```text
Summarize this page in five bullet points.
Explain the text I selected.
Compare these open tabs and cite each source.
Find the return policy for this product.
Save this page so I can use it in later research.
Check this page for visible signs of phishing.
```

Browso automatically chooses the right kind of assistance from your request.
You do not need to select an agent mode.

## Important Limits

- AI answers can be wrong, incomplete, or out of date.
- Websites can block automation or change in ways that break a task.
- Browso stops before login, payment, submission, deletion, and similar
  sensitive actions.
- OpenAI and Anthropic receive the page context needed for a request. Ollama
  runs model requests through your configured local Ollama server.
- Saving a page is explicit. Browso does not silently add every visited page to
  its knowledge.

## For Contributors

These pages describe how the project is built and tested:

- [Architecture](./architecture.md)
- [Backend](./backend.md)
- [Agent Modes And Automation](./agent.md)
- [Testing Guide](./testing.md)
- [Build And Release](./build-and-release.md)
