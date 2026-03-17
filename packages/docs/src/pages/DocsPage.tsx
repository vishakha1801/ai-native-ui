import React, { useState, useEffect, useRef, useCallback } from "react";

// ── Local component re-exports (same inline pattern as HomePage) ───────────────

function StreamingText({ text, status = "streaming", cursor = true }: { text: string; status?: string; cursor?: boolean }) {
  return (
    <span style={{ display: "inline", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
      {text}
      {cursor && status === "streaming" && (
        <span aria-hidden="true" style={{
          display: "inline-block", width: 2, height: "1em",
          background: "var(--ai-accent-amber)", borderRadius: 1, marginLeft: 1,
          verticalAlign: "text-bottom", animation: "cursorBlink 1s step-end infinite",
        }} />
      )}
    </span>
  );
}

function useStreamingLoop(texts: string[], speed = 36) {
  const [text, setText] = useState("");
  const [textIdx, setTextIdx] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    setText("");
    setDone(false);
    let i = 0;
    const full = texts[textIdx % texts.length];
    const id = setInterval(() => {
      i += 2;
      if (i >= full.length) {
        setText(full);
        setDone(true);
        clearInterval(id);
        setTimeout(() => {
          setTextIdx(n => n + 1);
        }, 2800);
      } else {
        setText(full.slice(0, i));
      }
    }, 1000 / speed);
    return () => clearInterval(id);
  }, [textIdx]);

  return { text, done };
}

function ThinkingDots({ label }: { label?: string }) {
  return (
    <span role="status" aria-label={label ?? "Thinking"} style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "var(--ai-text-secondary)" }}>
      {[0, 1, 2].map(i => (
        <span key={i} aria-hidden="true" style={{
          display: "block", width: 5, height: 5, borderRadius: "50%",
          background: "var(--ai-accent-amber)", opacity: 0.4,
          animation: `thinkDot 1.2s ease-in-out ${i * 160}ms infinite`,
        }} />
      ))}
      {label && <span style={{ fontSize: "var(--ai-text-sm)", fontWeight: 450 }}>{label}</span>}
    </span>
  );
}

function ThinkingPulse() {
  return (
    <span role="status" aria-label="Thinking" style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
      <span aria-hidden="true" style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center", width: 16, height: 16 }}>
        <span style={{ position: "absolute", width: 16, height: 16, borderRadius: "50%", background: "var(--ai-accent-amber)", opacity: 0.15, animation: "pulseRing 1.5s ease-out infinite" }} />
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--ai-accent-amber)", animation: "pulseCore 1.5s ease-in-out infinite" }} />
      </span>
    </span>
  );
}

function ThinkingBar({ label }: { label?: string }) {
  return (
    <span role="status" aria-label={label ?? "Processing"} style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "var(--ai-text-secondary)" }}>
      <span aria-hidden="true" style={{ display: "inline-flex", alignItems: "center", gap: 2.5, height: 16 }}>
        {[0, 1, 2, 3, 4].map(i => (
          <span key={i} style={{
            display: "block", width: 3, borderRadius: 2,
            background: "var(--ai-accent-amber)",
            animation: `barWave 1s ease-in-out ${i * 80}ms infinite`,
          }} />
        ))}
      </span>
      {label && <span style={{ fontSize: "var(--ai-text-sm)", fontWeight: 450 }}>{label}</span>}
    </span>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

type Section = "overview" | "streaming" | "thinking" | "messages" | "citations" | "tools" | "actions" | "error" | "api";

const NAV_ITEMS: { id: Section; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "streaming", label: "StreamingText" },
  { id: "thinking", label: "ThinkingIndicator" },
  { id: "messages", label: "Messages" },
  { id: "citations", label: "Citations" },
  { id: "tools", label: "Tool Calls" },
  { id: "actions", label: "MessageActions" },
  { id: "error", label: "ErrorState" },
  { id: "api", label: "API Reference" },
];

