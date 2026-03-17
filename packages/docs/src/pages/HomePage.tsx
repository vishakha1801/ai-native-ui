import React, { useEffect, useRef, useState, useCallback } from "react";

// ── Inline component implementations for the demo site ──────────────────────
// These are self-contained copies so the docs site has zero build-time
// dependency issues during development.

// ── StreamingText ─────────────────────────────────────────────────────────────
function StreamingText({
  text,
  status = "streaming",
  cursor = true,
}: {
  text: string;
  status?: "streaming" | "complete" | "error";
  cursor?: boolean;
}) {
  return (
    <span style={{ display: "inline", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
      {text}
      {cursor && status === "streaming" && (
        <span
          aria-hidden="true"
          style={{
            display: "inline-block",
            width: 2,
            height: "1em",
            background: "var(--ai-accent-amber)",
            borderRadius: 1,
            marginLeft: 1,
            verticalAlign: "text-bottom",
            animation: "cursorBlink 1s step-end infinite",
          }}
        />
      )}
    </span>
  );
}

function useStreamingText(text: string, speed = 38) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  const idx = useRef(0);

  const reset = useCallback(() => {
    idx.current = 0;
    setDisplayed("");
    setDone(false);
  }, []);

  useEffect(() => {
    idx.current = 0;
    setDisplayed("");
    setDone(false);
    const id = setInterval(() => {
      idx.current += 2;
      if (idx.current >= text.length) {
        setDisplayed(text);
        setDone(true);
        clearInterval(id);
      } else {
        setDisplayed(text.slice(0, idx.current));
      }
    }, 1000 / speed);
    return () => clearInterval(id);
  }, [text, speed]);

  return { displayed, done, reset };
}

// ── ThinkingIndicator ─────────────────────────────────────────────────────────
function ThinkingIndicator({ label = "Thinking…" }: { label?: string }) {
  return (
    <span
      role="status"
      aria-label={label}
      style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "var(--ai-text-secondary)" }}
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          aria-hidden="true"
          style={{
            display: "block",
            width: 5,
            height: 5,
            borderRadius: "50%",
            background: "var(--ai-accent-amber)",
            opacity: 0.4,
            animation: `thinkDot 1.2s ease-in-out ${i * 160}ms infinite`,
          }}
        />
      ))}
      <span style={{ fontSize: "var(--ai-text-sm)", fontWeight: 450 }}>{label}</span>
    </span>
  );
}

