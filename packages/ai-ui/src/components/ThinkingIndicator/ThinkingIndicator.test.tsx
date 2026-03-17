import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ThinkingIndicator } from "./ThinkingIndicator";

describe("ThinkingIndicator", () => {
  it("renders with role=status", () => {
    render(<ThinkingIndicator />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("uses label as accessible name", () => {
    render(<ThinkingIndicator label="Analyzing…" />);
    expect(screen.getByRole("status", { name: "Analyzing…" })).toBeInTheDocument();
  });

  it("uses aria-label prop over label", () => {
    render(<ThinkingIndicator label="Thinking…" aria-label="AI is working" />);
    expect(screen.getByRole("status", { name: "AI is working" })).toBeInTheDocument();
  });

  it("defaults to dots variant", () => {
    const { container } = render(<ThinkingIndicator />);
    expect(container.querySelector(".ai-thinking--dots")).toBeInTheDocument();
  });

  it("renders dots variant", () => {
    const { container } = render(<ThinkingIndicator variant="dots" />);
    expect(container.querySelector(".ai-thinking__dots")).toBeInTheDocument();
    expect(container.querySelectorAll(".ai-thinking__dot")).toHaveLength(3);
  });

  it("renders pulse variant", () => {
    const { container } = render(<ThinkingIndicator variant="pulse" />);
    expect(container.querySelector(".ai-thinking__pulse")).toBeInTheDocument();
    expect(container.querySelector(".ai-thinking__pulse-ring")).toBeInTheDocument();
    expect(container.querySelector(".ai-thinking__pulse-dot")).toBeInTheDocument();
  });

  it("renders bar variant", () => {
    const { container } = render(<ThinkingIndicator variant="bar" />);
    expect(container.querySelector(".ai-thinking__bars")).toBeInTheDocument();
    expect(container.querySelectorAll(".ai-thinking__bar")).toHaveLength(4);
  });

  it("shows label text for dots variant", () => {
    render(<ThinkingIndicator variant="dots" label="Thinking…" />);
    expect(screen.getAllByText("Thinking…").length).toBeGreaterThan(0);
  });

  it("applies custom className", () => {
    const { container } = render(<ThinkingIndicator className="my-indicator" />);
    expect(container.firstChild).toHaveClass("my-indicator");
  });

  it("always has ai-thinking class", () => {
    const { container } = render(<ThinkingIndicator />);
    expect(container.firstChild).toHaveClass("ai-thinking");
  });
});