export function DocsPage() {
  const [activeSection, setActiveSection] = useState<Section>("overview");

  return (
    <div style={{ display: "flex", maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}>
      <style>{KEYFRAMES}</style>

      {/* Sidebar */}
      <aside style={{
        width: 200, flexShrink: 0, paddingTop: 40, paddingRight: 32,
        position: "sticky", top: 56, height: "calc(100vh - 56px)", overflowY: "auto",
      }}>
        <p style={{ margin: "0 0 12px", fontFamily: "var(--ai-font-mono)", fontSize: "var(--ai-text-xs)", fontWeight: 600, color: "var(--ai-text-tertiary)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
          Components
        </p>
        <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              style={{
                background: activeSection === item.id ? "var(--ai-bg-elevated)" : "none",
                border: "none", cursor: "pointer",
                padding: "7px 10px", borderRadius: "var(--ai-radius-sm)",
                fontFamily: "var(--ai-font-sans)", fontSize: "var(--ai-text-sm)",
                fontWeight: activeSection === item.id ? 600 : 400,
                color: activeSection === item.id ? "var(--ai-text-primary)" : "var(--ai-text-secondary)",
                textAlign: "left", transition: "all 120ms",
                borderLeft: activeSection === item.id ? "2px solid var(--ai-accent-amber)" : "2px solid transparent",
              }}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, minWidth: 0, paddingTop: 40, paddingBottom: 80 }}>
        {activeSection === "overview" && <OverviewSection />}
        {activeSection === "streaming" && <StreamingSection />}
        {activeSection === "thinking" && <ThinkingSection />}
        {activeSection === "messages" && <MessagesSection />}
        {activeSection === "citations" && <CitationsSection />}
        {activeSection === "tools" && <ToolsSection />}
        {activeSection === "actions" && <ActionsSection />}
        {activeSection === "error" && <ErrorSection />}
        {activeSection === "api" && <ApiSection />}
      </main>
    </div>
  );
}

// ── Section components ────────────────────────────────────────────────────────

function OverviewSection() {
  return (
    <div>
      <PageTitle>Overview</PageTitle>
      <Lead>
        ai-native-ui is a focused component library for AI application interfaces.
        It provides the primitives that general-purpose design systems don't think about:
        streaming text, reasoning states, tool execution, citations, and feedback.
      </Lead>

      <H2>Why this exists</H2>
      <Prose>
        Most UI component libraries were designed before language model interfaces existed.
        They handle buttons, forms, and modals well — but when you build an AI app,
        you immediately find yourself writing the same ad-hoc patterns everywhere:
        a blinking cursor for streaming text, some bouncing dots for "thinking",
        a card that shows tool arguments and their results, inline reference numbers
        that link to citations.
      </Prose>
      <Prose>
        ai-native-ui treats these as first-class components with carefully designed APIs,
        accessible markup, reduced-motion support, and visual polish.
      </Prose>

      <H2>Design principles</H2>
      <ul style={{ margin: "0 0 24px", padding: "0 0 0 20px", display: "flex", flexDirection: "column", gap: 8 }}>
        {[
          ["AI-native, not generic", "Every component maps to a specific AI interface pattern. Nothing here is a re-export from another kit."],
          ["Composable over monolithic", "Components are small and combine naturally. AssistantMessage doesn't render citations — you pass them in."],
          ["Accessible defaults", "ARIA live regions, role=status, focus management, and reduced-motion respect are built in, not bolted on."],
          ["CSS custom properties", "All tokens are CSS variables. Override them globally or scope them to specific components."],
          ["Zero opinion on your data layer", "Components accept data — they don't fetch it. Work with any streaming approach."],
        ].map(([title, desc]) => (
          <li key={title} style={{ fontFamily: "var(--ai-font-sans)", fontSize: "var(--ai-text-base)", lineHeight: "var(--ai-leading-normal)", color: "var(--ai-text-secondary)" }}>
            <strong style={{ color: "var(--ai-text-primary)" }}>{title}</strong> — {desc}
          </li>
        ))}
      </ul>

      <H2>Quick start</H2>
      <CodeBlock code={QUICKSTART_CODE} />

      <H2>Non-goals</H2>
      <Prose>
        This library intentionally does not include: a chat input component,
        conversation state management, streaming data fetching, markdown rendering,
        or layout components like sidebars and panels. Those are well-served by
        existing libraries and are orthogonal to what ai-native-ui solves.
      </Prose>
    </div>
  );
}

function StreamingSection() {
  const texts = [
    "The attention mechanism computes a weighted sum over all input positions, allowing each token to directly attend to every other token in the sequence.",
    "Linear attention approximates the softmax kernel to achieve O(n) complexity, trading some expressiveness for dramatically better scaling at long contexts.",
    "Flash Attention reduces memory usage by computing attention in tiles that fit in SRAM, avoiding expensive reads and writes to HBM.",
  ];
  const { text, done } = useStreamingLoop(texts);

  return (
    <div>
      <PageTitle>StreamingText</PageTitle>
      <Lead>
        Renders progressively-received text with a blinking cursor, stable layout,
        accessible live region announcements, and reduced-motion support.
      </Lead>

      <DemoBox label="Live preview">
        <div style={{ fontFamily: "var(--ai-font-sans)", fontSize: "var(--ai-text-base)", lineHeight: "var(--ai-leading-relaxed)", color: "var(--ai-text-primary)", maxWidth: 520, minHeight: "5rem" }}>
          <StreamingText text={text} status={done ? "complete" : "streaming"} />
        </div>
      </DemoBox>

      <H2>Usage</H2>
      <CodeBlock code={`import { StreamingText } from "ai-native-ui";

// Pass the current text chunk from your streaming response
<StreamingText
  text={streamedText}
  status="streaming"  // "streaming" | "complete" | "error"
  cursor={true}       // show blinking cursor while streaming
/>`} />

      <H2>With useStreamingText</H2>
      <Prose>
        For demos and testing, use the <InlineCode>useStreamingText</InlineCode> hook
        to simulate streaming by revealing text character by character.
      </Prose>
      <CodeBlock code={`import { StreamingText, useStreamingText } from "ai-native-ui";

function Demo() {
  const { displayedText, status, reset } = useStreamingText({
    text: "The answer to your question is...",
    speed: 40, // characters per second
    onComplete: () => console.log("done"),
  });

  return <StreamingText text={displayedText} status={status} />;
}`} />

      <H2>Props</H2>
      <PropsTable rows={[
        ["text", "string", "—", "Current text content. Grows as streaming progresses."],
        ["status", '"streaming" | "complete" | "error"', '"streaming"', "Controls cursor display and ARIA live region behavior."],
        ["cursor", "boolean", "true", "Show blinking cursor while status is streaming."],
        ["animate", "boolean", "true", "Enable character fade-in animation. Auto-disabled on prefers-reduced-motion."],
        ["aria-label", "string", "—", "Accessible label for the live region."],
      ]} />

      <H2>Accessibility</H2>
      <Prose>
        While streaming, the element has <InlineCode>aria-live="polite"</InlineCode> to
        allow screen readers to announce updates without interrupting current speech.
        The cursor has <InlineCode>aria-hidden="true"</InlineCode>.
        Animations are disabled when <InlineCode>prefers-reduced-motion: reduce</InlineCode> is set.
      </Prose>
    </div>
  );
}

function ThinkingSection() {
  return (
    <div>
      <PageTitle>ThinkingIndicator</PageTitle>
      <Lead>
        Communicates that the AI is processing. Three visual variants, proper ARIA semantics,
        and optional text labels that cycle through states.
      </Lead>

      <DemoBox label="Variants">
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {([
            { id: "dots", el: <ThinkingDots label="Thinking…" /> },
            { id: "pulse", el: <ThinkingPulse /> },
            { id: "bar",   el: <ThinkingBar label="Processing…" /> },
          ]).map(({ id, el }) => (
            <div key={id} style={{ display: "flex", alignItems: "center", gap: 24 }}>
              <span style={{ fontFamily: "var(--ai-font-mono)", fontSize: "var(--ai-text-xs)", color: "var(--ai-text-tertiary)", width: 50 }}>{id}</span>
              {el}
            </div>
          ))}
        </div>
      </DemoBox>

      <H2>Usage</H2>
      <CodeBlock code={`import { ThinkingIndicator } from "ai-native-ui";

<ThinkingIndicator variant="dots" label="Thinking…" />
<ThinkingIndicator variant="pulse" />
<ThinkingIndicator variant="bar" label="Analyzing…" size={5} />`} />

      <H2>Props</H2>
      <PropsTable rows={[
        ["variant", '"dots" | "pulse" | "bar"', '"dots"', "Visual animation style."],
        ["label", "string", '"Thinking…"', 'Text shown next to the indicator. The bar variant cycles through labels automatically.'],
        ["aria-label", "string", "—", "Override the accessible label. Defaults to the label prop."],
        ["size", "number", "5", "Base size in px for the indicator elements."],
      ]} />

      <H2>Accessibility</H2>
      <Prose>
        The root element has <InlineCode>role="status"</InlineCode> and an{" "}
        <InlineCode>aria-label</InlineCode> describing what the AI is doing.
        All visual elements are <InlineCode>aria-hidden</InlineCode>.
        Animations respect <InlineCode>prefers-reduced-motion</InlineCode>.
      </Prose>
    </div>
  );
}

function MessagesSection() {
  return (
    <div>
      <PageTitle>Messages</PageTitle>
      <Lead>
        AssistantMessage and UserMessage provide the conversation layout layer.
        They compose streaming content, tool calls, citations, and actions — 
        each as optional children.
      </Lead>

      <DemoBox label="Conversation pair">
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 520 }}>
          {/* User message */}
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
            <div style={{
              maxWidth: "75%", padding: "10px 14px",
              background: "var(--ai-bg-elevated)",
              border: "1px solid var(--ai-border-default)",
              borderRadius: "var(--ai-radius-lg)", borderBottomRightRadius: 6,
            }}>
              <p style={{ margin: 0, fontFamily: "var(--ai-font-sans)", fontSize: "var(--ai-text-sm)", lineHeight: "var(--ai-leading-normal)" }}>
                What's the difference between RAG and fine-tuning?
              </p>
            </div>
          </div>
          {/* Assistant message */}
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 6, flexShrink: 0,
              background: "var(--ai-accent-amber-dim)", border: "1px solid rgba(167,139,250,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "var(--ai-font-sans)", fontSize: 10, fontWeight: 700, color: "var(--ai-accent-amber)",
            }}>AI</div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: "2px 0 8px", fontFamily: "var(--ai-font-sans)", fontSize: "var(--ai-text-sm)", fontWeight: 600, color: "var(--ai-text-secondary)" }}>
                Assistant
              </p>
              <p style={{ margin: 0, fontFamily: "var(--ai-font-sans)", fontSize: "var(--ai-text-sm)", lineHeight: "var(--ai-leading-relaxed)", color: "var(--ai-text-primary)" }}>
                RAG retrieves relevant documents at inference time and includes them in the context window. Fine-tuning bakes knowledge into model weights during training. RAG is better for dynamic, updateable knowledge. Fine-tuning is better for changing the model's behavior or style.
              </p>
            </div>
          </div>
        </div>
      </DemoBox>

      <H2>Usage</H2>
      <CodeBlock code={`import {
  AssistantMessage,
  UserMessage,
  StreamingText,
  ThinkingIndicator,
  MessageActions,
} from "ai-native-ui";

// User turn
<UserMessage>
  What is the difference between RAG and fine-tuning?
</UserMessage>

// Assistant turn — compose as needed
<AssistantMessage
  model="claude-3.5"
  isStreaming={isStreaming}
  isLatest={true}
  toolCalls={<ToolCallCard toolName="search" status="success" />}
  citations={<CitationList citations={sources} />}
  actions={
    <MessageActions
      copyText={responseText}
      onRegenerate={handleRegenerate}
      onFeedback={handleFeedback}
    />
  }
>
  {isStreaming ? (
    <StreamingText text={streamedText} status="streaming" />
  ) : (
    <ThinkingIndicator label="Thinking…" />
  )}
</AssistantMessage>`} />

      <H2>AssistantMessage Props</H2>
      <PropsTable rows={[
        ["children", "ReactNode", "—", "Message content — typically StreamingText or ThinkingIndicator."],
        ["model", "string", "—", "Model name shown in the header row."],
        ["isStreaming", "boolean", "false", "Shows streaming badge and enables aria-live on the container."],
        ["isLatest", "boolean", "false", "Makes actions permanently visible (vs hover-only)."],
        ["actions", "ReactNode", "—", "Action row — typically MessageActions."],
        ["citations", "ReactNode", "—", "Citation block shown below message content."],
        ["toolCalls", "ReactNode", "—", "Tool call cards shown within the message body."],
        ["avatar", "ReactNode | string", "—", "Avatar — React element, img URL, or undefined for default initials."],
      ]} />
    </div>
  );
}