// ── ToolCallCard ──────────────────────────────────────────────────────────────
function ToolCallCard({
  toolName,
  args,
  status,
}: {
  toolName: string;
  args?: Record<string, unknown>;
  status: "pending" | "running" | "success" | "error";
}) {
  const [expanded, setExpanded] = useState(false);
  const colors = {
    pending: { color: "var(--ai-text-tertiary)", bg: "var(--ai-border-subtle)" },
    running: { color: "var(--ai-accent-amber)", bg: "var(--ai-accent-amber-dim)" },
    success: { color: "var(--ai-accent-green)", bg: "var(--ai-accent-green-dim)" },
    error: { color: "var(--ai-accent-red)", bg: "var(--ai-accent-red-dim)" },
  }[status];

  return (
    <div
      style={{
        background: "var(--ai-bg-surface)",
        border: `1px solid ${status === "running" ? "rgba(245,158,11,0.3)" : status === "error" ? "rgba(248,113,113,0.25)" : "var(--ai-border-default)"}`,
        borderRadius: "var(--ai-radius-md)",
        overflow: "hidden",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: 22, height: 22, borderRadius: 6,
            background: colors.bg, color: colors.color, fontSize: 12,
          }}>
            {status === "running" ? (
              <span style={{
                display: "block", width: 10, height: 10,
                border: "1.5px solid rgba(245,158,11,0.3)",
                borderTopColor: "var(--ai-accent-amber)",
                borderRadius: "50%",
                animation: "spin 0.7s linear infinite",
              }} />
            ) : "⚙"}
          </span>
          <span style={{ fontFamily: "var(--ai-font-mono)", fontSize: "var(--ai-text-sm)", fontWeight: 600 }}>
            {toolName}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{
            fontSize: "var(--ai-text-xs)", fontWeight: 600, letterSpacing: "0.04em",
            textTransform: "uppercase", padding: "2px 8px",
            borderRadius: "var(--ai-radius-full)", background: colors.bg, color: colors.color,
          }}>
            {{ pending: "Pending", running: "Running", success: "Done", error: "Error" }[status]}
          </span>
          {args && (
            <button
              onClick={() => setExpanded(e => !e)}
              style={{
                background: "none", border: "none", cursor: "pointer",
                width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center",
                borderRadius: 6, color: "var(--ai-text-tertiary)",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ transform: expanded ? "rotate(180deg)" : "none", transition: "transform 150ms" }}>
                <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
        </div>
      </div>
      {expanded && args && (
        <div style={{ borderTop: "1px solid var(--ai-border-subtle)", padding: "10px 14px" }}>
          <pre style={{
            margin: 0, padding: "10px 12px",
            background: "var(--ai-bg-base)", borderRadius: 6,
            fontFamily: "var(--ai-font-mono)", fontSize: "var(--ai-text-sm)",
            color: "var(--ai-text-secondary)", overflow: "auto",
            lineHeight: "var(--ai-leading-normal)",
          }}>
            <code>{JSON.stringify(args, null, 2)}</code>
          </pre>
        </div>
      )}
    </div>
  );
}

// ── ToolResultCard ────────────────────────────────────────────────────────────
function ToolResultCard({ toolName, result, durationMs }: { toolName: string; result: unknown; durationMs?: number }) {
  const [expanded, setExpanded] = useState(true);
  return (
    <div style={{
      background: "var(--ai-bg-surface)",
      border: "1px solid rgba(74,222,128,0.2)",
      borderRadius: "var(--ai-radius-md)", overflow: "hidden",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: 22, height: 22, borderRadius: 6, fontSize: 12,
            background: "var(--ai-accent-green-dim)", color: "var(--ai-accent-green)",
          }}>✓</span>
          <span style={{ fontFamily: "var(--ai-font-mono)", fontSize: "var(--ai-text-sm)", fontWeight: 600 }}>{toolName}</span>
          {durationMs && (
            <span style={{
              fontFamily: "var(--ai-font-mono)", fontSize: "var(--ai-text-xs)",
              color: "var(--ai-text-tertiary)", padding: "2px 6px",
              background: "var(--ai-border-subtle)", borderRadius: "var(--ai-radius-full)",
            }}>
              {durationMs < 1000 ? `${durationMs}ms` : `${(durationMs / 1000).toFixed(1)}s`}
            </span>
          )}
        </div>
        <button
          onClick={() => setExpanded(e => !e)}
          style={{
            background: "none", border: "none", cursor: "pointer",
            width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center",
            borderRadius: 6, color: "var(--ai-text-tertiary)",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ transform: expanded ? "rotate(180deg)" : "none", transition: "transform 150ms" }}>
            <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
      {expanded && (
        <div style={{ borderTop: "1px solid var(--ai-border-subtle)", padding: "10px 14px" }}>
          <pre style={{
            margin: 0, padding: "10px 12px",
            background: "var(--ai-bg-base)", borderRadius: 6,
            fontFamily: "var(--ai-font-mono)", fontSize: "var(--ai-text-sm)",
            color: "var(--ai-text-secondary)", overflow: "auto", maxHeight: 180,
            lineHeight: "var(--ai-leading-normal)",
          }}>
            <code>{typeof result === "string" ? result : JSON.stringify(result, null, 2)}</code>
          </pre>
        </div>
      )}
    </div>
  );
}

// ── SourceCitationCard ────────────────────────────────────────────────────────
function SourceCitationCard({
  title, url, snippet, domain, relevance, index,
}: {
  title: string; url?: string; snippet?: string;
  domain?: string; relevance?: number; index?: number;
}) {
  const resolvedDomain = domain ?? (url ? (() => { try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return url; } })() : undefined);
  return (
    <a
      href={url ?? "#"}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "flex", flexDirection: "column", gap: 6,
        padding: "12px 14px", textDecoration: "none", color: "inherit",
        background: "var(--ai-bg-surface)",
        border: "1px solid var(--ai-border-default)",
        borderRadius: "var(--ai-radius-md)",
        transition: "border-color 120ms, background 120ms",
        position: "relative", overflow: "hidden",
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--ai-border-strong)"; (e.currentTarget as HTMLElement).style.background = "var(--ai-bg-elevated)"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--ai-border-default)"; (e.currentTarget as HTMLElement).style.background = "var(--ai-bg-surface)"; }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {resolvedDomain && (
            <img src={`https://www.google.com/s2/favicons?domain=${resolvedDomain}&sz=16`} alt="" width={14} height={14} style={{ borderRadius: 2, opacity: 0.85 }} />
          )}
          <span style={{ fontFamily: "var(--ai-font-sans)", fontSize: "var(--ai-text-xs)", color: "var(--ai-text-tertiary)", letterSpacing: "0.02em" }}>
            {resolvedDomain}
          </span>
          {relevance !== undefined && (
            <span style={{
              fontFamily: "var(--ai-font-mono)", fontSize: "10px", fontWeight: 700,
              padding: "1px 6px", borderRadius: "var(--ai-radius-full)",
              color: relevance >= 0.85 ? "var(--ai-accent-green)" : "var(--ai-accent-amber)",
              background: relevance >= 0.85 ? "var(--ai-accent-green-dim)" : "var(--ai-accent-amber-dim)",
            }}>
              {Math.round(relevance * 100)}%
            </span>
          )}
        </div>
        {index !== undefined && (
          <span style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            minWidth: 18, height: 18, padding: "0 4px",
            background: "var(--ai-accent-amber-dim)", color: "var(--ai-accent-amber)",
            borderRadius: 4, fontFamily: "var(--ai-font-mono)", fontSize: "var(--ai-text-xs)", fontWeight: 700,
          }}>{index}</span>
        )}
      </div>
      <p style={{ margin: 0, fontFamily: "var(--ai-font-sans)", fontSize: "var(--ai-text-sm)", fontWeight: 500, color: "var(--ai-text-primary)", lineHeight: 1.4 }}>
        {title}
      </p>
      {snippet && (
        <p style={{
          margin: 0, fontFamily: "var(--ai-font-sans)", fontSize: "var(--ai-text-sm)",
          color: "var(--ai-text-secondary)", lineHeight: "var(--ai-leading-normal)",
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
        }}>
          {snippet}
        </p>
      )}
      <span style={{ position: "absolute", top: 10, right: 10, fontSize: 12, color: "var(--ai-text-tertiary)" }}>↗</span>
    </a>
  );
}

