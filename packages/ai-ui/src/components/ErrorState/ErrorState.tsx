import React from "react";

export type ErrorStateVariant = "inline" | "block" | "banner";

export interface ErrorStateProps {
  /** Short error title */
  title?: string;
  /** Detailed error description */
  message?: string;
  /** Raw error object — message extracted automatically if message prop absent */
  error?: Error | unknown;
  /** Visual treatment */
  variant?: ErrorStateVariant;
  /** Action button label */
  actionLabel?: string;
  /** Action callback (retry, dismiss, etc.) */
  onAction?: () => void;
  /** Secondary action label */
  secondaryLabel?: string;
  onSecondaryAction?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * ErrorState communicates a failed AI operation with appropriate context
 * and recovery affordances. Supports inline (within a message), block
 * (standalone card), and banner variants.
 */
export function ErrorState({
  title = "Something went wrong",
  message,
  error,
  variant = "block",
  actionLabel,
  onAction,
  secondaryLabel,
  onSecondaryAction,
  className,
  style,
}: ErrorStateProps) {
  const resolvedMessage =
    message ??
    (error instanceof Error
      ? error.message
      : typeof error === "string"
      ? error
      : undefined);

  return (
    <>
      <div
        className={[
          "ai-error",
          `ai-error--${variant}`,
          className ?? "",
        ]
          .filter(Boolean)
          .join(" ")}
        style={style}
        role="alert"
        aria-live="assertive"
      >
        <div className="ai-error__icon" aria-hidden="true">
          <ErrorIcon />
        </div>
        <div className="ai-error__body">
          <p className="ai-error__title">{title}</p>
          {resolvedMessage && (
            <p className="ai-error__message">{resolvedMessage}</p>
          )}
          {(onAction || onSecondaryAction) && (
            <div className="ai-error__actions">
              {onAction && actionLabel && (
                <button
                  type="button"
                  className="ai-error__action ai-error__action--primary"
                  onClick={onAction}
                >
                  {actionLabel}
                </button>
              )}
              {onSecondaryAction && secondaryLabel && (
                <button
                  type="button"
                  className="ai-error__action ai-error__action--secondary"
                  onClick={onSecondaryAction}
                >
                  {secondaryLabel}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      <style>{STYLES}</style>
    </>
  );
}

ErrorState.displayName = "ErrorState";

function ErrorIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.25" />
      <path d="M8 4.5V8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="8" cy="11" r="0.75" fill="currentColor" />
    </svg>
  );
}

const STYLES = `
.ai-error {
  display: flex;
  gap: var(--ai-space-3, 12px);
  align-items: flex-start;
  color: var(--ai-accent-red, #f87171);
  font-family: var(--ai-font-sans, sans-serif);
}

.ai-error--block {
  padding: var(--ai-space-4, 16px);
  background: var(--ai-accent-red-dim, rgba(248,113,113,0.08));
  border: 1px solid rgba(248,113,113,0.2);
  border-radius: var(--ai-radius-md, 10px);
}

.ai-error--banner {
  padding: var(--ai-space-3, 12px) var(--ai-space-4, 16px);
  background: var(--ai-accent-red-dim, rgba(248,113,113,0.08));
  border-top: 1px solid rgba(248,113,113,0.2);
  border-bottom: 1px solid rgba(248,113,113,0.2);
}

.ai-error--inline {
  padding: var(--ai-space-2, 8px) var(--ai-space-3, 12px);
  background: var(--ai-accent-red-dim, rgba(248,113,113,0.08));
  border: 1px solid rgba(248,113,113,0.15);
  border-radius: var(--ai-radius-sm, 6px);
}

.ai-error__icon {
  flex-shrink: 0;
  margin-top: 1px;
}

.ai-error__body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--ai-space-1, 4px);
}

.ai-error__title {
  margin: 0;
  font-size: var(--ai-text-sm, 13px);
  font-weight: 600;
  color: var(--ai-accent-red, #f87171);
  line-height: var(--ai-leading-tight, 1.35);
}

.ai-error__message {
  margin: 0;
  font-size: var(--ai-text-sm, 13px);
  color: rgba(248,113,113,0.75);
  line-height: var(--ai-leading-normal, 1.6);
}

.ai-error__actions {
  display: flex;
  gap: var(--ai-space-2, 8px);
  margin-top: var(--ai-space-2, 8px);
  flex-wrap: wrap;
}

.ai-error__action {
  font-family: var(--ai-font-sans, sans-serif);
  font-size: var(--ai-text-sm, 13px);
  font-weight: 500;
  padding: 5px 12px;
  border-radius: var(--ai-radius-sm, 6px);
  border: none;
  cursor: pointer;
  transition: background var(--ai-duration-fast, 120ms), color var(--ai-duration-fast, 120ms);
}

.ai-error__action--primary {
  background: rgba(248,113,113,0.2);
  color: var(--ai-accent-red, #f87171);
}

.ai-error__action--primary:hover {
  background: rgba(248,113,113,0.3);
}

.ai-error__action--secondary {
  background: transparent;
  color: rgba(248,113,113,0.6);
}

.ai-error__action--secondary:hover {
  background: rgba(248,113,113,0.08);
  color: var(--ai-accent-red, #f87171);
}

.ai-error__action:focus-visible {
  outline: 2px solid var(--ai-accent-red, #f87171);
  outline-offset: 2px;
}
`;