function CitationsSection() {
  const citations = [
    { title: "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks", url: "https://arxiv.org/abs/2005.11401", domain: "arxiv.org", snippet: "Introduces RAG combining a dense retriever with a seq2seq generator for open-domain QA.", relevance: 0.93, index: 1 },
    { title: "REALM: Retrieval-Augmented Language Model Pre-Training", url: "https://arxiv.org/abs/2002.08909", domain: "arxiv.org", snippet: "Pre-trains the retriever and language model jointly using a latent document variable.", relevance: 0.78, index: 2 },
  ];

  return (
    <div>
      <PageTitle>Citations</PageTitle>
      <Lead>
        Three components for source grounding: SourceCitationCard for individual sources,
        CitationList for collections, and InlineCitation for superscript references in prose.
      </Lead>

      <DemoBox label="SourceCitationCard">
        <div style={{ maxWidth: 380 }}>
          {citations.map(c => (
            <div key={c.index} style={{ marginBottom: 8 }}>
              <CitationCardDemo {...c} />
            </div>
          ))}
        </div>
      </DemoBox>

      <DemoBox label="InlineCitation">
        <p style={{ margin: 0, fontFamily: "var(--ai-font-sans)", fontSize: "var(--ai-text-base)", lineHeight: "var(--ai-leading-relaxed)", color: "var(--ai-text-primary)" }}>
          Retrieval-augmented generation combines dense retrieval with generative models
          <InlineCitationDemo index={1} title="RAG paper" />
          , producing outputs grounded in retrieved documents
          <InlineCitationDemo index={2} title="REALM paper" />
          rather than model weights alone.
        </p>
      </DemoBox>

      <H2>Usage</H2>
      <CodeBlock code={`import {
  SourceCitationCard,
  CitationList,
  InlineCitation,
} from "ai-native-ui";

// Single card
<SourceCitationCard
  title="Efficient Transformers: A Survey"
  url="https://arxiv.org/abs/2009.06732"
  snippet="Comprehensive review of efficient transformer variants..."
  relevance={0.94}
  index={1}
/>

// List (vertical / horizontal / grid)
<CitationList
  citations={sources}
  layout="vertical"
  heading="Sources"
/>

// Inline reference in prose
<p>
  Attention is O(n²) in sequence length
  <InlineCitation index={1} title="Attention is All You Need" url="..." />
  , though sparse variants reduce this.
</p>`} />

      <H2>SourceCitationCard Props</H2>
      <PropsTable rows={[
        ["title", "string", "—", "Source title. Required."],
        ["url", "string", "—", "Link URL. If provided, renders as <a>."],
        ["snippet", "string", "—", "Brief excerpt shown in expanded view. Hidden in compact mode."],
        ["domain", "string", "—", "Domain label. Inferred from url if not provided."],
        ["relevance", "number", "—", "0–1 relevance score shown as a colored badge."],
        ["index", "number", "—", "Reference number shown in the top-right corner."],
        ["compact", "boolean", "false", "Compact card variant — hides snippet."],
      ]} />
    </div>
  );
}