// ── MessageActions ────────────────────────────────────────────────────────────
function MessageActions({ copyText, onRegenerate }: { copyText?: string; onRegenerate?: () => void }) {
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
      <ActionBtn label={copied ? "Copied" : "Copy"} active={copied} onClick={async () => {
        if (copyText) await navigator.clipboard.writeText(copyText).catch(() => {});
        setCopied(true); setTimeout(() => setCopied(false), 1800);
      }}>
        {copied ? <CheckSvg /> : <CopySvg />}
      </ActionBtn>
      {onRegenerate && (
        <ActionBtn label="Regenerate" onClick={onRegenerate}>
          <RegenSvg />
        </ActionBtn>
      )}
      <div style={{ width: 1, height: 16, background: "var(--ai-border-default)", margin: "0 4px" }} />
      <ActionBtn label="Good" active={feedback === "up"} onClick={() => setFeedback(f => f === "up" ? null : "up")}>
        <ThumbUp />
      </ActionBtn>
      <ActionBtn label="Poor" active={feedback === "down"} onClick={() => setFeedback(f => f === "down" ? null : "down")}>
        <ThumbDown />
      </ActionBtn>
    </div>
  );
}

function ActionBtn({ label, onClick, active, children }: { label: string; onClick: () => void; active?: boolean; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        width: 28, height: 28, background: "none", border: "none",
        borderRadius: 6, cursor: "pointer", padding: 0,
        color: active ? "var(--ai-accent-amber)" : "var(--ai-text-tertiary)",
        backgroundColor: active ? "var(--ai-accent-amber-dim)" : "transparent",
        transition: "all 120ms",
      }}
    >{children}</button>
  );
}

function CopySvg() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="4" y="4" width="8" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.25" /><path d="M4 3.5C4 2.67 4.67 2 5.5 2H10L12 4v6.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" /></svg>; }
function CheckSvg() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2.5 7L5.5 10L11.5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>; }
function RegenSvg() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M11.5 7a4.5 4.5 0 1 1-1.32-3.18" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" /><path d="M10.5 2.5V5.5H7.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" /></svg>; }
function ThumbUp() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 6.5L6.5 2C7.33 2 8 2.67 8 3.5V5.5H11.5L10.5 10.5H5V6.5Z" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" /><path d="M5 6.5H3V10.5H5" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" /></svg>; }
function ThumbDown() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 7.5L7.5 12C6.67 12 6 11.33 6 10.5V8.5H2.5L3.5 3.5H9V7.5Z" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" /><path d="M9 7.5H11V3.5H9" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" /></svg>; }

