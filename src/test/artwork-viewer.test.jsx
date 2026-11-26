import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vitest";
import ArtworkViewer from "../components/ArtworkViewer.jsx";

const artwork = { id: "test", title: "A painting", image: "/small.jpg", fullImage: "/large.jpg" };

test("fullscreen viewer supports bounded zoom, reset, and keyboard controls", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<ArtworkViewer artwork={artwork} onClose={onClose} />);
    const dialog = screen.getByRole("dialog");
    expect(dialog.open).toBe(true);
    expect(document.body.style.overflow).toBe("hidden");
    expect(screen.getByRole("button", { name: "Zoom out" }).disabled).toBe(true);
    await user.click(screen.getByRole("button", { name: "Zoom in" }));
    expect(screen.getByLabelText("Zoom level").textContent).toBe("125%");
    for (let i = 0; i < 12; i++) fireEvent.keyDown(dialog, { key: "+" });
    expect(screen.getByLabelText("Zoom level").textContent).toBe("500%");
    expect(screen.getByRole("button", { name: "Zoom in" }).disabled).toBe(true);
    await user.click(screen.getByRole("button", { name: "Fit image" }));
    expect(screen.getByLabelText("Zoom level").textContent).toBe("100%");
    fireEvent(dialog, new Event("cancel", { bubbles: false, cancelable: true }));
    expect(onClose).toHaveBeenCalledOnce();
});

test("viewer restores focus and scrolling and falls back when the large image fails", () => {
    const trigger = document.createElement("button");
    document.body.append(trigger);
    trigger.focus();
    const { unmount } = render(<ArtworkViewer artwork={artwork} onClose={() => {}} />);
    const image = screen.getByRole("img");
    expect(image.getAttribute("src")).toBe("/large.jpg");
    fireEvent.error(image);
    expect(image.getAttribute("src")).toBe("/small.jpg");
    unmount();
    expect(document.activeElement).toBe(trigger);
    expect(document.body.style.overflow).toBe("");
    trigger.remove();
});
