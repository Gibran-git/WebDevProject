import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, test, vi } from "vitest";
import { MemoryRouter, useLocation, useNavigate } from "react-router";
import App from "../App.jsx";
import { artworks } from "../data/artworks.js";
import { fetchArtworks, fetchArtworkById } from "../api/met.js";

vi.mock("../api/met.js", async (importOriginal) => ({
    ...await importOriginal(),
    fetchArtworks: vi.fn(),
    fetchArtworkById: vi.fn(),
}));
const artwork = artworks.find((item) => item.id === "met-436535");
const remote = { ...artwork, id: "met-999999", title: "Remote artwork" };

function HistoryControls() {
    const location = useLocation();
    const navigate = useNavigate();
    return <>
        <output data-testid="path">{location.pathname}</output>
        <button onClick={() => navigate(-1)}>Browser back</button>
        <button onClick={() => navigate(1)}>Browser forward</button>
        <button onClick={() => navigate("/met-999999")}>Other artwork</button>
    </>;
}
function open(path = "/") {
    return render(<MemoryRouter initialEntries={[path]}><App /><HistoryControls /></MemoryRouter>);
}
function expectPath(path) {
    expect(screen.getByTestId("path").textContent).toBe(path);
}
beforeEach(() => {
    vi.resetAllMocks();
    fetchArtworks.mockResolvedValue({ artworks: [artwork], nextCursor: null });
    fetchArtworkById.mockResolvedValue(remote);
});

test("collection links, save actions, history and collection controls", async () => {
    const user = userEvent.setup();
    open();
    await user.click(await screen.findByRole("button", { name: `Save ${artwork.title}` }));
    expectPath("/");
    const selects = screen.getAllByRole("combobox");
    await user.selectOptions(selects[2], "title-desc");
    const link = screen.getByRole("link", { name: /Explore artwork/ });
    expect(link.getAttribute("href")).toBe(`/${artwork.id}`);
    await user.click(link);
    expectPath(`/${artwork.id}`);
    expect(screen.getByRole("heading", { name: artwork.title }).tagName).toBe("H1");
    await user.click(screen.getByRole("button", { name: "Browser back" }));
    expectPath("/");
    expect(screen.getAllByRole("combobox")[2].value).toBe("title-desc");
    await user.click(screen.getByRole("button", { name: "Browser forward" }));
    expectPath(`/${artwork.id}`);
    await user.click(screen.getByRole("button", { name: /Back to collection/ }));
    expectPath("/");
    expect(JSON.parse(localStorage.getItem("savedArtworks"))[0].id).toBe(artwork.id);
});

test("direct artwork loads independently and search exits detail", async () => {
    fetchArtworks.mockReturnValue(new Promise(() => {}));
    const user = userEvent.setup();
    open("/met-999999");
    const heading = await screen.findByRole("heading", { name: remote.title });
    expect(document.activeElement).toBe(heading);
    expect(document.title).toBe("Remote artwork | Exhibito");
    expect(fetchArtworkById.mock.calls[0][0]).toBe(remote.id);
    await user.type(screen.getByRole("searchbox"), "Monet");
    await user.click(screen.getByRole("button", { name: "Search" }));
    expectPath("/");
    expect(screen.queryByRole("heading", { name: remote.title })).toBeNull();
});

test.each(["/garbage", "/met-wrong", "/unknown/path", "/boards/missing"])("invalid route %s", async (path) => {
    open(path);
    expect(await screen.findByRole("heading", { name: /not found/i })).toBeTruthy();
    expect(fetchArtworkById).not.toHaveBeenCalled();
});

