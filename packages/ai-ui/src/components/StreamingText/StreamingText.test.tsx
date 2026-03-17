import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { StreamingText } from "./StreamingText";

describe("StreamingText", () => {
  it("renders the provided text", () => {
    render(<StreamingText text="Hello world" />);
    expect(screen.getByText(/Hello world/)).toBeInTheDocument();
  });

  it("shows cursor while streaming", () => {
    const { container } = render(
      <StreamingText text="Hello" status="streaming" cursor={true} />
    );
    expect(container.querySelector(".ai-streaming-cursor")).toBeInTheDocument();
  });

  it("hides cursor when complete", () => {
    const { container } = render(
      <StreamingText text="Hello" status="complete" cursor={true} />
    );
    expect(container.querySelector(".ai-streaming-cursor")).not.toBeInTheDocument();
  });

  it("hides cursor when cursor=false", () => {
    const { container } = render(
      <StreamingText text="Hello" status="streaming" cursor={false} />
    );
    expect(container.querySelector(".ai-streaming-cursor")).not.toBeInTheDocument();
  });

  it("sets aria-live=polite while streaming", () => {
    const { container } = render(
      <StreamingText text="Hello" status="streaming" />
    );
    expect(container.firstChild).toHaveAttribute("aria-live", "polite");
  });

  it("removes aria-live when complete", () => {
    const { container } = render(
      <StreamingText text="Hello" status="complete" />
    );
    expect(container.firstChild).not.toHaveAttribute("aria-live");
  });

  it("sets data-status attribute", () => {
    const { container } = render(
      <StreamingText text="Hello" status="error" />
    );
    expect(container.firstChild).toHaveAttribute("data-status", "error");
  });

  it("applies custom aria-label", () => {
    render(
      <StreamingText text="Hello" aria-label="AI response" />
    );
    expect(screen.getByLabelText("AI response")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(
      <StreamingText text="Hello" className="my-class" />
    );
    expect(container.firstChild).toHaveClass("my-class");
  });

  it("always has ai-streaming-text class", () => {
    const { container } = render(<StreamingText text="Hello" />);
    expect(container.firstChild).toHaveClass("ai-streaming-text");
  });

  it("renders empty text without crashing", () => {
    const { container } = render(<StreamingText text="" status="streaming" />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
