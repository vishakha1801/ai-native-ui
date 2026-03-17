import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { MessageActions } from "./MessageActions";

describe("MessageActions", () => {
  it("renders with role=toolbar", () => {
    render(<MessageActions />);
    expect(screen.getByRole("toolbar")).toBeInTheDocument();
  });

  it("has accessible name 'Message actions'", () => {
    render(<MessageActions />);
    expect(screen.getByRole("toolbar", { name: "Message actions" })).toBeInTheDocument();
  });

  it("always has ai-message-actions class", () => {
    const { container } = render(<MessageActions />);
    expect(container.firstChild).toHaveClass("ai-message-actions");
  });

  it("applies custom className", () => {
    const { container } = render(<MessageActions className="my-actions" />);
    expect(container.firstChild).toHaveClass("my-actions");
  });

  it("shows copy button by default", () => {
    render(<MessageActions />);
    expect(screen.getByRole("button", { name: "Copy" })).toBeInTheDocument();
  });

  it("hides copy button when showCopy=false", () => {
    render(<MessageActions showCopy={false} />);
    expect(screen.queryByRole("button", { name: "Copy" })).not.toBeInTheDocument();
  });

  it("calls onCopy when copy button clicked", async () => {
    const onCopy = vi.fn();
    render(<MessageActions onCopy={onCopy} />);
    await userEvent.click(screen.getByRole("button", { name: "Copy" }));
    expect(onCopy).toHaveBeenCalledTimes(1);
  });

  it("shows regenerate button when onRegenerate provided", () => {
    const onRegenerate = vi.fn();
    render(<MessageActions onRegenerate={onRegenerate} />);
    expect(screen.getByRole("button", { name: "Regenerate" })).toBeInTheDocument();
  });

  it("hides regenerate button without onRegenerate", () => {
    render(<MessageActions />);
    expect(screen.queryByRole("button", { name: "Regenerate" })).not.toBeInTheDocument();
  });

  it("hides regenerate button when showRegenerate=false", () => {
    const onRegenerate = vi.fn();
    render(<MessageActions onRegenerate={onRegenerate} showRegenerate={false} />);
    expect(screen.queryByRole("button", { name: "Regenerate" })).not.toBeInTheDocument();
  });

  it("calls onRegenerate when regenerate clicked", async () => {
    const onRegenerate = vi.fn();
    render(<MessageActions onRegenerate={onRegenerate} />);
    await userEvent.click(screen.getByRole("button", { name: "Regenerate" }));
    expect(onRegenerate).toHaveBeenCalledTimes(1);
  });

  it("shows feedback buttons when onFeedback provided", () => {
    const onFeedback = vi.fn();
    render(<MessageActions onFeedback={onFeedback} />);
    expect(screen.getByRole("button", { name: "Good response" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Poor response" })).toBeInTheDocument();
  });

  it("hides feedback buttons without onFeedback", () => {
    render(<MessageActions />);
    expect(screen.queryByRole("button", { name: "Good response" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Poor response" })).not.toBeInTheDocument();
  });

  it("hides feedback buttons when showFeedback=false", () => {
    const onFeedback = vi.fn();
    render(<MessageActions onFeedback={onFeedback} showFeedback={false} />);
    expect(screen.queryByRole("button", { name: "Good response" })).not.toBeInTheDocument();
  });

  it("calls onFeedback with 'positive' when thumbs up clicked", async () => {
    const onFeedback = vi.fn();
    render(<MessageActions onFeedback={onFeedback} />);
    await userEvent.click(screen.getByRole("button", { name: "Good response" }));
    expect(onFeedback).toHaveBeenCalledWith("positive");
  });

  it("calls onFeedback with 'negative' when thumbs down clicked", async () => {
    const onFeedback = vi.fn();
    render(<MessageActions onFeedback={onFeedback} />);
    await userEvent.click(screen.getByRole("button", { name: "Poor response" }));
    expect(onFeedback).toHaveBeenCalledWith("negative");
  });

  it("toggles feedback off when same button clicked twice", async () => {
    const onFeedback = vi.fn();
    render(<MessageActions onFeedback={onFeedback} />);
    await userEvent.click(screen.getByRole("button", { name: "Good response" }));
    await userEvent.click(screen.getByRole("button", { name: "Good response" }));
    expect(onFeedback).toHaveBeenLastCalledWith(null);
  });

  it("respects controlled feedback prop", () => {
    const onFeedback = vi.fn();
    render(<MessageActions onFeedback={onFeedback} feedback="positive" />);
    expect(
      screen.getByRole("button", { name: "Good response" })
    ).toHaveAttribute("aria-pressed", "true");
  });
});