test("missing artwork is distinct from transient errors and retry", async () => {
    fetchArtworkById.mockResolvedValueOnce(null);
    const first = open("/met-999999");
    expect(await screen.findByRole("heading", { name: "Artwork unavailable" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Try again" })).toBeNull();
    first.unmount();
    fetchArtworkById.mockRejectedValueOnce(new Error("network"));
    open("/met-999999");
    await userEvent.click(await screen.findByRole("button", { name: "Try again" }));
    expect(await screen.findByRole("heading", { name: remote.title })).toBeTruthy();
});

test("offline detail uses its own bundled image", async () => {
    fetchArtworks.mockResolvedValue({ artworks: [], nextCursor: null });
    fetchArtworkById.mockRejectedValue(new Error("timeout"));
    open(`/${artwork.id}`);
    await screen.findByRole("heading", { name: artwork.title });
    expect(screen.getByRole("img", { name: artwork.imageAlt }).getAttribute("src")).toBe(`/images/${artwork.id}.webp`);
});

test("collection failure does not force a live detail offline", async () => {
    fetchArtworks.mockRejectedValue(new Error("offline"));
    fetchArtworkById.mockResolvedValue(artwork);
    open(`/${artwork.id}`);
    await screen.findByRole("heading", { name: artwork.title });
    expect(screen.getByRole("img", { name: artwork.imageAlt }).getAttribute("src")).toBe(artwork.image);
});

test("blocked remote image falls back to the downloaded copy, then the placeholder", async () => {
    fetchArtworkById.mockResolvedValueOnce(artwork);
    const first = open(`/${artwork.id}`);
    await screen.findByRole("heading", { name: artwork.title });
    fireEvent.error(screen.getByRole("img", { name: artwork.imageAlt }));
    const image = screen.getByRole("img", { name: artwork.imageAlt });
    expect(image.getAttribute("src")).toBe(`/images/${artwork.id}.webp`);
    fireEvent.error(image);
    expect(screen.getByText("Image unavailable")).toBeTruthy();
    first.unmount();
    open("/met-999999");
    await screen.findByRole("heading", { name: remote.title });
    fireEvent.error(screen.getByRole("img", { name: remote.imageAlt }));
    expect(screen.getByText("Image unavailable")).toBeTruthy();
});

test("late responses cannot replace the next artwork", async () => {
    let resolveFirst;
    fetchArtworkById.mockImplementationOnce(() => new Promise((resolve) => { resolveFirst = resolve; }));
    open("/met-123456");
    const signal = fetchArtworkById.mock.calls[0][1].signal;
    await userEvent.click(screen.getByRole("button", { name: "Other artwork" }));
    await screen.findByRole("heading", { name: remote.title });
    expect(signal.aborted).toBe(true);
    await act(async () => resolveFirst(artwork));
    expect(screen.getByRole("heading", { name: remote.title })).toBeTruthy();
});

test("bundled board links preserve the artwork return destination", async () => {
    fetchArtworkById.mockResolvedValue(artwork);
    open("/boards/laura-colour");
    expect(screen.getByRole("heading", { name: "Colour studies" })).toBeTruthy();
    const link = screen.getAllByRole("link", { name: /Explore artwork/ })[0];
    await userEvent.click(link);
    await screen.findByRole("heading", { name: artwork.title });
    await userEvent.click(screen.getByRole("button", { name: /Back to board/ }));
    expectPath("/boards/laura-colour");
});

test("owned board and saved art resolve from localStorage", async () => {
    localStorage.setItem("myBoards", JSON.stringify([{ id: 123, owner: "You", title: "My board", artworks: [artwork] }]));
    localStorage.setItem("savedArtworks", JSON.stringify([artwork]));
    open("/boards/123");
    expect(screen.getByRole("heading", { name: "My board" })).toBeTruthy();
    await userEvent.click(screen.getByRole("button", { name: /Back to your account/ }));
    expectPath("/account");
    await userEvent.click(screen.getByRole("link", { name: /Explore artwork/ }));
    expectPath(`/${artwork.id}`);
    await userEvent.click(screen.getByRole("button", { name: /Back to your account/ }));
    expectPath("/account");
});

test("leaving the account clears a board draft", async () => {
    open("/account");
    await userEvent.click(screen.getByRole("button", { name: "Create a board" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Title" }), { target: { value: "Unsaved draft" } });
    await userEvent.click(screen.getByRole("link", { name: "Community boards" }));
    await userEvent.click(screen.getByRole("button", { name: "Browser back" }));
    await waitFor(() => expect(screen.queryByRole("textbox", { name: "Title" })).toBeNull());
});


test("editing a routed board saves and does not reopen after leaving", async () => {
    localStorage.setItem("myBoards", JSON.stringify([{ id: 123, owner: "You", title: "My board", artworks: [artwork] }]));
    open("/boards/123");
    await userEvent.click(screen.getByRole("button", { name: "options for this board" }));
    await userEvent.click(screen.getByRole("button", { name: "Edit" }));
    expectPath("/account");
    const input = screen.getByRole("textbox", { name: "Title" });
    fireEvent.change(input, { target: { value: "Updated board" } });
    await userEvent.click(screen.getByRole("button", { name: "Save changes" }));
    expect(JSON.parse(localStorage.getItem("myBoards"))[0].title).toBe("Updated board");
    await userEvent.click(screen.getByRole("link", { name: "Community boards" }));
    await userEvent.click(screen.getByRole("button", { name: "Browser back" }));
    expect(screen.queryByRole("textbox", { name: "Title" })).toBeNull();
});

test("deleting the open board returns to account", async () => {
    localStorage.setItem("myBoards", JSON.stringify([{ id: 123, owner: "You", title: "My board", artworks: [artwork] }]));
    const modal = vi.spyOn(HTMLDialogElement.prototype, "showModal").mockImplementation(function () { this.open = true; });
    open("/boards/123");
    await userEvent.click(screen.getByRole("button", { name: "options for this board" }));
    await userEvent.click(screen.getByRole("button", { name: "Delete" }));
    await userEvent.click(screen.getByRole("button", { name: "Delete" }));
    expectPath("/account");
    expect(JSON.parse(localStorage.getItem("myBoards"))).toEqual([]);
    modal.mockRestore();
});

test("detail requests enforce the timeout and recover using the bundled record", async () => {
    const timeoutController = new AbortController();
    const timeout = vi.spyOn(AbortSignal, "timeout").mockReturnValue(timeoutController.signal);
    fetchArtworks.mockReturnValue(new Promise(() => {}));
    fetchArtworkById.mockImplementation((id, { signal }) => new Promise((resolve, reject) => {
        signal.addEventListener("abort", () => reject(signal.reason));
    }));
    open(`/${artwork.id}`);
    expect(timeout).toHaveBeenCalledWith(12000);
    await act(async () => timeoutController.abort(new DOMException("Timed out", "TimeoutError")));
    expect(await screen.findByRole("heading", { name: artwork.title })).toBeTruthy();
    expect(screen.getByRole("img", { name: artwork.imageAlt }).getAttribute("src")).toBe(`/images/${artwork.id}.webp`);
    timeout.mockRestore();
});
