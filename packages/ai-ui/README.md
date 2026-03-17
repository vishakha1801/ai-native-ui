# ai-native-ui

**React component primitives for AI interfaces.**

[![npm version](https://img.shields.io/npm/v/ai-native-ui)](https://www.npmjs.com/package/ai-native-ui)
[![license](https://img.shields.io/npm/l/ai-native-ui)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)](./packages/ai-ui/tsconfig.json)

---

## What is this?

ai-native-ui is a focused React component library for AI application interfaces. It provides the primitives that general-purpose design systems don't think about:

- **Streaming text** with cursor behavior, stable layout, and accessible live region announcements
- **Thinking indicators** with proper ARIA semantics and three visual variants
- **Tool call cards** that communicate the full lifecycle: pending → running → success/error
- **Citation cards** purpose-built for grounding: favicon, domain, snippet, relevance score
- **Message containers** that compose all of the above into a coherent conversation layout
- **Message actions** with clipboard integration, regenerate, and thumbs feedback

## Why this exists

Most UI component libraries were designed before language model interfaces existed. They handle buttons, forms, and modals well — but when you build an AI app, you immediately find yourself writing the same ad-hoc patterns everywhere:

- A blinking cursor for streaming text
- Some bouncing dots for "thinking"
- A card that shows tool arguments and their results
- Inline reference numbers that link to sources

ai-native-ui treats these as first-class components with carefully designed APIs, accessible markup, reduced-motion support, and visual polish.

## Installation

```bash
npm install ai-native-ui
```

## Quick start

```tsx
import {
  AssistantMessage,
  UserMessage,
  StreamingText,
  ThinkingIndicator,
  ToolCallCard,
  SourceCitationCard,
  CitationList,
  MessageActions,
} from "ai-native-ui";

function ChatMessage({ text, isStreaming, sources }) {
  return (
    <AssistantMessage
      model="claude-3.5"
      isStreaming={isStreaming}
      isLatest={true}
      citations={sources && <CitationList citations={sources} />}
      actions={
        <MessageActions
          copyText={text}
          onFeedback={(v) => logFeedback(v)}
          onRegenerate={handleRegenerate}
        />
      }
    >
      {isStreaming
        ? <StreamingText text={text} status="streaming" />
        : <ThinkingIndicator variant="dots" label="Thinking…" />
      }
    </AssistantMessage>
  );
}
```

## Component overview

| Component | Purpose |
|---|---|
| `<StreamingText>` | Progressive text rendering with cursor and ARIA live region |
| `<ThinkingIndicator>` | Processing state with dots, pulse, or bar variants |
| `<AssistantMessage>` | Full assistant turn: content + tools + citations + actions |
| `<UserMessage>` | User turn with bubble layout |
| `<SourceCitationCard>` | AI grounding reference: favicon, snippet, relevance score |
| `<CitationList>` | Vertical / horizontal / grid citation layout |
| `<InlineCitation>` | Superscript reference number for use in prose |
| `<ToolCallCard>` | Tool invocation with status, args, and expand/collapse |
| `<ToolResultCard>` | Tool output with result, duration, and error state |
| `<MessageActions>` | Copy, regenerate, and thumbs feedback row |
| `<ErrorState>` | Inline, block, or banner error with recovery actions |

### `useStreamingText` hook

For demos and testing, simulate streaming:

```tsx
import { StreamingText, useStreamingText } from "ai-native-ui";

const { displayedText, status, reset } = useStreamingText({
  text: "The answer is...",
  speed: 40, // chars/sec
  onComplete: () => console.log("done"),
});

<StreamingText text={displayedText} status={status} />
```

## Styling

All design tokens are CSS custom properties. Override globally or scope to a container:

```css
/* Global dark/light mode */
:root {
  --ai-accent-amber: #f59e0b;
  --ai-bg-base: #0d0f12;
  --ai-text-primary: #f0f2f5;
}

/* Light mode override */
.light {
  --ai-bg-base: #ffffff;
  --ai-bg-surface: #f8f9fa;
  --ai-text-primary: #0a0a0a;
  --ai-text-secondary: #4a5568;
}
```

Full token list: [`packages/ai-ui/src/styles/tokens.css`](./packages/ai-ui/src/styles/tokens.css)

## Design principles

- **AI-native, not generic** — Every component maps to a specific AI interface pattern.
- **Composable over monolithic** — Small components that combine naturally. AssistantMessage doesn't render citations — you pass them in.
- **Accessible defaults** — ARIA live regions, `role="status"`, focus management, and reduced-motion respect are built in.
- **Zero opinion on your data layer** — Components accept data. They don't fetch it.
- **TypeScript-first** — All props are strictly typed with named types exported.

## Accessibility

| Component | ARIA behavior |
|---|---|
| `StreamingText` | `aria-live="polite"` while streaming; cursor is `aria-hidden` |
| `ThinkingIndicator` | `role="status"` with `aria-label`; all visuals are `aria-hidden` |
| `ErrorState` | `role="alert"` with `aria-live="assertive"` |
| `ToolCallCard` | `role="region"` with `aria-label` per tool |
| `MessageActions` | `role="toolbar"` with `aria-label` per button |

All animated components respect `prefers-reduced-motion: reduce`.

## Tradeoffs

**What this library does not include:**
- Chat input / composer
- Conversation state management
- Streaming data fetching / SSE utilities
- Markdown rendering
- Layout primitives (sidebar, panels)

These are well-served by other libraries and are orthogonal to ai-native-ui's focus.

**Why no CSS-in-JS?**
Components ship inline `<style>` tags for zero-config usage and self-containment. For production, we recommend extracting styles via PostCSS or your bundler to avoid duplication.

## Publishing

```bash
# Build the library
npm run build --workspace=packages/ai-ui

# Verify output
ls packages/ai-ui/dist
# → index.js  index.cjs  index.d.ts  ...

# Publish
cd packages/ai-ui
npm login
npm publish --access public
```

## Repository structure

```
ai-native-ui/
├── packages/
│   ├── ai-ui/          # Library (publishable)
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── StreamingText/
│   │   │   │   ├── ThinkingIndicator/
│   │   │   │   ├── AssistantMessage/
│   │   │   │   ├── SourceCitationCard/
│   │   │   │   ├── ToolCallCard/
│   │   │   │   ├── MessageActions/
│   │   │   │   └── ErrorState/
│   │   │   └── index.ts
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── tsup.config.ts
│   └── docs/           # Documentation site
│       ├── src/
│       │   ├── pages/
│       │   │   ├── HomePage.tsx   # Hero + composed demo
│       │   │   └── DocsPage.tsx   # Component docs
│       │   ├── App.tsx
│       │   └── main.tsx
│       └── index.html
└── package.json        # Workspace root
```

## License

MIT