// ── Demo data ─────────────────────────────────────────────────────────────────
const DEMO_RESPONSE = `Transformer attention complexity is O(n²) in sequence length, which creates a real bottleneck at longer contexts. The key insight is that most attention patterns are sparse — a token rarely needs to attend equally to all others.

Several approaches have gained traction: sliding window attention restricts each token to a fixed local window, reducing complexity to O(n·w). Sparse transformers extend this with a strided pattern that still captures long-range dependencies. More recently, linear attention variants approximate the softmax kernel, achieving O(n) at the cost of some expressiveness.

For production systems, the practical answer depends on your sequence lengths and hardware constraints.`;

const CITATIONS = [
  { title: "Efficient Transformers: A Survey", url: "https://arxiv.org/abs/2009.06732", domain: "arxiv.org", snippet: "Comprehensive review of efficient transformer variants addressing the quadratic attention bottleneck.", relevance: 0.94, index: 1 },
  { title: "Longformer: Long Document Transformer", url: "https://arxiv.org/abs/2004.05150", domain: "arxiv.org", snippet: "Introduces sliding window attention combined with task-specific global attention.", relevance: 0.87, index: 2 },
  { title: "FlashAttention: Fast Memory-Efficient Exact Attention", url: "https://arxiv.org/abs/2205.14135", domain: "arxiv.org", snippet: "IO-aware exact attention algorithm using tiling to reduce memory reads/writes.", relevance: 0.81, index: 3 },
];

// ── Demo phases ───────────────────────────────────────────────────────────────
type Phase =
  | "idle"
  | "thinking"
  | "tool-call"
  | "tool-running"
  | "tool-done"
  | "streaming"
  | "citations"
  | "complete";