function CitationCardDemo({ title, url, snippet, domain, relevance, index }: {
  title: string; url?: string; snippet?: string;
  domain?: string; relevance?: number; index?: number;
}) {
  const resolvedDomain = domain ?? (url ? (() => { try { return new URL(url!).hostname.replace(/^www\./, ""); } catch { return url; } })() : undefined);
  return (
    <a href={url ?? "#"} target="_blank" rel="noopener noreferrer" style={{
      display: "flex", flexDirection: "column", gap: 6, padding: "12px 14px",
      textDecoration: "none", color: "inherit",
      background: "var(--ai-bg-elevated)", border: "1px solid var(--ai-border-default)",
      borderRadius: "var(--ai-radius-md)", transition: "border-color 120ms",
      position: "relative",
    }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--ai-border-strong)")}
      onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--ai-border-default)")}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {resolvedDomain && <img src={`https://www.google.com/s2/favicons?domain=${resolvedDomain}&sz=16`} alt="" width={14} height={14} style={{ borderRadius: 2, opacity: 0.85 }} />}
          <span style={{ fontFamily: "var(--ai-font-sans)", fontSize: "var(--ai-text-xs)", color: "var(--ai-text-tertiary)" }}>{resolvedDomain}</span>
          {relevance !== undefined && (
            <span style={{ fontFamily: "var(--ai-font-mono)", fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: "var(--ai-radius-full)", color: "var(--ai-accent-green)", background: "var(--ai-accent-green-dim)" }}>
              {Math.round(relevance * 100)}%
            </span>
          )}
        </div>
        {index !== undefined && (
          <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", minWidth: 18, height: 18, padding: "0 4px", background: "var(--ai-accent-amber-dim)", color: "var(--ai-accent-amber)", borderRadius: 4, fontFamily: "var(--ai-font-mono)", fontSize: "var(--ai-text-xs)", fontWeight: 700 }}>{index}</span>
        )}
      </div>
      <p style={{ margin: 0, fontFamily: "var(--ai-font-sans)", fontSize: "var(--ai-text-sm)", fontWeight: 500, color: "var(--ai-text-primary)", lineHeight: 1.35 }}>{title}</p>
      {snippet && <p style={{ margin: 0, fontFamily: "var(--ai-font-sans)", fontSize: "var(--ai-text-sm)", color: "var(--ai-text-secondary)", lineHeight: "var(--ai-leading-normal)", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{snippet}</p>}
      <span style={{ position: "absolute", top: 10, right: 10, fontSize: 12, color: "var(--ai-text-tertiary)" }}>↗</span>
    </a>
  );
}

function InlineCitationDemo({ index, title }: { index: number; title: string }) {
  return (
    <sup>
      <a href="#" title={title} aria-label={`Source ${index}: ${title}`} style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        minWidth: 16, height: 16, padding: "0 3px", margin: "0 1px",
        fontFamily: "var(--ai-font-mono)", fontSize: 10, fontWeight: 700, lineHeight: 1,
        color: "var(--ai-accent-amber)", background: "var(--ai-accent-amber-dim)",
        borderRadius: 3, textDecoration: "none", transition: "all 120ms",
      }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--ai-accent-amber)"; (e.currentTarget as HTMLElement).style.color = "var(--ai-text-inverse)"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "var(--ai-accent-amber-dim)"; (e.currentTarget as HTMLElement).style.color = "var(--ai-accent-amber)"; }}
      >{index}</a>
    </sup>
  );
}

