import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ContentModal } from "./ContentModal";
import type { ContentItem } from "@/types/content";

const mockItem: ContentItem = {
  id: 1,
  title: "Inception",
  year: 2010,
  genre: ["Sci-Fi", "Thriller"],
  rating: 8.8,
  thumbnail: "https://example.com/img.jpg",
  duration: 148,
  description: "A mind-bending thriller.",
  cast: ["Leonardo DiCaprio"],
};

describe("ContentModal", () => {
  it("renders nothing when item is null", () => {
    const { container } = render(
      <ContentModal item={null} onClose={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders title, year, rating and description when item is provided", () => {
    render(<ContentModal item={mockItem} onClose={vi.fn()} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Inception")).toBeInTheDocument();
    expect(screen.getByText(/2010/)).toBeInTheDocument();
    expect(screen.getByText(/8\.8\/10/)).toBeInTheDocument();
    expect(screen.getByText("A mind-bending thriller.")).toBeInTheDocument();
  });

  it("calls onClose when close button is clicked", () => {
    const onClose = vi.fn();
    render(<ContentModal item={mockItem} onClose={onClose} />);
    const closeButton = screen.getByRole("button", { name: /close modal/i });
    fireEvent.click(closeButton);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