export function HomePage({ onGetStarted }: { onGetStarted: () => void }) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [streamedText, setStreamedText] = useState("");
  const streamRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const charRef = useRef(0);

  const runDemo = useCallback(() => {
    setPhase("idle");
    setStreamedText("");
    charRef.current = 0;
    if (streamRef.current) clearInterval(streamRef.current);

    setTimeout(() => setPhase("thinking"), 100);
    setTimeout(() => setPhase("tool-call"), 1400);
    setTimeout(() => setPhase("tool-running"), 2000);
    setTimeout(() => setPhase("tool-done"), 3200);
    setTimeout(() => {
      setPhase("streaming");
      const id = setInterval(() => {
        charRef.current += 3;
        if (charRef.current >= DEMO_RESPONSE.length) {
          setStreamedText(DEMO_RESPONSE);
          clearInterval(id);
          streamRef.current = null;
          setTimeout(() => setPhase("citations"), 300);
          setTimeout(() => setPhase("complete"), 700);
        } else {
          setStreamedText(DEMO_RESPONSE.slice(0, charRef.current));
        }
      }, 28);
      streamRef.current = id;
    }, 3600);
  }, []);

  useEffect(() => {
    const t = setTimeout(runDemo, 600);
    return () => clearTimeout(t);
  }, [runDemo]);

  const showThinking = phase === "thinking";
  const showToolCall = ["tool-call", "tool-running", "tool-done", "streaming", "citations", "complete"].includes(phase);
  const toolStatus = phase === "tool-call" ? "pending" : phase === "tool-running" ? "running" : "success";
  const showToolResult = ["tool-done", "streaming", "citations", "complete"].includes(phase);
  const showText = ["streaming", "citations", "complete"].includes(phase);
  const showCitations = ["citations", "complete"].includes(phase);
  const showActions = phase === "complete";

  return (
    <div>
      <style>{KEYFRAMES}</style>

      {/* ── Hero ── */}
      <section style={{ padding: "80px 24px 60px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ maxWidth: 680 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "5px 12px 5px 8px",
            background: "var(--ai-accent-amber-subtle)",
            border: "1px solid rgba(245,158,11,0.2)",
            borderRadius: "var(--ai-radius-full)",
            marginBottom: 28,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--ai-accent-amber)", animation: "pulse 2s ease-in-out infinite" }} />
            <span style={{ fontFamily: "var(--ai-font-mono)", fontSize: "var(--ai-text-xs)", fontWeight: 600, color: "var(--ai-accent-amber)", letterSpacing: "0.05em", textTransform: "uppercase" }}>
              v0.1.0 — now available
            </span>
          </div>

          <h1 style={{
            margin: "0 0 20px",
            fontFamily: "var(--ai-font-sans)",
            fontSize: "clamp(2.2rem, 5vw, 3.25rem)",
            fontWeight: 700,
            lineHeight: 1.12,
            letterSpacing: "-0.03em",
            color: "var(--ai-text-primary)",
          }}>
            UI primitives built<br />
            <span style={{ color: "var(--ai-accent-amber)" }}>for AI interfaces</span>
          </h1>

          <p style={{
            margin: "0 0 36px",
            fontFamily: "var(--ai-font-sans)",
            fontSize: "var(--ai-text-lg)",
            lineHeight: "var(--ai-leading-relaxed)",
            color: "var(--ai-text-secondary)",
            maxWidth: 540,
          }}>
            React components for streaming text, tool calls, citations, reasoning states, and message actions. 
            The primitives your design system wasn't built to handle.
          </p>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button
              onClick={onGetStarted}
              style={{
                fontFamily: "var(--ai-font-sans)", fontSize: "var(--ai-text-base)", fontWeight: 600,
                padding: "11px 24px", background: "var(--ai-accent-amber)",
                color: "var(--ai-text-inverse)", border: "none", borderRadius: "var(--ai-radius-md)",
                cursor: "pointer", transition: "opacity 120ms",
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = "0.88")}
              onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
            >
              Read the docs →
            </button>
            <CodePill>npm install ai-native-ui</CodePill>
          </div>
        </div>
      </section>

      {/* ── Composed Demo ── */}
      <section style={{ padding: "0 24px 80px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, alignItems: "start" }}>

          {/* Left — live demo */}
          <div>
            <div style={{ marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <p style={{ margin: 0, fontFamily: "var(--ai-font-mono)", fontSize: "var(--ai-text-xs)", color: "var(--ai-text-tertiary)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                Live demo
              </p>
              <button
                onClick={runDemo}
                style={{
                  fontFamily: "var(--ai-font-sans)", fontSize: "var(--ai-text-xs)", fontWeight: 500,
                  color: "var(--ai-accent-amber)", background: "var(--ai-accent-amber-dim)",
                  border: "none", borderRadius: "var(--ai-radius-sm)", padding: "4px 10px",
                  cursor: "pointer", transition: "opacity 120ms",
                }}
              >
                ↺ Replay
              </button>
            </div>

            <div style={{
              background: "var(--ai-bg-surface)",
              border: "1px solid var(--ai-border-default)",
              borderRadius: "var(--ai-radius-xl)",
              overflow: "hidden",
              boxShadow: "var(--ai-shadow-lg)",
            }}>
              {/* Chat window header */}
              <div style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "14px 18px",
                borderBottom: "1px solid var(--ai-border-subtle)",
              }}>
                {["#f87171", "#f59e0b", "#4ade80"].map((c) => (
                  <span key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c, opacity: 0.6 }} />
                ))}
                <span style={{ marginLeft: 8, fontFamily: "var(--ai-font-mono)", fontSize: "var(--ai-text-xs)", color: "var(--ai-text-tertiary)" }}>
                  AI Chat
                </span>
              </div>

              <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 0, minHeight: 420 }}>

                {/* User message */}
                <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
                  <div style={{
                    maxWidth: "78%",
                    background: "var(--ai-bg-elevated)",
                    border: "1px solid var(--ai-border-default)",
                    borderRadius: "var(--ai-radius-lg)",
                    borderBottomRightRadius: 6,
                    padding: "10px 14px",
                  }}>
                    <p style={{ margin: 0, fontFamily: "var(--ai-font-sans)", fontSize: "var(--ai-text-sm)", lineHeight: "var(--ai-leading-normal)", color: "var(--ai-text-primary)" }}>
                      How do transformer attention mechanisms scale with sequence length, and what are the main approaches to improving that?
                    </p>
                  </div>
                </div>

                {/* Assistant message */}
                <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 6, flexShrink: 0,
                    background: "var(--ai-accent-amber-dim)",
                    border: "1px solid rgba(245,158,11,0.2)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "var(--ai-font-sans)", fontSize: 10, fontWeight: 700,
                    color: "var(--ai-accent-amber)", marginTop: 2,
                  }}>AI</div>

                  <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                    {/* Model name + status dot */}
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontFamily: "var(--ai-font-sans)", fontSize: "var(--ai-text-sm)", fontWeight: 600, color: "var(--ai-text-secondary)" }}>
                        claude-3.5
                      </span>
                      {(showThinking || (showText && phase === "streaming")) && (
                        <span style={{
                          width: 6, height: 6, borderRadius: "50%",
                          background: "var(--ai-accent-amber)",
                          animation: "pulse 1.4s ease-in-out infinite",
                        }} />
                      )}
                    </div>

                    {showThinking && <ThinkingIndicator label="Analyzing question…" />}

                    {showToolCall && (
                      <ToolCallCard
                        toolName="search_papers"
                        args={{ query: "transformer attention efficiency O(n2)", limit: 5, filter: "2020-2024" }}
                        status={toolStatus as "pending" | "running" | "success" | "error"}
                      />
                    )}

                    {showToolResult && (
                      <ToolResultCard
                        toolName="search_papers"
                        result={{ papers: 3, top_result: "Efficient Transformers: A Survey (2020)", confidence: 0.94 }}
                        durationMs={1180}
                      />
                    )}

                    {showText && (
                      <div style={{ fontFamily: "var(--ai-font-sans)", fontSize: "var(--ai-text-sm)", lineHeight: "var(--ai-leading-relaxed)", color: "var(--ai-text-primary)" }}>
                        <StreamingText text={streamedText} status={phase === "streaming" ? "streaming" : "complete"} />
                      </div>
                    )}

                    {showCitations && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <p style={{ margin: 0, fontFamily: "var(--ai-font-mono)", fontSize: "var(--ai-text-xs)", color: "var(--ai-text-tertiary)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                          Sources
                        </p>
                        {CITATIONS.map(c => (
                          <SourceCitationCard key={c.index} {...c} />
                        ))}
                      </div>
                    )}

                    {showActions && (
                      <div style={{ paddingTop: 2 }}>
                        <MessageActions copyText={DEMO_RESPONSE} onRegenerate={runDemo} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right — feature callouts */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20, paddingTop: 44 }}>
            {FEATURES.map((f) => (
              <FeatureCard key={f.title} {...f} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Component Grid ── */}
      <section style={{ padding: "60px 24px 80px", borderTop: "1px solid var(--ai-border-subtle)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <SectionLabel>Components</SectionLabel>
          <h2 style={{ margin: "0 0 8px", fontFamily: "var(--ai-font-sans)", fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 700, letterSpacing: "-0.02em" }}>
            Every primitive, purposeful
          </h2>
          <p style={{ margin: "0 0 48px", color: "var(--ai-text-secondary)", fontSize: "var(--ai-text-base)", maxWidth: 480 }}>
            Each component solves a problem that generic design systems treat as an afterthought.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
            {COMPONENTS.map(c => <ComponentCard key={c.name} {...c} />)}
          </div>
        </div>
      </section>

      {/* ── Install ── */}
      <section style={{ padding: "60px 24px 80px", borderTop: "1px solid var(--ai-border-subtle)" }}>
        <div style={{ maxWidth: 640, margin: "0 auto", textAlign: "center" }}>
          <SectionLabel>Install</SectionLabel>
          <h2 style={{ margin: "0 0 8px", fontFamily: "var(--ai-font-sans)", fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 700, letterSpacing: "-0.02em" }}>
            Up in two lines
          </h2>
          <p style={{ margin: "0 0 32px", color: "var(--ai-text-secondary)" }}>
            Zero config. Bring your own styles or use ours.
          </p>
          <InstallBlock />
        </div>
      </section>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      margin: "0 0 12px",
      fontFamily: "var(--ai-font-mono)", fontSize: "var(--ai-text-xs)", fontWeight: 600,
      color: "var(--ai-accent-amber)", letterSpacing: "0.08em", textTransform: "uppercase",
    }}>
      {children}
    </p>
  );
}

function CodePill({ children }: { children: React.ReactNode }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => {
        await navigator.clipboard.writeText(String(children)).catch(() => {});
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
      }}
      style={{
        display: "flex", alignItems: "center", gap: 10,
        fontFamily: "var(--ai-font-mono)", fontSize: "var(--ai-text-sm)", fontWeight: 500,
        padding: "10px 18px",
        background: "var(--ai-bg-elevated)",
        border: "1px solid var(--ai-border-default)",
        borderRadius: "var(--ai-radius-md)",
        color: "var(--ai-text-secondary)",
        cursor: "pointer",
        transition: "border-color 120ms",
      }}
    >
      <span style={{ color: "var(--ai-accent-amber)" }}>$</span>
      {children}
      <span style={{ color: copied ? "var(--ai-accent-green)" : "var(--ai-text-tertiary)", fontSize: 12 }}>
        {copied ? "✓" : "⎘"}
      </span>
    </button>
  );
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div style={{
      display: "flex", gap: 14, alignItems: "flex-start",
      padding: "18px 20px",
      background: "var(--ai-bg-surface)",
      border: "1px solid var(--ai-border-default)",
      borderRadius: "var(--ai-radius-md)",
    }}>
      <span style={{ fontSize: 20, lineHeight: 1, flexShrink: 0, marginTop: 1 }}>{icon}</span>
      <div>
        <p style={{ margin: "0 0 4px", fontFamily: "var(--ai-font-sans)", fontSize: "var(--ai-text-sm)", fontWeight: 600 }}>{title}</p>
        <p style={{ margin: 0, fontFamily: "var(--ai-font-sans)", fontSize: "var(--ai-text-sm)", color: "var(--ai-text-secondary)", lineHeight: "var(--ai-leading-normal)" }}>{description}</p>
      </div>
    </div>
  );
}

