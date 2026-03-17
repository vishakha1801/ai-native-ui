import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { ErrorState } from "./ErrorState";

describe("ErrorState", () => {
  it("renders with role=alert", () => {
    render(<ErrorState />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("has aria-live=assertive", () => {
    const { container } = render(<ErrorState />);
    expect(container.firstChild).toHaveAttribute("aria-live", "assertive");
  });

  it("renders default title", () => {
    render(<ErrorState />);
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });

  it("renders custom title", () => {
    render(<ErrorState title="Request failed" />);
    expect(screen.getByText("Request failed")).toBeInTheDocument();
  });

  it("renders message prop", () => {
    render(<ErrorState message="Connection timed out" />);
    expect(screen.getByText("Connection timed out")).toBeInTheDocument();
  });

  it("extracts message from Error object", () => {
    const err = new Error("Network error");
    render(<ErrorState error={err} />);
    expect(screen.getByText("Network error")).toBeInTheDocument();
  });

  it("extracts message from string error", () => {
    render(<ErrorState error="Something bad happened" />);
    expect(screen.getByText("Something bad happened")).toBeInTheDocument();
  });

  it("message prop takes precedence over error object", () => {
    const err = new Error("Network error");
    render(<ErrorState message="Custom message" error={err} />);
    expect(screen.getByText("Custom message")).toBeInTheDocument();
    expect(screen.queryByText("Network error")).not.toBeInTheDocument();
  });

  it("renders action button when actionLabel and onAction provided", () => {
    const onAction = vi.fn();
    render(<ErrorState actionLabel="Retry" onAction={onAction} />);
    expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument();
  });

  it("calls onAction when action button clicked", async () => {
    const onAction = vi.fn();
    render(<ErrorState actionLabel="Retry" onAction={onAction} />);
    await userEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it("renders secondary action button", () => {
    const onSecondaryAction = vi.fn();
    render(
      <ErrorState
        secondaryLabel="Dismiss"
        onSecondaryAction={onSecondaryAction}
      />
    );
    expect(screen.getByRole("button", { name: "Dismiss" })).toBeInTheDocument();
  });

  it("calls onSecondaryAction when secondary button clicked", async () => {
    const onSecondaryAction = vi.fn();
    render(
      <ErrorState
        secondaryLabel="Dismiss"
        onSecondaryAction={onSecondaryAction}
      />
    );
    await userEvent.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(onSecondaryAction).toHaveBeenCalledTimes(1);
  });

  it("does not render action button without onAction", () => {
    render(<ErrorState actionLabel="Retry" />);
    expect(screen.queryByRole("button", { name: "Retry" })).not.toBeInTheDocument();
  });

  it("applies block variant class by default", () => {
    const { container } = render(<ErrorState />);
    expect(container.firstChild).toHaveClass("ai-error--block");
  });

  it("applies inline variant class", () => {
    const { container } = render(<ErrorState variant="inline" />);
    expect(container.firstChild).toHaveClass("ai-error--inline");
  });

  it("applies banner variant class", () => {
    const { container } = render(<ErrorState variant="banner" />);
    expect(container.firstChild).toHaveClass("ai-error--banner");
  });

  it("always has ai-error class", () => {
    const { container } = render(<ErrorState />);
    expect(container.firstChild).toHaveClass("ai-error");
  });

  it("applies custom className", () => {
    const { container } = render(<ErrorState className="my-error" />);
    expect(container.firstChild).toHaveClass("my-error");
  });
});
