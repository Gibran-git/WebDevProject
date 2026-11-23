import { afterEach, beforeEach, expect, test, vi } from "vitest";

let fetchArtworkById;
beforeEach(async () => {
    vi.resetModules();
    ({ fetchArtworkById } = await import("../api/met.js"));
    vi.stubGlobal("fetch", vi.fn());
});
afterEach(() => vi.unstubAllGlobals());
const record = { objectID: 123, primaryImageSmall: "https://example.com/art.jpg", title: "Test artwork" };

test("validates IDs without issuing requests", async () => {
    for (const id of ["123", "met-x", "met-0", "met-9007199254740992"]) {
        expect(await fetchArtworkById(id)).toBeNull();
    }
    expect(fetch).not.toHaveBeenCalled();
});
test("fetches the numeric object endpoint, converts and caches", async () => {
    fetch.mockResolvedValue({ ok: true, json: async () => record });
    const controller = new AbortController();
    const artwork = await fetchArtworkById("met-123", { signal: controller.signal });
    expect(artwork.id).toBe("met-123");
    expect(fetch).toHaveBeenCalledWith("https://collectionapi.metmuseum.org/public/collection/v1/objects/123", { signal: controller.signal });
    expect(await fetchArtworkById("met-123")).toBe(artwork);
    expect(fetch).toHaveBeenCalledTimes(1);
});
test("missing records and image-less records are unavailable", async () => {
    fetch.mockResolvedValueOnce({ ok: false, status: 404 });
    expect(await fetchArtworkById("met-123")).toBeNull();
    fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ ...record, primaryImageSmall: "" }) });
    expect(await fetchArtworkById("met-123")).toBeNull();
    expect(await fetchArtworkById("met-123")).toBeNull();
    expect(fetch).toHaveBeenCalledTimes(2);
});
test("transient failures and cancellation are not cached", async () => {
    fetch.mockResolvedValueOnce({ ok: false, status: 403 });
    await expect(fetchArtworkById("met-123")).rejects.toMatchObject({ status: 403 });
    fetch.mockRejectedValueOnce(new DOMException("Aborted", "AbortError"));
    await expect(fetchArtworkById("met-123")).rejects.toMatchObject({ name: "AbortError" });
    fetch.mockResolvedValueOnce({ ok: true, json: async () => record });
    expect((await fetchArtworkById("met-123")).title).toBe(record.title);
    expect(fetch).toHaveBeenCalledTimes(3);
});
