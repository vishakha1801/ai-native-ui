import React, { useState } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

export type ToolStatus = "pending" | "running" | "success" | "error";

export interface ToolCallCardProps {
  /** Name of the tool being invoked */
  toolName: string;
  /** Input arguments (will be JSON-formatted) */
  args?: Record<string, unknown>;
  /** Current execution status */
  status?: ToolStatus;
  /** Human-readable description of what the tool is doing */
  description?: string;
  /** Whether argument detail is expanded by default */
  defaultExpanded?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export interface ToolResultCardProps {
  /** Name of the tool that produced this result */
  toolName: string;
  /** Execution status */
  status: "success" | "error";
  /** The result value (will be JSON-formatted if object) */
  result?: unknown;
  /** Error message if status === "error" */
  error?: string;
  /** Execution duration in milliseconds */
  durationMs?: number;
  /** Whether result detail is expanded by default */
  defaultExpanded?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

// ── ToolCallCard ──────────────────────────────────────────────────────────────

/**
 * ToolCallCard displays a pending or in-progress tool invocation.
 * Shows tool name, status badge, arguments with expand/collapse, and
 * animated running indicator.
 */
export function ToolCallCard({
  toolName,
  args,
  status = "pending",
  description,
  defaultExpanded = false,
  className,
  style,
}: ToolCallCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const hasArgs = args && Object.keys(args).length > 0;

  return (
    <>
      <div
        className={[
          "ai-tool-call",
          `ai-tool-call--${status}`,
          className ?? "",
        ]
          .filter(Boolean)
          .join(" ")}
        style={style}
        role="region"
        aria-label={`Tool call: ${toolName}`}
      >
        <div className="ai-tool-call__header">
          <div className="ai-tool-call__identity">
            <ToolIcon status={status} />
            <span className="ai-tool-call__name">{toolName}</span>
            {description && (
              <span className="ai-tool-call__description">{description}</span>
            )}
          </div>
          <div className="ai-tool-call__right">
            <StatusBadge status={status} />
            {hasArgs && (
              <button
                className="ai-tool-call__toggle"
                onClick={() => setExpanded((e) => !e)}
                aria-expanded={expanded}
                aria-label={expanded ? "Collapse arguments" : "Expand arguments"}
              >
                <ChevronIcon expanded={expanded} />
              </button>
            )}
          </div>
        </div>

        {hasArgs && expanded && (
          <div className="ai-tool-call__body">
            <CodeBlock value={args} label="Arguments" />
          </div>
        )}
      </div>
      <style>{STYLES}</style>
    </>
  );
}

ToolCallCard.displayName = "ToolCallCard";

// ── ToolResultCard ────────────────────────────────────────────────────────────

/**
 * ToolResultCard displays the output of a completed tool execution.
 * Handles success and error states, shows the result value with
 * syntax-highlighted display, and optional execution duration.
 */
export function ToolResultCard({
  toolName,
  status,
  result,
  error,
  durationMs,
  defaultExpanded = true,
  className,
  style,
}: ToolResultCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <>
      <div
        className={[
          "ai-tool-result",
          `ai-tool-result--${status}`,
          className ?? "",
        ]
          .filter(Boolean)
          .join(" ")}
        style={style}
        role="region"
        aria-label={`Tool result: ${toolName}`}
      >
        <div className="ai-tool-result__header">
          <div className="ai-tool-result__identity">
            <ResultIcon status={status} />
            <span className="ai-tool-result__name">{toolName}</span>
            {durationMs !== undefined && (
              <span className="ai-tool-result__duration">{formatDuration(durationMs)}</span>
            )}
          </div>
          <button
            className="ai-tool-call__toggle"
            onClick={() => setExpanded((e) => !e)}
            aria-expanded={expanded}
            aria-label={expanded ? "Collapse result" : "Expand result"}
          >
            <ChevronIcon expanded={expanded} />
          </button>
        </div>

        {expanded && (
          <div className="ai-tool-result__body">
            {status === "error" && error && (
              <div className="ai-tool-result__error">
                <span className="ai-tool-result__error-label">Error</span>
                <span className="ai-tool-result__error-message">{error}</span>
              </div>
            )}
            {result !== undefined && (
              <CodeBlock value={result} label="Result" />
            )}
          </div>
        )}
      </div>
      <style>{STYLES}</style>
    </>
  );
}

ToolResultCard.displayName = "ToolResultCard";

// ── Sub-components ────────────────────────────────────────────────────────────

function ToolIcon({ status }: { status: ToolStatus }) {
  return (
    <span className={`ai-tool-icon ai-tool-icon--${status}`} aria-hidden="true">
      {status === "running" ? (
        <span className="ai-tool-icon__spinner" />
      ) : (
        <span className="ai-tool-icon__glyph">⚙</span>
      )}
    </span>
  );
}

function ResultIcon({ status }: { status: "success" | "error" }) {
  return (
    <span className={`ai-tool-icon ai-tool-icon--${status}`} aria-hidden="true">
      <span className="ai-tool-icon__glyph">
        {status === "success" ? "✓" : "✕"}
      </span>
    </span>
  );
}

function StatusBadge({ status }: { status: ToolStatus }) {
  const labels: Record<ToolStatus, string> = {
    pending: "Pending",
    running: "Running",
    success: "Done",
    error: "Error",
  };
  return (
    <span className={`ai-tool-badge ai-tool-badge--${status}`} role="status">
      {labels[status]}
    </span>
  );
}

function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
      style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 150ms" }}
    >
      <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CodeBlock({ value, label }: { value: unknown; label: string }) {
  const formatted =
    typeof value === "string" ? value : JSON.stringify(value, null, 2);
  return (
    <div className="ai-tool-code">
      <span className="ai-tool-code__label">{label}</span>
      <pre className="ai-tool-code__pre">
        <code className="ai-tool-code__code">{formatted}</code>
      </pre>
    </div>
  );
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

// ── Styles ────────────────────────────────────────────────────────────────────

const STYLES = `
/* ── ToolCallCard ── */
.ai-tool-call,
.ai-tool-result {
  background: var(--ai-bg-surface, #13161b);
  border: 1px solid var(--ai-border-default, rgba(255,255,255,0.10));
  border-radius: var(--ai-radius-md, 10px);
  overflow: hidden;
  font-family: var(--ai-font-sans, sans-serif);
}

.ai-tool-call--running {
  border-color: rgba(245, 158, 11, 0.3);
}

.ai-tool-result--error {
  border-color: rgba(248, 113, 113, 0.3);
}

.ai-tool-result--success {
  border-color: rgba(74, 222, 128, 0.2);
}

.ai-tool-call__header,
.ai-tool-result__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--ai-space-3, 12px) var(--ai-space-4, 16px);
  gap: var(--ai-space-3, 12px);
}

.ai-tool-call__identity,
.ai-tool-result__identity {
  display: flex;
  align-items: center;
  gap: var(--ai-space-2, 8px);
  min-width: 0;
}

.ai-tool-call__name,
.ai-tool-result__name {
  font-family: var(--ai-font-mono, monospace);
  font-size: var(--ai-text-sm, 13px);
  font-weight: 600;
  color: var(--ai-text-primary, #f0f2f5);
  white-space: nowrap;
}

.ai-tool-call__description {
  font-size: var(--ai-text-sm, 13px);
  color: var(--ai-text-secondary, #8b95a8);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ai-tool-result__duration {
  font-family: var(--ai-font-mono, monospace);
  font-size: var(--ai-text-xs, 11px);
  color: var(--ai-text-tertiary, #525c6b);
  padding: 2px 6px;
  background: var(--ai-border-subtle, rgba(255,255,255,0.06));
  border-radius: var(--ai-radius-full, 9999px);
}

.ai-tool-call__right {
  display: flex;
  align-items: center;
  gap: var(--ai-space-2, 8px);
  flex-shrink: 0;
}

/* ── Status badge ── */
.ai-tool-badge {
  font-size: var(--ai-text-xs, 11px);
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  padding: 2px 8px;
  border-radius: var(--ai-radius-full, 9999px);
}

.ai-tool-badge--pending {
  color: var(--ai-text-tertiary, #525c6b);
  background: var(--ai-border-subtle, rgba(255,255,255,0.06));
}

.ai-tool-badge--running {
  color: var(--ai-accent-amber, #f59e0b);
  background: var(--ai-accent-amber-dim, rgba(245,158,11,0.15));
}

.ai-tool-badge--success {
  color: var(--ai-accent-green, #4ade80);
  background: var(--ai-accent-green-dim, rgba(74,222,128,0.12));
}

.ai-tool-badge--error {
  color: var(--ai-accent-red, #f87171);
  background: var(--ai-accent-red-dim, rgba(248,113,113,0.12));
}

/* ── Toggle button ── */
.ai-tool-call__toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: none;
  border: none;
  border-radius: var(--ai-radius-sm, 6px);
  color: var(--ai-text-tertiary, #525c6b);
  cursor: pointer;
  padding: 0;
  transition: color var(--ai-duration-fast, 120ms), background var(--ai-duration-fast, 120ms);
}

.ai-tool-call__toggle:hover {
  color: var(--ai-text-primary, #f0f2f5);
  background: var(--ai-border-subtle, rgba(255,255,255,0.06));
}

.ai-tool-call__toggle:focus-visible {
  outline: 2px solid var(--ai-accent-amber, #f59e0b);
  outline-offset: 2px;
}

/* ── Body / code ── */
.ai-tool-call__body,
.ai-tool-result__body {
  border-top: 1px solid var(--ai-border-subtle, rgba(255,255,255,0.06));
  padding: var(--ai-space-3, 12px) var(--ai-space-4, 16px);
  display: flex;
  flex-direction: column;
  gap: var(--ai-space-3, 12px);
}

.ai-tool-code {
  display: flex;
  flex-direction: column;
  gap: var(--ai-space-1, 4px);
}

.ai-tool-code__label {
  font-size: var(--ai-text-xs, 11px);
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--ai-text-tertiary, #525c6b);
}

.ai-tool-code__pre {
  margin: 0;
  padding: var(--ai-space-3, 12px);
  background: var(--ai-bg-base, #0d0f12);
  border-radius: var(--ai-radius-sm, 6px);
  overflow-x: auto;
}

.ai-tool-code__code {
  font-family: var(--ai-font-mono, monospace);
  font-size: var(--ai-text-sm, 13px);
  line-height: var(--ai-leading-normal, 1.6);
  color: var(--ai-text-secondary, #8b95a8);
  white-space: pre;
}

/* ── Tool icon ── */
.ai-tool-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: var(--ai-radius-sm, 6px);
  flex-shrink: 0;
}

.ai-tool-icon--pending,
.ai-tool-icon--running {
  background: var(--ai-accent-amber-dim, rgba(245,158,11,0.15));
  color: var(--ai-accent-amber, #f59e0b);
}

.ai-tool-icon--success {
  background: var(--ai-accent-green-dim, rgba(74,222,128,0.12));
  color: var(--ai-accent-green, #4ade80);
}

.ai-tool-icon--error {
  background: var(--ai-accent-red-dim, rgba(248,113,113,0.12));
  color: var(--ai-accent-red, #f87171);
}

.ai-tool-icon__glyph {
  font-size: 12px;
  line-height: 1;
}

.ai-tool-icon__spinner {
  display: block;
  width: 10px;
  height: 10px;
  border: 1.5px solid var(--ai-accent-amber-dim, rgba(245,158,11,0.3));
  border-top-color: var(--ai-accent-amber, #f59e0b);
  border-radius: 50%;
  animation: ai-spin 0.7s linear infinite;
}

@keyframes ai-spin {
  to { transform: rotate(360deg); }
}

/* ── Error display ── */
.ai-tool-result__error {
  display: flex;
  flex-direction: column;
  gap: var(--ai-space-1, 4px);
  padding: var(--ai-space-3, 12px);
  background: var(--ai-accent-red-dim, rgba(248,113,113,0.08));
  border: 1px solid rgba(248, 113, 113, 0.2);
  border-radius: var(--ai-radius-sm, 6px);
}

.ai-tool-result__error-label {
  font-size: var(--ai-text-xs, 11px);
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--ai-accent-red, #f87171);
}

.ai-tool-result__error-message {
  font-family: var(--ai-font-mono, monospace);
  font-size: var(--ai-text-sm, 13px);
  color: var(--ai-accent-red, #f87171);
  opacity: 0.85;
}

@media (prefers-reduced-motion: reduce) {
  .ai-tool-icon__spinner {
    animation: none;
    opacity: 0.5;
  }
}
`;