function ComponentCard({ name, description, tag }: { name: string; description: string; tag: string }) {
  return (
    <div style={{
      padding: "18px 20px",
      background: "var(--ai-bg-surface)",
      border: "1px solid var(--ai-border-default)",
      borderRadius: "var(--ai-radius-md)",
      transition: "border-color 120ms, background 120ms",
    }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--ai-border-strong)"; (e.currentTarget as HTMLElement).style.background = "var(--ai-bg-elevated)"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--ai-border-default)"; (e.currentTarget as HTMLElement).style.background = "var(--ai-bg-surface)"; }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <span style={{
          fontFamily: "var(--ai-font-mono)", fontSize: "var(--ai-text-sm)", fontWeight: 600,
          color: "var(--ai-text-primary)",
        }}>
          {name}
        </span>
        <span style={{
          fontFamily: "var(--ai-font-mono)", fontSize: "10px", fontWeight: 600, letterSpacing: "0.05em",
          textTransform: "uppercase", padding: "2px 7px", borderRadius: "var(--ai-radius-full)",
          color: TAG_COLORS[tag]?.color ?? "var(--ai-text-tertiary)",
          background: TAG_COLORS[tag]?.bg ?? "var(--ai-border-subtle)",
        }}>
          {tag}
        </span>
      </div>
      <p style={{ margin: 0, fontFamily: "var(--ai-font-sans)", fontSize: "var(--ai-text-sm)", color: "var(--ai-text-secondary)", lineHeight: "var(--ai-leading-normal)" }}>
        {description}
      </p>
    </div>
  );
}

