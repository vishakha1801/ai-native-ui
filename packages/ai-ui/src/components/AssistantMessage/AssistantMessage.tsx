import React from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface AssistantMessageProps {
  /** Content to display — typically a StreamingText component or string */
  children: React.ReactNode;
  /** Avatar element or URL. If string, renders as img. */
  avatar?: React.ReactNode | string;
  /** Model or assistant name label */
  model?: string;
  /** Whether the message is currently being generated */
  isStreaming?: boolean;
  /** Whether this is the latest message in the conversation */
  isLatest?: boolean;
  /** Actions row shown below the message (e.g. MessageActions) */
  actions?: React.ReactNode;
  /** Citations row shown below content */
  citations?: React.ReactNode;
  /** Tool calls shown within the message */
  toolCalls?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export interface UserMessageProps {
  children: React.ReactNode;
  /** Avatar element or URL. */
  avatar?: React.ReactNode | string;
  /** User display name */
  name?: string;
  className?: string;
  style?: React.CSSProperties;
}

// ── AssistantMessage ──────────────────────────────────────────────────────────

/**
 * AssistantMessage is the primary container for AI-generated responses.
 * It composes streaming content, tool calls, citations, and actions
 * into a single coherent layout.
 */
export function AssistantMessage({
  children,
  avatar,
  model,
  isStreaming = false,
  isLatest = false,
  actions,
  citations,
  toolCalls,
  className,
  style,
}: AssistantMessageProps) {
  return (
    <>
      <div
        className={[
          "ai-assistant-msg",
          isStreaming ? "ai-assistant-msg--streaming" : "",
          isLatest ? "ai-assistant-msg--latest" : "",
          className ?? "",
        ]
          .filter(Boolean)
          .join(" ")}
        style={style}
        aria-live={isStreaming ? "polite" : undefined}
        aria-atomic={isStreaming ? "false" : undefined}
      >
        {/* Avatar column */}
        <div className="ai-assistant-msg__avatar" aria-hidden="true">
          <AvatarSlot avatar={avatar} fallback="AI" />
        </div>

        {/* Content column */}
        <div className="ai-assistant-msg__body">
          {model && (
            <div className="ai-assistant-msg__header">
              <span className="ai-assistant-msg__model">{model}</span>
              {isStreaming && (
                <span className="ai-assistant-msg__streaming-badge">
                  <span className="ai-streaming-dot ai-animated" aria-hidden="true" />
                  <span className="ai-sr-only">Generating</span>
                </span>
              )}
            </div>
          )}

          <div className="ai-assistant-msg__content">
            {children}
          </div>

          {toolCalls && (
            <div className="ai-assistant-msg__tools">
              {toolCalls}
            </div>
          )}

          {citations && (
            <div className="ai-assistant-msg__citations">
              {citations}
            </div>
          )}

          {!isStreaming && actions && (
            <div className="ai-assistant-msg__actions">
              {actions}
            </div>
          )}
        </div>
      </div>
      <style>{STYLES}</style>
    </>
  );
}

AssistantMessage.displayName = "AssistantMessage";

// ── UserMessage ───────────────────────────────────────────────────────────────

/**
 * UserMessage renders a human turn in the conversation.
 * Right-aligned with distinct styling from assistant messages.
 */
export function UserMessage({
  children,
  avatar,
  name,
  className,
  style,
}: UserMessageProps) {
  return (
    <>
      <div
        className={["ai-user-msg", className ?? ""].filter(Boolean).join(" ")}
        style={style}
      >
        <div className="ai-user-msg__bubble">
          {name && <span className="ai-sr-only">{name}</span>}
          <div className="ai-user-msg__content">{children}</div>
        </div>
        <div className="ai-user-msg__avatar" aria-hidden="true">
          <AvatarSlot avatar={avatar} fallback="U" variant="user" />
        </div>
      </div>
      <style>{STYLES}</style>
    </>
  );
}

UserMessage.displayName = "UserMessage";

// ── AvatarSlot ────────────────────────────────────────────────────────────────

interface AvatarSlotProps {
  avatar?: React.ReactNode | string;
  fallback: string;
  variant?: "assistant" | "user";
}

function AvatarSlot({ avatar, fallback, variant = "assistant" }: AvatarSlotProps) {
  if (React.isValidElement(avatar)) return <>{avatar}</>;
  if (typeof avatar === "string") {
    return (
      <img
        src={avatar}
        alt={fallback}
        className="ai-avatar ai-avatar--img"
        width={28}
        height={28}
      />
    );
  }
  return (
    <span className={`ai-avatar ai-avatar--${variant}`} aria-hidden="true">
      {fallback}
    </span>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const STYLES = `
/* ── AssistantMessage ── */
.ai-assistant-msg {
  display: flex;
  gap: var(--ai-space-3, 12px);
  padding: var(--ai-space-4, 16px) 0;
}

.ai-assistant-msg__avatar {
  flex-shrink: 0;
  padding-top: 2px;
}

.ai-assistant-msg__body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--ai-space-3, 12px);
}

.ai-assistant-msg__header {
  display: flex;
  align-items: center;
  gap: var(--ai-space-2, 8px);
}

.ai-assistant-msg__model {
  font-family: var(--ai-font-sans, sans-serif);
  font-size: var(--ai-text-sm, 13px);
  font-weight: 600;
  color: var(--ai-text-secondary, #8b95a8);
  letter-spacing: 0.01em;
}

.ai-assistant-msg__streaming-badge {
  display: inline-flex;
  align-items: center;
}

.ai-streaming-dot {
  display: block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--ai-accent-amber, #f59e0b);
  animation: ai-stream-pulse 1.4s ease-in-out infinite;
}

@keyframes ai-stream-pulse {
  0%, 100% { opacity: 0.4; transform: scale(0.9); }
  50% { opacity: 1; transform: scale(1.1); }
}

.ai-assistant-msg__content {
  font-family: var(--ai-font-sans, sans-serif);
  font-size: var(--ai-text-base, 15px);
  line-height: var(--ai-leading-relaxed, 1.75);
  color: var(--ai-text-primary, #f0f2f5);
}

.ai-assistant-msg__tools {
  display: flex;
  flex-direction: column;
  gap: var(--ai-space-2, 8px);
}

.ai-assistant-msg__citations {
  padding-top: var(--ai-space-1, 4px);
}

.ai-assistant-msg__actions {
  opacity: 0;
  transform: translateY(2px);
  transition: opacity var(--ai-duration-normal, 200ms), transform var(--ai-duration-normal, 200ms);
}

.ai-assistant-msg:hover .ai-assistant-msg__actions,
.ai-assistant-msg--latest .ai-assistant-msg__actions {
  opacity: 1;
  transform: translateY(0);
}

/* ── UserMessage ── */
.ai-user-msg {
  display: flex;
  justify-content: flex-end;
  gap: var(--ai-space-3, 12px);
  padding: var(--ai-space-3, 12px) 0;
  align-items: flex-start;
}

.ai-user-msg__bubble {
  max-width: 72%;
  background: var(--ai-bg-elevated, #1a1e26);
  border: 1px solid var(--ai-border-default, rgba(255,255,255,0.10));
  border-radius: var(--ai-radius-lg, 14px);
  border-bottom-right-radius: var(--ai-radius-sm, 6px);
  padding: var(--ai-space-3, 12px) var(--ai-space-4, 16px);
}

.ai-user-msg__content {
  font-family: var(--ai-font-sans, sans-serif);
  font-size: var(--ai-text-base, 15px);
  line-height: var(--ai-leading-normal, 1.6);
  color: var(--ai-text-primary, #f0f2f5);
  white-space: pre-wrap;
  word-break: break-word;
}

.ai-user-msg__avatar {
  flex-shrink: 0;
  padding-top: 2px;
}

/* ── Shared Avatar ── */
.ai-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: var(--ai-radius-sm, 6px);
  font-family: var(--ai-font-sans, sans-serif);
  font-size: var(--ai-text-xs, 11px);
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  flex-shrink: 0;
  overflow: hidden;
}

.ai-avatar--assistant {
  background: var(--ai-accent-amber-dim, rgba(245,158,11,0.15));
  color: var(--ai-accent-amber, #f59e0b);
  border: 1px solid rgba(245,158,11,0.2);
}

.ai-avatar--user {
  background: var(--ai-bg-overlay, #1f2430);
  color: var(--ai-text-secondary, #8b95a8);
  border: 1px solid var(--ai-border-default, rgba(255,255,255,0.10));
}

.ai-avatar--img {
  object-fit: cover;
}

@media (prefers-reduced-motion: reduce) {
  .ai-streaming-dot {
    animation: none;
    opacity: 0.8;
  }
}
`;