function ToolsSection() {
  const [toolStatus, setToolStatus] = useState<"pending" | "running" | "success" | "error">("pending");

  return (
    <div>
      <PageTitle>Tool Calls</PageTitle>
      <Lead>
        ToolCallCard and ToolResultCard display the lifecycle of a tool invocation —
        from pending through execution to completion or failure.
      </Lead>

      <DemoBox label="Interactive demo">
        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
          {(["pending", "running", "success", "error"] as const).map(s => (
            <button
              key={s}
              onClick={() => setToolStatus(s)}
              style={{
                fontFamily: "var(--ai-font-sans)", fontSize: "var(--ai-text-xs)", fontWeight: 600,
                padding: "4px 12px", borderRadius: "var(--ai-radius-full)", border: "1px solid",
                cursor: "pointer", transition: "all 120ms",
                letterSpacing: "0.04em", textTransform: "uppercase",
                color: toolStatus === s ? "var(--ai-accent-amber)" : "var(--ai-text-tertiary)",
                borderColor: toolStatus === s ? "var(--ai-accent-amber)" : "var(--ai-border-default)",
                background: toolStatus === s ? "var(--ai-accent-amber-dim)" : "transparent",
              }}
            >
              {s}
            </button>
          ))}
        </div>
        <ToolCardDemo
          toolName="web_search"
          args={{ query: "transformer attention scaling", max_results: 5 }}
          status={toolStatus}
        />
        {toolStatus === "success" && (
          <div style={{ marginTop: 8 }}>
            <ToolResultDemo
              toolName="web_search"
              result={{ results: 5, top: "Attention is All You Need", relevance: 0.97 }}
              durationMs={842}
            />
          </div>
        )}
        {toolStatus === "error" && (
          <div style={{ marginTop: 8 }}>
            <ToolResultDemo
              toolName="web_search"
              status="error"
              error="Rate limit exceeded. Retry after 60s."
            />
          </div>
        )}
      </DemoBox>

      <H2>Usage</H2>
      <CodeBlock code={`import { ToolCallCard, ToolResultCard } from "ai-native-ui";

// Show the invocation
<ToolCallCard
  toolName="web_search"
  args={{ query: "transformer attention scaling", max_results: 5 }}
  status="running"    // "pending" | "running" | "success" | "error"
  description="Searching research papers"
  defaultExpanded={false}
/>

// Show the result
<ToolResultCard
  toolName="web_search"
  status="success"
  result={{ results: 5, top: "Attention is All You Need" }}
  durationMs={842}
/>

// Error state
<ToolResultCard
  toolName="web_search"
  status="error"
  error="Rate limit exceeded. Retry after 60s."
/>`} />

      <H2>ToolCallCard Props</H2>
      <PropsTable rows={[
        ["toolName", "string", "—", "Name of the tool function being invoked."],
        ["args", "Record<string, unknown>", "—", "Input arguments. Rendered as formatted JSON in the expandable detail."],
        ["status", '"pending" | "running" | "success" | "error"', '"pending"', "Controls icon, badge color, and border treatment."],
        ["description", "string", "—", "Optional human-readable description shown in the header."],
        ["defaultExpanded", "boolean", "false", "Whether the argument detail region is open by default."],
      ]} />
    </div>
  );
}