function InstallBlock() {
  const [tab, setTab] = useState<"npm" | "usage">("npm");
  const installCode = `npm install ai-native-ui`;
  const usageCode = `import {
  StreamingText,
  ThinkingIndicator,
  AssistantMessage,
  ToolCallCard,
  SourceCitationCard,
} from "ai-native-ui";

// Stream an AI response
<StreamingText text={chunk} status="streaming" />

// Show thinking state
<ThinkingIndicator variant="dots" label="Analyzing…" />

// Display a tool invocation
<ToolCallCard
  toolName="search_papers"
  args={{ query: "transformer scaling" }}
  status="running"
/>`;

  return (
    <div style={{
      background: "var(--ai-bg-surface)",
      border: "1px solid var(--ai-border-default)",
      borderRadius: "var(--ai-radius-lg)",
      overflow: "hidden",
      textAlign: "left",
    }}>
      <div style={{ display: "flex", borderBottom: "1px solid var(--ai-border-subtle)" }}>
        {(["npm", "usage"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            flex: 1, padding: "10px 0",
            background: "none", border: "none", cursor: "pointer",
            fontFamily: "var(--ai-font-mono)", fontSize: "var(--ai-text-xs)", fontWeight: 600,
            letterSpacing: "0.04em", textTransform: "uppercase",
            color: tab === t ? "var(--ai-accent-amber)" : "var(--ai-text-tertiary)",
            borderBottom: tab === t ? "2px solid var(--ai-accent-amber)" : "2px solid transparent",
            transition: "color 120ms",
          }}>
            {t === "npm" ? "Install" : "Usage"}
          </button>
        ))}
      </div>
      <pre style={{
        margin: 0, padding: "20px 22px",
        fontFamily: "var(--ai-font-mono)", fontSize: "var(--ai-text-sm)",
        color: "var(--ai-text-secondary)", lineHeight: "var(--ai-leading-relaxed)",
        overflowX: "auto", whiteSpace: "pre",
      }}>
        <code style={{ color: "inherit", background: "none", padding: 0 }}>
          {tab === "npm" ? installCode : usageCode}
        </code>
      </pre>
    </div>
  );
}

