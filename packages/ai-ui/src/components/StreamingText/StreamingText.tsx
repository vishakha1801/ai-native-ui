import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";

export type StreamingTextStatus = "streaming" | "complete" | "error";

export interface StreamingTextProps {
  /** The text content to display. As this string grows, new characters animate in. */
  text: string;
  /** Current streaming status. Controls cursor and announcement behavior. */
  status?: StreamingTextStatus;
  /** Show a blinking cursor while streaming. Default: true */
  cursor?: boolean;
  /** Animate new characters fading in. Respects prefers-reduced-motion. Default: true */
  animate?: boolean;
  /** Accessible label for screen readers announcing streaming state */
  "aria-label"?: string;
  /** Additional class name */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
}

/**
 * StreamingText renders progressively-received text with a blinking cursor
 * and stable layout behavior. It handles reduced motion, live region
 * announcements for accessibility, and clean completion transitions.
 */
export const StreamingText = React.memo(function StreamingText({
  text,
  status = "streaming",
  cursor = true,
  animate = true,
  "aria-label": ariaLabel,
  className,
  style,
}: StreamingTextProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const shouldAnimate = animate && !prefersReducedMotion;

  const isStreaming = status === "streaming";
  const showCursor = cursor && isStreaming;

  return (
    <span
      className={[
        "ai-streaming-text",
        shouldAnimate ? "ai-streaming-text--animated" : "",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={style}
      aria-live={isStreaming ? "polite" : undefined}
      aria-label={ariaLabel}
      data-status={status}
    >
      {text}
      {showCursor && (
        <span
          className="ai-streaming-cursor ai-animated"
          aria-hidden="true"
        />
      )}
      <style>{STYLES}</style>
    </span>
  );
});

StreamingText.displayName = "StreamingText";

// ── Hook ──────────────────────────────────────────────────────────────────────

function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = (e: MediaQueryListEvent) =>
      setPrefersReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return prefersReducedMotion;
}

// ── useStreamingText hook ─────────────────────────────────────────────────────

export interface UseStreamingTextOptions {
  /** Simulate streaming by revealing `text` character by character */
  text: string;
  /** Characters per second. Default: 40 */
  speed?: number;
  /** Called when streaming completes */
  onComplete?: () => void;
}

export interface UseStreamingTextResult {
  displayedText: string;
  status: StreamingTextStatus;
  isComplete: boolean;
  reset: () => void;
}

/**
 * Utility hook that simulates streaming text reveal for demos and testing.
 * In production, pass real streamed text directly to <StreamingText>.
 */
export function useStreamingText({
  text,
  speed = 40,
  onComplete,
}: UseStreamingTextOptions): UseStreamingTextResult {
  const [displayedText, setDisplayedText] = useState("");
  const [status, setStatus] = useState<StreamingTextStatus>("streaming");
  const indexRef = useRef(0);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const reset = useCallback(() => {
    indexRef.current = 0;
    setDisplayedText("");
    setStatus("streaming");
  }, []);

  useEffect(() => {
    indexRef.current = 0;
    setDisplayedText("");
    setStatus("streaming");
  }, [text]);

  useEffect(() => {
    if (status !== "streaming") return;
    if (indexRef.current >= text.length) {
      setStatus("complete");
      onCompleteRef.current?.();
      return;
    }

    const intervalMs = 1000 / speed;
    // Batch reveal for performance at fast speeds
    const chunkSize = speed > 60 ? 2 : 1;

    const id = setInterval(() => {
      indexRef.current = Math.min(indexRef.current + chunkSize, text.length);
      setDisplayedText(text.slice(0, indexRef.current));

      if (indexRef.current >= text.length) {
        clearInterval(id);
        setStatus("complete");
        onCompleteRef.current?.();
      }
    }, intervalMs);

    return () => clearInterval(id);
  }, [text, speed, status]);

  return useMemo(
    () => ({ displayedText, status, isComplete: status === "complete", reset }),
    [displayedText, status, reset]
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const STYLES = `
.ai-streaming-text {
  display: inline;
  font-family: inherit;
  white-space: pre-wrap;
  word-break: break-word;
}

.ai-streaming-cursor {
  display: inline-block;
  width: 2px;
  height: 1em;
  background: var(--ai-accent-amber, #f59e0b);
  border-radius: 1px;
  margin-left: 1px;
  vertical-align: text-bottom;
  animation: ai-cursor-blink 1s step-end infinite;
}

@keyframes ai-cursor-blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

@media (prefers-reduced-motion: reduce) {
  .ai-streaming-cursor {
    animation: none;
    opacity: 1;
  }
}
`;