function ToolCardDemo({ toolName, args, status }: { toolName: string; args?: Record<string, unknown>; status: "pending" | "running" | "success" | "error" }) {
  const [expanded, setExpanded] = useState(false);
  const colors = {
    pending: { color: "var(--ai-text-tertiary)", bg: "var(--ai-border-subtle)" },
    running: { color: "var(--ai-accent-amber)", bg: "var(--ai-accent-amber-dim)" },
    success: { color: "var(--ai-accent-green)", bg: "var(--ai-accent-green-dim)" },
    error: { color: "var(--ai-accent-red)", bg: "var(--ai-accent-red-dim)" },
  }[status];

  return (
    <div style={{ background: "var(--ai-bg-surface)", border: `1px solid ${status === "running" ? "rgba(167,139,250,0.3)" : "var(--ai-border-default)"}`, borderRadius: "var(--ai-radius-md)", overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 22, height: 22, borderRadius: 6, background: colors.bg, color: colors.color, fontSize: 12 }}>
            {status === "running" ? <span style={{ display: "block", width: 10, height: 10, border: "1.5px solid rgba(167,139,250,0.3)", borderTopColor: "var(--ai-accent-amber)", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} /> : "⚙"}
          </span>
          <span style={{ fontFamily: "var(--ai-font-mono)", fontSize: "var(--ai-text-sm)", fontWeight: 600 }}>{toolName}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: "var(--ai-text-xs)", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", padding: "2px 8px", borderRadius: "var(--ai-radius-full)", background: colors.bg, color: colors.color }}>
            {{ pending: "Pending", running: "Running", success: "Done", error: "Error" }[status]}
          </span>
          {args && (
            <button onClick={() => setExpanded(e => !e)} style={{ background: "none", border: "none", cursor: "pointer", width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 6, color: "var(--ai-text-tertiary)" }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ transform: expanded ? "rotate(180deg)" : "none", transition: "transform 150ms" }}>
                <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
        </div>
      </div>
      {expanded && args && (
        <div style={{ borderTop: "1px solid var(--ai-border-subtle)", padding: "10px 14px" }}>
          <pre style={{ margin: 0, padding: "10px 12px", background: "var(--ai-bg-base)", borderRadius: 6, fontFamily: "var(--ai-font-mono)", fontSize: "var(--ai-text-sm)", color: "var(--ai-text-secondary)", overflow: "auto", lineHeight: "var(--ai-leading-normal)" }}>
            <code>{JSON.stringify(args, null, 2)}</code>
          </pre>
        </div>
      )}
    </div>
  );
}

function ToolResultDemo({ toolName, result, durationMs, status = "success", error }: { toolName: string; result?: unknown; durationMs?: number; status?: string; error?: string }) {
  const [expanded, setExpanded] = useState(true);
  const isError = status === "error";
  return (
    <div style={{ background: "var(--ai-bg-surface)", border: `1px solid ${isError ? "rgba(248,113,113,0.25)" : "rgba(74,222,128,0.2)"}`, borderRadius: "var(--ai-radius-md)", overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 22, height: 22, borderRadius: 6, fontSize: 12, background: isError ? "var(--ai-accent-red-dim)" : "var(--ai-accent-green-dim)", color: isError ? "var(--ai-accent-red)" : "var(--ai-accent-green)" }}>{isError ? "✕" : "✓"}</span>
          <span style={{ fontFamily: "var(--ai-font-mono)", fontSize: "var(--ai-text-sm)", fontWeight: 600 }}>{toolName}</span>
          {durationMs && <span style={{ fontFamily: "var(--ai-font-mono)", fontSize: "var(--ai-text-xs)", color: "var(--ai-text-tertiary)", padding: "2px 6px", background: "var(--ai-border-subtle)", borderRadius: "var(--ai-radius-full)" }}>{durationMs}ms</span>}
        </div>
        <button onClick={() => setExpanded(e => !e)} style={{ background: "none", border: "none", cursor: "pointer", width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 6, color: "var(--ai-text-tertiary)" }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ transform: expanded ? "rotate(180deg)" : "none", transition: "transform 150ms" }}>
            <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
      {expanded && (
        <div style={{ borderTop: "1px solid var(--ai-border-subtle)", padding: "10px 14px" }}>
          {error && (
            <div style={{ padding: "8px 12px", background: "var(--ai-accent-red-dim)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: 6, marginBottom: result !== undefined ? 8 : 0 }}>
              <p style={{ margin: "0 0 2px", fontFamily: "var(--ai-font-sans)", fontSize: "var(--ai-text-xs)", fontWeight: 700, color: "var(--ai-accent-red)", letterSpacing: "0.06em", textTransform: "uppercase" }}>Error</p>
              <p style={{ margin: 0, fontFamily: "var(--ai-font-mono)", fontSize: "var(--ai-text-sm)", color: "var(--ai-accent-red)", opacity: 0.85 }}>{error}</p>
            </div>
          )}
          {result !== undefined && (
            <pre style={{ margin: 0, padding: "10px 12px", background: "var(--ai-bg-base)", borderRadius: 6, fontFamily: "var(--ai-font-mono)", fontSize: "var(--ai-text-sm)", color: "var(--ai-text-secondary)", overflow: "auto", lineHeight: "var(--ai-leading-normal)" }}>
              <code>{typeof result === "string" ? result : JSON.stringify(result, null, 2)}</code>
            </pre>
          )}
        </div>
      )}
    </div>
  );
}

function ActionsSection() {
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null);
  const [copied, setCopied] = useState(false);

  return (
    <div>
      <PageTitle>MessageActions</PageTitle>
      <Lead>
        The standard action row for AI responses: copy with clipboard confirmation,
        regenerate, and thumbs up/down feedback. Each action is optional.
      </Lead>

      <DemoBox label="Interactive demo">
        <div style={{ padding: "12px 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
            <ActionBtnDemo label={copied ? "Copied" : "Copy"} active={copied} onClick={() => { setCopied(true); setTimeout(() => setCopied(false), 1800); }}>
              {copied ? <CheckSvg /> : <CopySvg />}
            </ActionBtnDemo>
            <ActionBtnDemo label="Regenerate" onClick={() => {}}>
              <RegenSvg />
            </ActionBtnDemo>
            <div style={{ width: 1, height: 16, background: "var(--ai-border-default)", margin: "0 4px" }} />
            <ActionBtnDemo label="Good response" active={feedback === "up"} onClick={() => setFeedback(f => f === "up" ? null : "up")}>
              <ThumbUp />
            </ActionBtnDemo>
            <ActionBtnDemo label="Poor response" active={feedback === "down"} onClick={() => setFeedback(f => f === "down" ? null : "down")}>
              <ThumbDown />
            </ActionBtnDemo>
          </div>
          {feedback && (
            <p style={{ margin: "12px 0 0", fontFamily: "var(--ai-font-sans)", fontSize: "var(--ai-text-sm)", color: "var(--ai-text-secondary)" }}>
              Feedback: {feedback === "up" ? "👍 positive" : "👎 negative"}
            </p>
          )}
        </div>
      </DemoBox>

      <H2>Usage</H2>
      <CodeBlock code={`import { MessageActions } from "ai-native-ui";

<MessageActions
  copyText={responseText}
  onCopy={() => console.log("copied")}
  onRegenerate={handleRegenerate}
  onFeedback={(value) => {
    // value: "positive" | "negative" | null
    submitFeedback(messageId, value);
  }}
  showRegenerate={true}
  showFeedback={true}
  showCopy={true}
/>`} />

      <H2>Props</H2>
      <PropsTable rows={[
        ["copyText", "string", "—", "Text written to clipboard. If omitted, onCopy must handle it."],
        ["onCopy", "() => void | Promise<void>", "—", "Called after copy. Awaited if async."],
        ["onRegenerate", "() => void", "—", "Called when regenerate is clicked. Button hidden if not provided."],
        ["onFeedback", "(value: FeedbackValue) => void", "—", "Called with 'positive', 'negative', or null (deselected). Hidden if not provided."],
        ["feedback", "FeedbackValue", "—", "Controlled feedback state. If omitted, state is managed internally."],
        ["showCopy", "boolean", "true", "Show the copy button."],
        ["showRegenerate", "boolean", "true", "Show the regenerate button."],
        ["showFeedback", "boolean", "true", "Show the thumbs buttons."],
      ]} />
    </div>
  );
}

function ErrorSection() {
  return (
    <div>
      <PageTitle>ErrorState</PageTitle>
      <Lead>
        Communicates a failed AI operation. Three variants for different contexts:
        block (card), inline (compact), and banner (full-width).
      </Lead>

      <DemoBox label="Variants">
        <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 480 }}>
          {(["block", "inline", "banner"] as const).map(variant => (
            <ErrorStateDemo
              key={variant}
              variant={variant}
              title="Response generation failed"
              message="The model returned an error. Try regenerating or simplifying your request."
              actionLabel="Try again"
              secondaryLabel="Dismiss"
            />
          ))}
        </div>
      </DemoBox>

      <H2>Usage</H2>
      <CodeBlock code={`import { ErrorState } from "ai-native-ui";

<ErrorState
  variant="block"
  title="Response generation failed"
  message="The model returned an error."
  actionLabel="Try again"
  onAction={handleRegenerate}
  secondaryLabel="Dismiss"
  onSecondaryAction={handleDismiss}
/>

// From an Error object
<ErrorState
  error={caughtError}
  actionLabel="Retry"
  onAction={retry}
/>`} />

      <H2>Props</H2>
      <PropsTable rows={[
        ["title", "string", '"Something went wrong"', "Error heading."],
        ["message", "string", "—", "Detail text. If absent, extracted from the error prop."],
        ["error", "Error | unknown", "—", "Raw error. message property extracted automatically."],
        ["variant", '"inline" | "block" | "banner"', '"block"', "Visual treatment."],
        ["actionLabel", "string", "—", "Primary action button label."],
        ["onAction", "() => void", "—", "Primary action callback (retry, etc)."],
        ["secondaryLabel", "string", "—", "Secondary action label."],
        ["onSecondaryAction", "() => void", "—", "Secondary action callback (dismiss, etc)."],
      ]} />
    </div>
  );
}

function ErrorStateDemo({ variant, title, message, actionLabel, secondaryLabel }: {
  variant: "block" | "inline" | "banner"; title: string; message: string;
  actionLabel?: string; secondaryLabel?: string;
}) {
  const paddings = { block: "14px 16px", inline: "8px 12px", banner: "12px 16px" };
  const radii = { block: "var(--ai-radius-md)", inline: "var(--ai-radius-sm)", banner: "0" };
  return (
    <div role="alert" style={{
      display: "flex", gap: 12, alignItems: "flex-start",
      padding: paddings[variant], background: "rgba(248,113,113,0.08)",
      border: variant !== "banner" ? "1px solid rgba(248,113,113,0.2)" : undefined,
      borderTop: variant === "banner" ? "1px solid rgba(248,113,113,0.2)" : undefined,
      borderBottom: variant === "banner" ? "1px solid rgba(248,113,113,0.2)" : undefined,
      borderRadius: radii[variant],
    }}>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
        <circle cx="8" cy="8" r="6.5" stroke="var(--ai-accent-red)" strokeWidth="1.25" />
        <path d="M8 4.5V8.5" stroke="var(--ai-accent-red)" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="8" cy="11" r="0.75" fill="var(--ai-accent-red)" />
      </svg>
      <div style={{ flex: 1 }}>
        <p style={{ margin: "0 0 2px", fontFamily: "var(--ai-font-sans)", fontSize: "var(--ai-text-sm)", fontWeight: 600, color: "var(--ai-accent-red)" }}>{title}</p>
        <p style={{ margin: 0, fontFamily: "var(--ai-font-sans)", fontSize: "var(--ai-text-sm)", color: "rgba(248,113,113,0.75)", lineHeight: "var(--ai-leading-normal)" }}>{message}</p>
        {(actionLabel || secondaryLabel) && (
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            {actionLabel && (
              <button style={{ fontFamily: "var(--ai-font-sans)", fontSize: "var(--ai-text-sm)", fontWeight: 500, padding: "5px 12px", background: "rgba(248,113,113,0.2)", color: "var(--ai-accent-red)", border: "none", borderRadius: "var(--ai-radius-sm)", cursor: "pointer" }}>{actionLabel}</button>
            )}
            {secondaryLabel && (
              <button style={{ fontFamily: "var(--ai-font-sans)", fontSize: "var(--ai-text-sm)", fontWeight: 500, padding: "5px 12px", background: "transparent", color: "rgba(248,113,113,0.6)", border: "none", borderRadius: "var(--ai-radius-sm)", cursor: "pointer" }}>{secondaryLabel}</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ApiSection() {
  return (
    <div>
      <PageTitle>API Reference</PageTitle>
      <Lead>Complete type reference for all exported components and utilities.</Lead>

      <H2>Type exports</H2>
      <CodeBlock code={`// Streaming
type StreamingTextStatus = "streaming" | "complete" | "error";

// ThinkingIndicator
type ThinkingVariant = "dots" | "pulse" | "bar";

// ToolCallCard
type ToolStatus = "pending" | "running" | "success" | "error";

// MessageActions
type FeedbackValue = "positive" | "negative" | null;

// ErrorState
type ErrorStateVariant = "inline" | "block" | "banner";`} />

      <H2>CSS custom properties</H2>
      <Prose>All tokens are CSS custom properties. Override at :root or scope to a container:</Prose>
      <CodeBlock code={`/* Global override */
:root {
  --ai-accent-amber: #e07b00;  /* Change accent color */
  --ai-bg-base: #ffffff;        /* Light mode base */
  --ai-text-primary: #0a0a0a;
}

/* Scoped override */
.my-chat-container {
  --ai-font-sans: "Inter", sans-serif;
  --ai-radius-md: 8px;
}`} />

      <H2>Publishing</H2>
      <CodeBlock code={`# Build the library
npm run build --workspace=packages/ai-ui

# Publish to npm
cd packages/ai-ui
npm login
npm publish --access public`} />
    </div>
  );
}

// ── Reusable docs primitives ──────────────────────────────────────────────────

function PageTitle({ children }: { children: React.ReactNode }) {
  return (
    <h1 style={{
      margin: "0 0 12px",
      fontFamily: "var(--ai-font-sans)", fontSize: "clamp(1.6rem, 3vw, 2.1rem)",
      fontWeight: 700, letterSpacing: "-0.025em", color: "var(--ai-text-primary)", lineHeight: 1.2,
    }}>
      {children}
    </h1>
  );
}

function Lead({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      margin: "0 0 40px",
      fontFamily: "var(--ai-font-sans)", fontSize: "var(--ai-text-lg)",
      lineHeight: "var(--ai-leading-relaxed)", color: "var(--ai-text-secondary)",
      maxWidth: 560,
    }}>
      {children}
    </p>
  );
}

function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{
      margin: "36px 0 12px",
      fontFamily: "var(--ai-font-sans)", fontSize: "1.1rem",
      fontWeight: 600, letterSpacing: "-0.01em", color: "var(--ai-text-primary)",
    }}>
      {children}
    </h2>
  );
}

function Prose({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      margin: "0 0 20px",
      fontFamily: "var(--ai-font-sans)", fontSize: "var(--ai-text-base)",
      lineHeight: "var(--ai-leading-relaxed)", color: "var(--ai-text-secondary)", maxWidth: 600,
    }}>
      {children}
    </p>
  );
}

function InlineCode({ children }: { children: React.ReactNode }) {
  return (
    <code style={{
      fontFamily: "var(--ai-font-mono)", fontSize: "0.875em",
      background: "var(--ai-bg-elevated)", padding: "2px 5px", borderRadius: 4,
      color: "var(--ai-accent-amber)",
    }}>
      {children}
    </code>
  );
}

function DemoBox({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <p style={{ margin: "0 0 8px", fontFamily: "var(--ai-font-mono)", fontSize: "var(--ai-text-xs)", color: "var(--ai-text-tertiary)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
        {label}
      </p>
      <div style={{
        padding: "24px",
        background: "var(--ai-bg-surface)",
        border: "1px solid var(--ai-border-default)",
        borderRadius: "var(--ai-radius-lg)",
      }}>
        {children}
      </div>
    </div>
  );
}

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div style={{ position: "relative", marginBottom: 28 }}>
      <pre style={{
        margin: 0, padding: "18px 20px",
        background: "var(--ai-bg-surface)", border: "1px solid var(--ai-border-default)",
        borderRadius: "var(--ai-radius-md)", overflowX: "auto",
        fontFamily: "var(--ai-font-mono)", fontSize: "var(--ai-text-sm)",
        color: "var(--ai-text-secondary)", lineHeight: "var(--ai-leading-relaxed)",
        whiteSpace: "pre",
      }}>
        <code style={{ background: "none", padding: 0, color: "inherit", fontSize: "inherit" }}>{code}</code>
      </pre>
      <button
        onClick={async () => { await navigator.clipboard.writeText(code).catch(() => {}); setCopied(true); setTimeout(() => setCopied(false), 1600); }}
        style={{
          position: "absolute", top: 10, right: 10,
          background: "var(--ai-bg-elevated)", border: "1px solid var(--ai-border-default)",
          borderRadius: "var(--ai-radius-sm)", padding: "4px 8px",
          fontFamily: "var(--ai-font-sans)", fontSize: "var(--ai-text-xs)", fontWeight: 500,
          color: copied ? "var(--ai-accent-green)" : "var(--ai-text-tertiary)",
          cursor: "pointer", transition: "color 120ms",
        }}
      >
        {copied ? "Copied!" : "Copy"}
      </button>
    </div>
  );
}

function PropsTable({ rows }: { rows: [string, string, string, string][] }) {
  return (
    <div style={{ overflowX: "auto", marginBottom: 28 }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--ai-font-sans)", fontSize: "var(--ai-text-sm)" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid var(--ai-border-default)" }}>
            {["Prop", "Type", "Default", "Description"].map(h => (
              <th key={h} style={{ textAlign: "left", padding: "8px 12px", color: "var(--ai-text-tertiary)", fontWeight: 600, fontSize: "var(--ai-text-xs)", letterSpacing: "0.06em", textTransform: "uppercase" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(([prop, type, def, desc], i) => (
            <tr key={prop} style={{ borderBottom: "1px solid var(--ai-border-subtle)", background: i % 2 === 0 ? "transparent" : "var(--ai-bg-surface)" }}>
              <td style={{ padding: "10px 12px" }}>
                <code style={{ fontFamily: "var(--ai-font-mono)", fontSize: "var(--ai-text-xs)", color: "var(--ai-accent-amber)", background: "var(--ai-accent-amber-dim)", padding: "2px 5px", borderRadius: 3 }}>{prop}</code>
              </td>
              <td style={{ padding: "10px 12px" }}>
                <code style={{ fontFamily: "var(--ai-font-mono)", fontSize: "var(--ai-text-xs)", color: "var(--ai-text-secondary)" }}>{type}</code>
              </td>
              <td style={{ padding: "10px 12px" }}>
                <code style={{ fontFamily: "var(--ai-font-mono)", fontSize: "var(--ai-text-xs)", color: "var(--ai-text-tertiary)" }}>{def}</code>
              </td>
              <td style={{ padding: "10px 12px", color: "var(--ai-text-secondary)", lineHeight: "var(--ai-leading-normal)" }}>{desc}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Action button helpers ─────────────────────────────────────────────────────
function ActionBtnDemo({ label, onClick, active, children }: { label: string; onClick: () => void; active?: boolean; children: React.ReactNode }) {
  return (
    <button onClick={onClick} title={label} aria-label={label} style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      width: 28, height: 28, background: active ? "var(--ai-accent-amber-dim)" : "none",
      border: "none", borderRadius: 6, cursor: "pointer", padding: 0,
      color: active ? "var(--ai-accent-amber)" : "var(--ai-text-tertiary)",
      transition: "all 120ms",
    }}>{children}</button>
  );
}
function CopySvg() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="4" y="4" width="8" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.25" /><path d="M4 3.5C4 2.67 4.67 2 5.5 2H10L12 4v6.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" /></svg>; }
function CheckSvg() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2.5 7L5.5 10L11.5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>; }
function RegenSvg() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M11.5 7a4.5 4.5 0 1 1-1.32-3.18" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" /><path d="M10.5 2.5V5.5H7.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" /></svg>; }
function ThumbUp() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 6.5L6.5 2C7.33 2 8 2.67 8 3.5V5.5H11.5L10.5 10.5H5V6.5Z" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" /><path d="M5 6.5H3V10.5H5" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" /></svg>; }
function ThumbDown() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 7.5L7.5 12C6.67 12 6 11.33 6 10.5V8.5H2.5L3.5 3.5H9V7.5Z" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" /><path d="M9 7.5H11V3.5H9" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" /></svg>; }

const QUICKSTART_CODE = `npm install ai-native-ui

import {
  AssistantMessage,
  UserMessage,
  StreamingText,
  ThinkingIndicator,
  ToolCallCard,
  ToolResultCard,
  SourceCitationCard,
  CitationList,
  MessageActions,
  ErrorState,
} from "ai-native-ui";

// Stream an AI response
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
        />
      }
    >
      {isStreaming
        ? <StreamingText text={text} status="streaming" />
        : <ThinkingIndicator variant="dots" label="Thinking…" />
      }
    </AssistantMessage>
  );
}`;

const KEYFRAMES = `
@keyframes cursorBlink { 0%,100% { opacity:1; } 50% { opacity:0; } }
@keyframes thinkDot { 0%,100% { transform:scale(1); opacity:0.4; } 40% { transform:scale(1.3); opacity:1; } }
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes pulse { 0%,100% { opacity:0.4; } 50% { opacity:1; } }
@keyframes pulseRing { 0% { transform:scale(0.6); opacity:0.4; } 100% { transform:scale(2.2); opacity:0; } }
@keyframes pulseCore { 0%,100% { opacity:0.5; transform:scale(0.85); } 50% { opacity:1; transform:scale(1); } }
@keyframes barWave { 0%,100% { height:3px; opacity:0.35; } 50% { height:14px; opacity:1; } }
`;
