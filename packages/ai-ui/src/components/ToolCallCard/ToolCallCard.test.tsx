import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import userEvent from "@testing-library/user-event";
import { ToolCallCard, ToolResultCard } from "./ToolCallCard";

describe("ToolCallCard", () => {
  it("renders with role=region", () => {
    render(<ToolCallCard toolName="search" />);
    expect(screen.getByRole("region")).toBeInTheDocument();
  });

  it("has accessible name with tool name", () => {
    render(<ToolCallCard toolName="search" />);
    expect(screen.getByRole("region", { name: "Tool call: search" })).toBeInTheDocument();
  });

  it("renders the tool name", () => {
    render(<ToolCallCard toolName="web_search" />);
    expect(screen.getByText("web_search")).toBeInTheDocument();
  });

  it("renders description when provided", () => {
    render(<ToolCallCard toolName="search" description="Searching the web" />);
    expect(screen.getByText("Searching the web")).toBeInTheDocument();
  });

  it("shows pending status badge by default", () => {
    render(<ToolCallCard toolName="search" />);
    expect(screen.getByRole("status")).toHaveTextContent("Pending");
  });

  it("shows running status badge", () => {
    render(<ToolCallCard toolName="search" status="running" />);
    expect(screen.getByRole("status")).toHaveTextContent("Running");
  });

  it("shows success status badge", () => {
    render(<ToolCallCard toolName="search" status="success" />);
    expect(screen.getByRole("status")).toHaveTextContent("Done");
  });

  it("shows error status badge", () => {
    render(<ToolCallCard toolName="search" status="error" />);
    expect(screen.getByRole("status")).toHaveTextContent("Error");
  });

  it("applies status class", () => {
    const { container } = render(<ToolCallCard toolName="search" status="running" />);
    expect(container.firstChild).toHaveClass("ai-tool-call--running");
  });

  it("always has ai-tool-call class", () => {
    const { container } = render(<ToolCallCard toolName="search" />);
    expect(container.firstChild).toHaveClass("ai-tool-call");
  });

  it("applies custom className", () => {
    const { container } = render(<ToolCallCard toolName="search" className="my-card" />);
    expect(container.firstChild).toHaveClass("my-card");
  });

  it("does not show expand button without args", () => {
    render(<ToolCallCard toolName="search" />);
    expect(screen.queryByRole("button", { name: /arguments/i })).not.toBeInTheDocument();
  });

  it("shows expand button when args provided", () => {
    render(<ToolCallCard toolName="search" args={{ query: "hello" }} />);
    expect(screen.getByRole("button", { name: "Expand arguments" })).toBeInTheDocument();
  });

  it("expands args on button click", async () => {
    render(<ToolCallCard toolName="search" args={{ query: "hello" }} />);
    await userEvent.click(screen.getByRole("button", { name: "Expand arguments" }));
    expect(screen.getByText(/hello/)).toBeInTheDocument();
  });

  it("collapses args on second click", async () => {
    render(<ToolCallCard toolName="search" args={{ query: "hello" }} />);
    const btn = screen.getByRole("button", { name: "Expand arguments" });
    await userEvent.click(btn);
    await userEvent.click(screen.getByRole("button", { name: "Collapse arguments" }));
    expect(screen.queryByText(/"query"/)).not.toBeInTheDocument();
  });

  it("renders expanded by default when defaultExpanded=true", () => {
    render(<ToolCallCard toolName="search" args={{ query: "hello" }} defaultExpanded />);
    expect(screen.getByText(/"query"/)).toBeInTheDocument();
  });
});

describe("ToolResultCard", () => {
  it("renders with role=region", () => {
    render(<ToolResultCard toolName="search" status="success" />);
    expect(screen.getByRole("region")).toBeInTheDocument();
  });

  it("has accessible name with tool name", () => {
    render(<ToolResultCard toolName="search" status="success" />);
    expect(screen.getByRole("region", { name: "Tool result: search" })).toBeInTheDocument();
  });

  it("renders the tool name", () => {
    render(<ToolResultCard toolName="web_search" status="success" />);
    expect(screen.getByText("web_search")).toBeInTheDocument();
  });

  it("always has ai-tool-result class", () => {
    const { container } = render(<ToolResultCard toolName="search" status="success" />);
    expect(container.firstChild).toHaveClass("ai-tool-result");
  });

  it("applies success class", () => {
    const { container } = render(<ToolResultCard toolName="search" status="success" />);
    expect(container.firstChild).toHaveClass("ai-tool-result--success");
  });

  it("applies error class", () => {
    const { container } = render(<ToolResultCard toolName="search" status="error" />);
    expect(container.firstChild).toHaveClass("ai-tool-result--error");
  });

  it("applies custom className", () => {
    const { container } = render(
      <ToolResultCard toolName="search" status="success" className="my-result" />
    );
    expect(container.firstChild).toHaveClass("my-result");
  });

  it("shows result by default (defaultExpanded=true)", () => {
    render(
      <ToolResultCard toolName="search" status="success" result={{ url: "https://example.com" }} />
    );
    expect(screen.getByText(/url/)).toBeInTheDocument();
  });

  it("collapses result on toggle click", async () => {
    render(
      <ToolResultCard toolName="search" status="success" result={{ url: "https://example.com" }} />
    );
    await userEvent.click(screen.getByRole("button", { name: "Collapse result" }));
    expect(screen.queryByText(/url/)).not.toBeInTheDocument();
  });

  it("shows error message when status=error", () => {
    render(
      <ToolResultCard toolName="search" status="error" error="Rate limit exceeded" />
    );
    expect(screen.getByText("Rate limit exceeded")).toBeInTheDocument();
  });

  it("shows duration when provided", () => {
    render(<ToolResultCard toolName="search" status="success" durationMs={250} />);
    expect(screen.getByText("250ms")).toBeInTheDocument();
  });

  it("formats duration in seconds for large values", () => {
    render(<ToolResultCard toolName="search" status="success" durationMs={2500} />);
    expect(screen.getByText("2.5s")).toBeInTheDocument();
  });

  it("renders string result directly", () => {
    render(
      <ToolResultCard toolName="search" status="success" result="plain text result" />
    );
    expect(screen.getByText("plain text result")).toBeInTheDocument();
  });
});
