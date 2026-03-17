import React from "react";

export interface SourceCitationCardProps {
  /** Source title */
  title: string;
  /** URL to the source */
  url?: string;
  /** Brief excerpt or description from the source */
  snippet?: string;
  /** Domain name — inferred from url if not provided */
  domain?: string;
  /** Relevance score 0–1, shown as a confidence indicator */
  relevance?: number;
  /** Index number shown as a superscript reference */
  index?: number;
  /** Compact card for inline/list use. Default: false */
  compact?: boolean;
  /** Called when the card is clicked */
  onClick?: (event: React.MouseEvent<HTMLAnchorElement | HTMLDivElement>) => void;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * SourceCitationCard displays a grounding reference from an AI response.
 * Designed for AI-native use: source title, domain, snippet, and optional
 * relevance score. Handles truncation, link affordance, and keyboard focus.
 */
export function SourceCitationCard({
  title,
  url,
  snippet,
  domain,
  relevance,
  index,
  compact = false,
  onClick,
  className,
  style,
}: SourceCitationCardProps) {
  const resolvedDomain = domain ?? (url ? extractDomain(url) : undefined);
  const favicon = resolvedDomain
    ? `https://www.google.com/s2/favicons?domain=${resolvedDomain}&sz=16`
    : undefined;

  const inner = (
    <>
      <div className="ai-citation__header">
        <div className="ai-citation__meta">
          {favicon && (
            <img
              src={favicon}
              alt=""
              className="ai-citation__favicon"
              width={14}
              height={14}
              aria-hidden="true"
            />
          )}
          {resolvedDomain && (
            <span className="ai-citation__domain">{resolvedDomain}</span>
          )}
          {relevance !== undefined && (
            <RelevanceBadge value={relevance} />
          )}
        </div>
        {index !== undefined && (
          <span className="ai-citation__index" aria-label={`Source ${index}`}>
            {index}
          </span>
        )}
      </div>

      <p className="ai-citation__title">{title}</p>

      {!compact && snippet && (
        <p className="ai-citation__snippet">{snippet}</p>
      )}

      {url && (
        <span className="ai-citation__link-arrow" aria-hidden="true">
          ↗
        </span>
      )}
    </>
  );

  const sharedClass = [
    "ai-citation",
    compact ? "ai-citation--compact" : "",
    url ? "ai-citation--linked" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  if (url) {
    return (
      <>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className={sharedClass}
          style={style}
          onClick={onClick as React.MouseEventHandler<HTMLAnchorElement>}
          aria-label={`${title} — ${resolvedDomain ?? "source"}`}
        >
          {inner}
        </a>
        <style>{STYLES}</style>
      </>
    );
  }

  return (
    <>
      <div
        className={sharedClass}
        style={style}
        onClick={onClick as React.MouseEventHandler<HTMLDivElement>}
        role={onClick ? "button" : undefined}
        tabIndex={onClick ? 0 : undefined}
      >
        {inner}
      </div>
      <style>{STYLES}</style>
    </>
  );
}

SourceCitationCard.displayName = "SourceCitationCard";

// ── RelevanceBadge ────────────────────────────────────────────────────────────

interface RelevanceBadgeProps {
  value: number; // 0–1
}

function RelevanceBadge({ value }: RelevanceBadgeProps) {
  const pct = Math.round(value * 100);
  const tier = value >= 0.85 ? "high" : value >= 0.6 ? "mid" : "low";
  return (
    <span
      className={`ai-citation__relevance ai-citation__relevance--${tier}`}
      aria-label={`${pct}% relevance`}
      title={`${pct}% relevance`}
    >
      {pct}%
    </span>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

// ── Styles ────────────────────────────────────────────────────────────────────

const STYLES = `
.ai-citation {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--ai-space-2, 8px);
  padding: var(--ai-space-3, 12px) var(--ai-space-4, 16px);
  background: var(--ai-bg-surface, #13161b);
  border: 1px solid var(--ai-border-default, rgba(255,255,255,0.10));
  border-radius: var(--ai-radius-md, 10px);
  text-decoration: none;
  color: inherit;
  transition: border-color var(--ai-duration-fast, 120ms), background var(--ai-duration-fast, 120ms), box-shadow var(--ai-duration-fast, 120ms);
  overflow: hidden;
}

.ai-citation--linked {
  cursor: pointer;
}

.ai-citation--linked:hover {
  border-color: var(--ai-border-strong, rgba(255,255,255,0.18));
  background: var(--ai-bg-elevated, #1a1e26);
  box-shadow: var(--ai-shadow-sm, 0 1px 3px rgba(0,0,0,0.3));
}

.ai-citation--linked:focus-visible {
  outline: 2px solid var(--ai-accent-amber, #f59e0b);
  outline-offset: 2px;
}

.ai-citation--compact {
  padding: var(--ai-space-2, 8px) var(--ai-space-3, 12px);
  gap: var(--ai-space-1, 4px);
}

.ai-citation__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--ai-space-2, 8px);
}

.ai-citation__meta {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.ai-citation__favicon {
  flex-shrink: 0;
  border-radius: 2px;
  opacity: 0.85;
}

.ai-citation__domain {
  font-family: var(--ai-font-sans, sans-serif);
  font-size: var(--ai-text-xs, 11px);
  color: var(--ai-text-tertiary, #525c6b);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: 0.02em;
}

.ai-citation__index {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  background: var(--ai-accent-amber-dim, rgba(245,158,11,0.15));
  color: var(--ai-accent-amber, #f59e0b);
  border-radius: var(--ai-radius-sm, 6px);
  font-family: var(--ai-font-mono, monospace);
  font-size: var(--ai-text-xs, 11px);
  font-weight: 600;
}

.ai-citation__title {
  margin: 0;
  font-family: var(--ai-font-sans, sans-serif);
  font-size: var(--ai-text-sm, 13px);
  font-weight: 500;
  color: var(--ai-text-primary, #f0f2f5);
  line-height: var(--ai-leading-tight, 1.35);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.ai-citation__snippet {
  margin: 0;
  font-family: var(--ai-font-sans, sans-serif);
  font-size: var(--ai-text-sm, 13px);
  color: var(--ai-text-secondary, #8b95a8);
  line-height: var(--ai-leading-normal, 1.6);
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.ai-citation__link-arrow {
  position: absolute;
  top: var(--ai-space-3, 12px);
  right: var(--ai-space-3, 12px);
  font-size: var(--ai-text-sm, 13px);
  color: var(--ai-text-tertiary, #525c6b);
  transition: color var(--ai-duration-fast, 120ms), transform var(--ai-duration-fast, 120ms);
}

.ai-citation--linked:hover .ai-citation__link-arrow {
  color: var(--ai-accent-amber, #f59e0b);
  transform: translate(1px, -1px);
}

.ai-citation__relevance {
  font-family: var(--ai-font-mono, monospace);
  font-size: var(--ai-text-xs, 11px);
  font-weight: 600;
  padding: 1px 6px;
  border-radius: var(--ai-radius-full, 9999px);
}

.ai-citation__relevance--high {
  color: var(--ai-accent-green, #4ade80);
  background: var(--ai-accent-green-dim, rgba(74,222,128,0.12));
}

.ai-citation__relevance--mid {
  color: var(--ai-accent-amber, #f59e0b);
  background: var(--ai-accent-amber-dim, rgba(245,158,11,0.15));
}

.ai-citation__relevance--low {
  color: var(--ai-text-secondary, #8b95a8);
  background: var(--ai-border-subtle, rgba(255,255,255,0.06));
}
`;
