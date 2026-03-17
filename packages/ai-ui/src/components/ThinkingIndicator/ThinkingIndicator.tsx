import React, { useEffect, useState } from "react";

export type ThinkingVariant = "dots" | "pulse" | "bar";

export interface ThinkingIndicatorProps {
  /** Visual style variant. Default: "dots" */
  variant?: ThinkingVariant;
  /** Descriptive label shown next to the indicator */
  label?: string;
  /** Accessible description of what the assistant is doing */
  "aria-label"?: string;
  /** Size in px for the indicator elements. Default: 6 */
  size?: number;
  /** Additional class name */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
}

/**
 * ThinkingIndicator communicates that the AI is processing.
 * Uses ARIA live region and role="status" for accessibility.
 * Respects prefers-reduced-motion.
 */
export function ThinkingIndicator({
  variant = "dots",
  label = "Thinking…",
  "aria-label": ariaLabel,
  size = 5,
  className,
  style,
}: ThinkingIndicatorProps) {
  const [frame, setFrame] = useState(0);

  // Cycle through frames for the bar variant's label cycling
  useEffect(() => {
    const id = setInterval(() => setFrame((f) => (f + 1) % LABELS.length), 2000);
    return () => clearInterval(id);
  }, []);

  const accessibleLabel = ariaLabel ?? label ?? "Processing…";

  return (
    <span
      role="status"
      aria-label={accessibleLabel}
      className={[
        "ai-thinking",
        `ai-thinking--${variant}`,
        "ai-animated",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={style}
    >
      {/* Visually hidden live label */}
      <span className="ai-sr-only">{accessibleLabel}</span>

      {variant === "dots" && (
        <span className="ai-thinking__dots" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="ai-thinking__dot"
              style={{
                width: size,
                height: size,
                animationDelay: `${i * 160}ms`,
              }}
            />
          ))}
        </span>
      )}

      {variant === "pulse" && (
        <span className="ai-thinking__pulse" aria-hidden="true">
          <span
            className="ai-thinking__pulse-ring"
            style={{ width: size * 3, height: size * 3 }}
          />
          <span
            className="ai-thinking__pulse-dot"
            style={{ width: size, height: size }}
          />
        </span>
      )}

      {variant === "bar" && (
        <span className="ai-thinking__bars" aria-hidden="true">
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className="ai-thinking__bar"
              style={{
                width: Math.max(2, size * 0.6),
                animationDelay: `${i * 100}ms`,
              }}
            />
          ))}
        </span>
      )}

      {label && (
        <span className="ai-thinking__label" aria-hidden="true">
          {variant === "bar" ? LABELS[frame % LABELS.length] : label}
        </span>
      )}

      <style>{STYLES}</style>
    </span>
  );
}

ThinkingIndicator.displayName = "ThinkingIndicator";

const LABELS = ["Thinking…", "Analyzing…", "Reasoning…", "Processing…"];

// ── Styles ────────────────────────────────────────────────────────────────────

const STYLES = `
.ai-thinking {
  display: inline-flex;
  align-items: center;
  gap: var(--ai-space-2, 8px);
  color: var(--ai-text-secondary, #8b95a8);
}

/* ── Dots ── */
.ai-thinking__dots {
  display: flex;
  align-items: center;
  gap: 4px;
}

.ai-thinking__dot {
  display: block;
  border-radius: 50%;
  background: var(--ai-accent-amber, #f59e0b);
  opacity: 0.4;
  animation: ai-thinking-dot 1.2s ease-in-out infinite;
  flex-shrink: 0;
}

@keyframes ai-thinking-dot {
  0%, 100% { transform: scale(1); opacity: 0.4; }
  40% { transform: scale(1.3); opacity: 1; }
  60% { transform: scale(1.1); opacity: 0.8; }
}

/* ── Pulse ── */
.ai-thinking__pulse {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.ai-thinking__pulse-ring {
  position: absolute;
  border-radius: 50%;
  border: 1.5px solid var(--ai-accent-amber, #f59e0b);
  opacity: 0;
  animation: ai-thinking-pulse-ring 1.6s ease-out infinite;
}

.ai-thinking__pulse-dot {
  border-radius: 50%;
  background: var(--ai-accent-amber, #f59e0b);
  flex-shrink: 0;
}

@keyframes ai-thinking-pulse-ring {
  0% { transform: scale(0.6); opacity: 0.9; }
  100% { transform: scale(1.8); opacity: 0; }
}

/* ── Bar ── */
.ai-thinking__bars {
  display: flex;
  align-items: flex-end;
  gap: 2px;
  height: 16px;
}

.ai-thinking__bar {
  display: block;
  min-height: 4px;
  border-radius: 2px;
  background: var(--ai-accent-amber, #f59e0b);
  animation: ai-thinking-bar 0.9s ease-in-out infinite alternate;
}

@keyframes ai-thinking-bar {
  0% { height: 4px; opacity: 0.5; }
  100% { height: 14px; opacity: 1; }
}

/* ── Label ── */
.ai-thinking__label {
  font-family: var(--ai-font-sans, sans-serif);
  font-size: var(--ai-text-sm, 13px);
  font-weight: 450;
  letter-spacing: 0.01em;
  color: var(--ai-text-secondary, #8b95a8);
}

/* ── Reduced motion ── */
@media (prefers-reduced-motion: reduce) {
  .ai-thinking__dot,
  .ai-thinking__pulse-ring,
  .ai-thinking__bar {
    animation: none !important;
    opacity: 0.7;
  }
  .ai-thinking__dot { transform: scale(1); }
}
`;
