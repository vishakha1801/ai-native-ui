import React, { useCallback, useRef, useState } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

export type FeedbackValue = "positive" | "negative" | null;

export interface MessageActionsProps {
  /** Called when user copies the message content */
  onCopy?: () => void | Promise<void>;
  /** Message text to copy. If omitted, onCopy must handle clipboard logic. */
  copyText?: string;
  /** Called when user clicks regenerate */
  onRegenerate?: () => void;
  /** Called when user submits feedback */
  onFeedback?: (value: FeedbackValue) => void;
  /** Currently selected feedback value (controlled) */
  feedback?: FeedbackValue;
  /** Show the regenerate action */
  showRegenerate?: boolean;
  /** Show the feedback actions */
  showFeedback?: boolean;
  /** Show the copy action */
  showCopy?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * MessageActions provides the standard set of actions on an AI response:
 * copy, regenerate, and thumbs up/down feedback. Each action is optional.
 * Copy integrates with the clipboard API with visual confirmation.
 */
export function MessageActions({
  onCopy,
  copyText,
  onRegenerate,
  onFeedback,
  feedback: controlledFeedback,
  showRegenerate = true,
  showFeedback = true,
  showCopy = true,
  className,
  style,
}: MessageActionsProps) {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle");
  const [internalFeedback, setInternalFeedback] = useState<FeedbackValue>(null);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const feedback = controlledFeedback !== undefined ? controlledFeedback : internalFeedback;

  const handleCopy = useCallback(async () => {
    try {
      if (copyText !== undefined) {
        await navigator.clipboard.writeText(copyText);
      }
      await onCopy?.();
      setCopyState("copied");
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
      copyTimerRef.current = setTimeout(() => setCopyState("idle"), 1800);
    } catch {
      setCopyState("error");
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
      copyTimerRef.current = setTimeout(() => setCopyState("idle"), 2000);
    }
  }, [copyText, onCopy]);

  const handleFeedback = useCallback(
    (value: FeedbackValue) => {
      const next = feedback === value ? null : value;
      setInternalFeedback(next);
      onFeedback?.(next);
    },
    [feedback, onFeedback]
  );

  return (
    <>
      <div
        className={["ai-message-actions", className ?? ""].filter(Boolean).join(" ")}
        style={style}
        role="toolbar"
        aria-label="Message actions"
      >
        {showCopy && (
          <ActionButton
            icon={copyState === "copied" ? CheckIcon : CopyIcon}
            label={copyState === "copied" ? "Copied!" : copyState === "error" ? "Failed" : "Copy"}
            onClick={handleCopy}
            active={copyState === "copied"}
            className={copyState === "error" ? "ai-action--error" : ""}
          />
        )}

        {showRegenerate && onRegenerate && (
          <ActionButton
            icon={RegenerateIcon}
            label="Regenerate"
            onClick={onRegenerate}
          />
        )}

        {showFeedback && onFeedback && (
          <>
            <div className="ai-message-actions__divider" aria-hidden="true" />
            <ActionButton
              icon={ThumbUpIcon}
              label="Good response"
              onClick={() => handleFeedback("positive")}
              active={feedback === "positive"}
            />
            <ActionButton
              icon={ThumbDownIcon}
              label="Poor response"
              onClick={() => handleFeedback("negative")}
              active={feedback === "negative"}
            />
          </>
        )}
      </div>
      <style>{STYLES}</style>
    </>
  );
}

MessageActions.displayName = "MessageActions";

// ── Sub-components ────────────────────────────────────────────────────────────

interface ActionButtonProps {
  icon: React.FC;
  label: string;
  onClick: () => void;
  active?: boolean;
  className?: string;
}

function ActionButton({ icon: Icon, label, onClick, active, className }: ActionButtonProps) {
  return (
    <button
      type="button"
      className={[
        "ai-action-btn",
        active ? "ai-action-btn--active" : "",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={onClick}
      aria-label={label}
      title={label}
      aria-pressed={active}
    >
      <Icon />
    </button>
  );
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function CopyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <rect x="4" y="4" width="8" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.25" />
      <path d="M4 3.5C4 2.67 4.67 2 5.5 2H10L12 4v6.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M2.5 7L5.5 10L11.5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function RegenerateIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M11.5 7a4.5 4.5 0 1 1-1.32-3.18" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
      <path d="M10.5 2.5V5.5H7.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ThumbUpIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M5 6.5L6.5 2C7.33 2 8 2.67 8 3.5V5.5H11.5L10.5 10.5H5V6.5Z" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" />
      <path d="M5 6.5H3V10.5H5" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" />
    </svg>
  );
}

function ThumbDownIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M9 7.5L7.5 12C6.67 12 6 11.33 6 10.5V8.5H2.5L3.5 3.5H9V7.5Z" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" />
      <path d="M9 7.5H11V3.5H9" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" />
    </svg>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const STYLES = `
.ai-message-actions {
  display: flex;
  align-items: center;
  gap: 2px;
}

.ai-message-actions__divider {
  width: 1px;
  height: 16px;
  background: var(--ai-border-default, rgba(255,255,255,0.10));
  margin: 0 4px;
}

.ai-action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: none;
  border: none;
  border-radius: var(--ai-radius-sm, 6px);
  color: var(--ai-text-tertiary, #525c6b);
  cursor: pointer;
  padding: 0;
  transition: color var(--ai-duration-fast, 120ms), background var(--ai-duration-fast, 120ms);
}

.ai-action-btn:hover {
  color: var(--ai-text-secondary, #8b95a8);
  background: var(--ai-border-subtle, rgba(255,255,255,0.06));
}

.ai-action-btn:focus-visible {
  outline: 2px solid var(--ai-accent-amber, #f59e0b);
  outline-offset: 2px;
}

.ai-action-btn--active {
  color: var(--ai-accent-amber, #f59e0b) !important;
  background: var(--ai-accent-amber-dim, rgba(245,158,11,0.12)) !important;
}

.ai-action--error {
  color: var(--ai-accent-red, #f87171) !important;
}
`;
