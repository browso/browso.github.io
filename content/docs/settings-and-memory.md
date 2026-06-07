# Settings, Memory, And Knowledge

Open Settings from the button at the top of the AI panel. You can also use
`Ctrl+,` or `Cmd+,`.

## General

Use **General** to:

- check for Browso updates
- choose light or dark appearance
- change the homepage used by new tabs
- choose Google, DuckDuckGo, or Bing for address-bar searches

## AI

Use **AI** to choose the service that answers your questions:

- **Ollama** runs through your configured local Ollama server.
- **OpenAI** uses an OpenAI API key configured for Browso.
- **Anthropic** uses an Anthropic API key configured for Browso.

For Ollama, the default server address is `http://127.0.0.1:11434`. Browso
lists the models installed on that server. The default model is `gemma4:e2b`.

Cloud providers can receive your question, current page context, screenshot,
relevant saved pages, and enabled memory. Use Ollama when that information
should stay with your local model server.

## Workspace

Use **Workspace** to change the width of the AI panel. You can also resize it by
dragging its left edge.

The automatic local-runner option controls whether suitable code, file, and
data tasks can move to Browso's scoped local runner.

## Profiles And Contexts

Profiles group multiple named contexts. The application always keeps at least
one profile and one context per profile.

Each context isolates:

- the live AI conversation
- saved user memories
- pages saved for local AI knowledge

Switching context immediately swaps those three data sources. The context name,
profile name, and optional purpose are included in the AI system prompt.
Existing flat memory and knowledge files migrate into the default
`Personal / General` context.

Browser tabs, website cookies, cache, provider credentials, and general
application preferences remain shared. Profiles do not create separate website
login sessions.

The Data tab provides explicit local-data controls:

- clear the current AI conversation
- review, delete, or clear pages saved for AI knowledge
- clear the browser cache without removing sign-ins
- clear cookies and site storage, which signs users out of websites

The application does not persist a general browsing-history database.

## User Memory

Memory stores durable facts about how the assistant should work with the user.

Categories:

- `preference`
- `profile`
- `workflow`
- `instruction`

Memory can be added explicitly with `@...` or distilled from phrases such as
“remember that”, “I prefer”, and “always”.

Memory is bounded to 100 entries. Duplicate normalized content updates the
existing entry.

## Saved Knowledge

Knowledge stores pages the user explicitly chooses to preserve.

Each page contains:

- ID
- title and URL
- normalized readable text
- selected text captured at save time
- optional note
- creation and update timestamps

Save a page with the bookmark button or `/save`. Saving the same URL updates the
existing record.

## Retrieval

Each chat request searches saved knowledge locally using the user message as the
query. Up to five relevant excerpts can be added to the model context.

Research mode also includes bounded open-tab context. Saved knowledge and open
tabs remain separate sources and are labeled separately in the prompt.

## Memory Is Not Knowledge

| Memory                            | Knowledge                          |
| --------------------------------- | ---------------------------------- |
| User preferences and instructions | Saved web pages and notes          |
| Small distilled statements        | Larger page records                |
| Can be automatically inferred     | Explicit save action only          |
| Controls assistant behavior       | Supplies factual retrieval context |

Neither store is a raw debug log.

## Data Controls

Use **Settings > Data** to clear the current AI conversation, delete saved
pages, clear cached files, or clear cookies and site storage. Clearing cached
files does not sign you out. Clearing cookies and site storage does.

Browso does not maintain a separate general browsing-history database.