// ── Data ──────────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: "⚡",
    title: "Streaming-first",
    description: "StreamingText handles progressive rendering, cursor behavior, reduced motion, and stable layout — not just string concatenation.",
  },
  {
    icon: "🔧",
    title: "Tool call lifecycle",
    description: "ToolCallCard and ToolResultCard communicate machine actions with pending, running, success, and error states.",
  },
  {
    icon: "📎",
    title: "Grounded citations",
    description: "SourceCitationCard is purpose-built for AI responses — favicon, domain, snippet, relevance score, and truncation baked in.",
  },
  {
    icon: "♿",
    title: "Accessible by default",
    description: "ARIA live regions, role=status, reduced motion, keyboard focus — not bolted on after.",
  },
];

const COMPONENTS = [
  { name: "<StreamingText>", description: "Renders progressively-received text with cursor and accessible live region announcements.", tag: "streaming" },
  { name: "<ThinkingIndicator>", description: "Three variants (dots, pulse, bar) with proper ARIA semantics and reduced motion support.", tag: "streaming" },
  { name: "<AssistantMessage>", description: "Full message container composing streaming content, tool calls, citations, and actions.", tag: "messages" },
  { name: "<UserMessage>", description: "Human turn message with distinct right-aligned bubble layout.", tag: "messages" },
  { name: "<SourceCitationCard>", description: "AI-native citation with favicon, domain, snippet, relevance score, and link affordance.", tag: "citations" },
  { name: "<CitationList>", description: "Vertical, horizontal, or grid layout for a collection of citations.", tag: "citations" },
  { name: "<InlineCitation>", description: "Superscript reference number for inline use within prose text.", tag: "citations" },
  { name: "<ToolCallCard>", description: "Shows a tool invocation with status badge, expandable arguments, and state transitions.", tag: "tools" },
  { name: "<ToolResultCard>", description: "Displays tool output with formatted result, duration, and success/error states.", tag: "tools" },
  { name: "<MessageActions>", description: "Copy, regenerate, and thumbs feedback row with clipboard API integration.", tag: "actions" },
  { name: "<ErrorState>", description: "Inline, block, or banner error display with recovery actions.", tag: "feedback" },
];

const TAG_COLORS: Record<string, { color: string; bg: string }> = {
  streaming: { color: "var(--ai-accent-amber)", bg: "var(--ai-accent-amber-dim)" },
  messages: { color: "var(--ai-accent-blue)", bg: "var(--ai-accent-blue-dim)" },
  citations: { color: "var(--ai-accent-green)", bg: "var(--ai-accent-green-dim)" },
  tools: { color: "#c084fc", bg: "rgba(192,132,252,0.15)" },
  actions: { color: "var(--ai-text-secondary)", bg: "var(--ai-border-subtle)" },
  feedback: { color: "var(--ai-accent-red)", bg: "var(--ai-accent-red-dim)" },
};

const KEYFRAMES = `
@keyframes cursorBlink { 0%,100% { opacity:1; } 50% { opacity:0; } }
@keyframes thinkDot { 0%,100% { transform:scale(1); opacity:0.4; } 40% { transform:scale(1.3); opacity:1; } }
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes pulse { 0%,100% { opacity:0.4; transform:scale(0.9); } 50% { opacity:1; transform:scale(1.1); } }
`;
