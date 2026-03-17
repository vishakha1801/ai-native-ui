import React, { useState } from "react";
import { HomePage } from "./pages/HomePage";
import { DocsPage } from "./pages/DocsPage";

type Page = "home" | "docs";

export default function App() {
  const [page, setPage] = useState<Page>("home");

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header page={page} onNav={setPage} />
      <main style={{ flex: 1 }}>
        {page === "home" ? (
          <HomePage onGetStarted={() => setPage("docs")} />
        ) : (
          <DocsPage />
        )}
      </main>
      <Footer />
    </div>
  );
}

function Header({ page, onNav }: { page: Page; onNav: (p: Page) => void }) {
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        borderBottom: "1px solid var(--ai-border-subtle)",
        background: "rgba(13,15,18,0.85)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "0 24px",
          height: 56,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 24,
        }}
      >
        <button
          onClick={() => onNav("home")}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <LogoMark />
          <span
            style={{
              fontFamily: "var(--ai-font-mono)",
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "var(--ai-text-primary)",
              letterSpacing: "-0.01em",
            }}
          >
            ai-native-ui
          </span>
        </button>

        <nav style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {(["home", "docs"] as Page[]).map((p) => (
            <button
              key={p}
              onClick={() => onNav(p)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "6px 12px",
                borderRadius: "var(--ai-radius-sm)",
                fontFamily: "var(--ai-font-sans)",
                fontSize: "var(--ai-text-sm)",
                fontWeight: 500,
                color: page === p ? "var(--ai-text-primary)" : "var(--ai-text-secondary)",
                backgroundColor: page === p ? "var(--ai-bg-elevated)" : "transparent",
                transition: "all var(--ai-duration-fast)",
                textTransform: "capitalize",
              }}
            >
              {p}
            </button>
          ))}
          <a
            href="https://github.com/vishakha1801/ai-native-ui"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 12px",
              borderRadius: "var(--ai-radius-sm)",
              color: "var(--ai-text-secondary)",
              fontFamily: "var(--ai-font-sans)",
              fontSize: "var(--ai-text-sm)",
              fontWeight: 500,
              textDecoration: "none",
              transition: "color var(--ai-duration-fast)",
              marginLeft: 4,
            }}
          >
            <GitHubIcon />
            GitHub
          </a>
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid var(--ai-border-subtle)",
        padding: "32px 24px",
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <LogoMark size={20} />
          <span
            style={{
              fontFamily: "var(--ai-font-mono)",
              fontSize: "var(--ai-text-sm)",
              color: "var(--ai-text-tertiary)",
            }}
          >
            ai-native-ui v0.1.0
          </span>
        </div>
        <p
          style={{
            margin: 0,
            fontFamily: "var(--ai-font-sans)",
            fontSize: "var(--ai-text-sm)",
            color: "var(--ai-text-tertiary)",
          }}
        >
          made with ♥ in pittsburgh · MIT
        </p>
      </div>
    </footer>
  );
}

function LogoMark({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect
        x="2" y="2" width="20" height="20" rx="5"
        fill="var(--ai-accent-amber-dim)"
        stroke="var(--ai-accent-amber)"
        strokeWidth="1"
        strokeOpacity="0.6"
      />
      <path
        d="M7 12h2.5L12 7l2.5 5H17"
        stroke="var(--ai-accent-amber)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="7" cy="12" r="1.25" fill="var(--ai-accent-amber)" />
      <circle cx="17" cy="12" r="1.25" fill="var(--ai-accent-amber)" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
  );
}
