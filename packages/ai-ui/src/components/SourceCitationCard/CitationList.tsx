import React from "react";
import { SourceCitationCard, SourceCitationCardProps } from "./SourceCitationCard";

// ── CitationList ──────────────────────────────────────────────────────────────

export interface CitationListProps {
  citations: SourceCitationCardProps[];
  /** Layout orientation. Default: "vertical" */
  layout?: "vertical" | "horizontal" | "grid";
  /** Use compact card style. Default: false */
  compact?: boolean;
  /** Section heading text. If provided, renders an accessible heading. */
  heading?: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * CitationList renders a collection of source citations with consistent
 * spacing and optional grid/horizontal scroll layout.
 */
export function CitationList({
  citations,
  layout = "vertical",
  compact = false,
  heading,
  className,
  style,
}: CitationListProps) {
  return (
    <>
      <div
        className={[
          "ai-citation-list",
          `ai-citation-list--${layout}`,
          className ?? "",
        ]
          .filter(Boolean)
          .join(" ")}
        style={style}
      >
        {heading && (
          <p className="ai-citation-list__heading" role="heading" aria-level={3}>
            {heading}
          </p>
        )}
        <div className="ai-citation-list__items">
          {citations.map((citation, i) => (
            <SourceCitationCard
              key={citation.url ?? i}
              {...citation}
              index={citation.index ?? i + 1}
              compact={compact}
            />
          ))}
        </div>
      </div>
      <style>{STYLES}</style>
    </>
  );
}

CitationList.displayName = "CitationList";

// ── InlineCitation ────────────────────────────────────────────────────────────

export interface InlineCitationProps {
  /** The reference number to display */
  index: number;
  /** URL to the source */
  url?: string;
  /** Tooltip title shown on hover */
  title?: string;
  onClick?: (event: React.MouseEvent) => void;
  className?: string;
}

/**
 * InlineCitation renders a superscript citation number inside prose text.
 * Example: "According to recent research[1] the model showed..."
 */
export function InlineCitation({
  index,
  url,
  title,
  onClick,
  className,
}: InlineCitationProps) {
  const Tag = url ? "a" : "button";

  return (
    <>
      <Tag
        href={url}
        target={url ? "_blank" : undefined}
        rel={url ? "noopener noreferrer" : undefined}
        className={["ai-inline-citation", className ?? ""].filter(Boolean).join(" ")}
        onClick={onClick}
        aria-label={title ? `Source ${index}: ${title}` : `Source ${index}`}
        title={title}
        type={!url ? "button" : undefined}
      >
        {index}
      </Tag>
      <style>{INLINE_STYLES}</style>
    </>
  );
}

InlineCitation.displayName = "InlineCitation";

// ── Styles ────────────────────────────────────────────────────────────────────

const STYLES = `
.ai-citation-list {
  display: flex;
  flex-direction: column;
  gap: var(--ai-space-3, 12px);
}

.ai-citation-list__heading {
  margin: 0 0 var(--ai-space-2, 8px) 0;
  font-family: var(--ai-font-sans, sans-serif);
  font-size: var(--ai-text-xs, 11px);
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ai-text-tertiary, #525c6b);
}

.ai-citation-list__items {
  display: flex;
  flex-direction: column;
  gap: var(--ai-space-2, 8px);
}

.ai-citation-list--horizontal .ai-citation-list__items {
  flex-direction: row;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  padding-bottom: var(--ai-space-2, 8px);
  gap: var(--ai-space-3, 12px);
}

.ai-citation-list--horizontal .ai-citation {
  min-width: 220px;
  max-width: 280px;
  flex-shrink: 0;
}

.ai-citation-list--grid .ai-citation-list__items {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: var(--ai-space-2, 8px);
}
`;

const INLINE_STYLES = `
.ai-inline-citation {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 16px;
  height: 16px;
  padding: 0 3px;
  margin: 0 1px;
  vertical-align: super;
  font-family: var(--ai-font-mono, monospace);
  font-size: 10px;
  font-weight: 700;
  line-height: 1;
  color: var(--ai-accent-amber, #f59e0b);
  background: var(--ai-accent-amber-dim, rgba(245,158,11,0.15));
  border: none;
  border-radius: 3px;
  cursor: pointer;
  text-decoration: none;
  transition: background var(--ai-duration-fast, 120ms), color var(--ai-duration-fast, 120ms);
}

.ai-inline-citation:hover {
  background: var(--ai-accent-amber, #f59e0b);
  color: var(--ai-text-inverse, #0d0f12);
}

.ai-inline-citation:focus-visible {
  outline: 2px solid var(--ai-accent-amber, #f59e0b);
  outline-offset: 2px;
}
`;
