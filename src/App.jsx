// AI-assisted foundation and integration - see AI-USAGE.md #1 and #2.

import { useEffect, useRef, useState } from "react";
import ArtworkGrid from "./components/ArtworkGrid.jsx";
import { Route, Routes, useLocation, useNavigate } from "react-router";
import { ArtworkRoute, BoardRoute, NotFound } from "./components/RoutePages.jsx";
import { artworks as localArtworks, OfflineImagesContext } from "./data/artworks.js";
import { fetchArtworks, eraFromYear, MET_MUSEUM_NAME } from "./api/met.js";
import CollectionControls from "./components/CollectionControls.jsx";
import SiteHeader from "./components/SiteHeader.jsx";
import CommunityBoards from "./components/CommunityBoards.jsx";
import AccountPage from "./components/AccountPage.jsx";
import {communityBoards, starterThreads } from "./data/communityBoards.js";
import {useLocalStorage} from "./hooks/useLocalStorage.js";

// search/filter/sort work on both met data and local fallback data

function yearFromDate(date) {
    // "1884–86, border added 1888–89" -> 1884. returns null when there's no 4-digit year
    const match = typeof date === "string" ? date.match(/\b(\d{4})\b/) : null;
    return match ? Number(match[1]) : null;
}

function withEra(artwork) {
    // make sure every artwork has a numeric year and an era, whatever its source
    const year = typeof artwork.year === "number" ? artwork.year : yearFromDate(artwork.date);
    return { ...artwork, year, era: artwork.era || eraFromYear(year ?? undefined) };
}

function normalize(text) {
    // lowercase and strip accents so "gerome" matches "Gérôme"
    return String(text ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function matchesQuery(artwork, query) {
    // normalize the query string into individual search terms
    const terms = normalize(query).split(/\s+/).filter(Boolean);
    if (terms.length === 0) return true;
    const haystack = normalize([
        artwork.title,
        artwork.artist?.name,
        artwork.artist?.nationality,
        artwork.movement,
        artwork.era,
        artwork.medium,
        artwork.date,
    ].join(" "));
    // every word has to appear somewhere
    return terms.every((term) => haystack.includes(term));
}

function filterArtworks(artworks, { era = "All", movement = "All" } = {}) {
    return artworks.filter((artwork) => (
        (era === "All" || artwork.era === era)
        && (movement === "All" || artwork.movement === movement)
    ));
}

const compareText = (a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }); // compare two strings ignoring case and accents

// undated works always go last, regardless of direction
function compareYear(a, b, direction) {
    // compare two artworks by year, taking into account the direction (1 for ascending, -1 for descending)
    if (a.year == null && b.year == null) return 0;
    if (a.year == null) return 1;
    if (b.year == null) return -1;
    return (a.year - b.year) * direction;
}

const COMPARATORS = {
    "title-asc": (a, b) => compareText(a.title, b.title),
    "title-desc": (a, b) => compareText(b.title, a.title),
    "artist-asc": (a, b) => compareText(a.artist.name, b.artist.name) || compareText(a.title, b.title),
    "date-asc": (a, b) => compareYear(a, b, 1),
    "date-desc": (a, b) => compareYear(a, b, -1),
};

function sortArtworks(artworks, sortKey) {
    // sort the artworks based on the selected sort key using the appropriate comparator
    const compare = COMPARATORS[sortKey];
    // "relevance" keeps the order the api returned. copy first so state is never mutated
    return compare ? [...artworks].sort(compare) : artworks;
}

const FETCH_TIMEOUT_MS = 12000; // allow the loader to inspect a later search page when early records lack usable images
// stop starting new detail batches after this long and show partial results (leaves room for in-flight requests)
const FETCH_BUDGET_MS = 8500;
const SKELETON_COUNT = 6;
const PAGE_SIZE = 24; // artworks per page; more than this in one go trips the met's rate limit

// keep the selected era/category if the new results still have it, otherwise go back to "All"
const keepIfPresent = (list, key) => (previous) => (
    list.some((artwork) => artwork[key] === previous) ? previous : "All"
);

// one page of the downloaded artworks. the cursor remembers we're offline (and why)
// so the next/previous pages keep paging the local copy instead of retrying the met
function localPage(query, limit, page, error) {
    const matches = localArtworks.filter((artwork) => matchesQuery(artwork, query));
    const start = page * limit;
    return {
        results: matches.slice(start, start + limit),
        error,
        nextCursor: start + limit < matches.length ? { offline: true, error } : null,
    };
}

// loadCollection fetches one page of artworks from the Met API
// with a timeout and fallback to local artworks.
// cursor comes from the previous page's nextCursor (null for the first page)
async function loadCollection(query, limit, signal, { cursor = null, page = 0 } = {}) {
    if (cursor?.offline) return localPage(query, limit, page, cursor.error);
    // create a timeout signal to limit how long we wait for the Met API response
    const timeout = AbortSignal.timeout(FETCH_TIMEOUT_MS);
    try {
        const { artworks: results, nextCursor } = await fetchArtworks({
            // pass the query, limit, cursor, time budget, and combined signal to fetchArtworks
            query, limit, cursor, timeBudgetMs: FETCH_BUDGET_MS, signal: AbortSignal.any([signal, timeout]),
        });
        return { results: results.map(withEra), error: null, nextCursor }; // successful fetch from Met API
    } catch (err) {
        if (signal.aborted) return null; // the request was aborted by the caller
        // fallback to local artworks if the Met API request fails
        const error = timeout.aborted ? "The request timed out." : err.message || "Failed to load artworks.";
        return localPage(query, limit, page, error);
    }
}

// isMetArtwork checks if an artwork ID follows the Met pattern (e.g., "met-12345") yay regex
const isMetArtwork = (artwork) => /^met-\d+$/.test(artwork?.id);

export default function App() {
    const [artworks, setArtworks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const usingFallback = !loading && error !== null;
    const location = useLocation();
    const navigate = useNavigate();
    // AI-assisted - see AI-USAGE.md #6
    //Then edited by Gibran to use useLocalStorage hook
    //AI-assisted - see AI-USAGE.md #11
    const [storedArtworks, setSavedArtworks] = useLocalStorage("savedArtworks", []);    
    const savedArtworks = storedArtworks.filter(isMetArtwork);
    const [threads, setThreads] = useLocalStorage("threads", [], (saved) => [
    ...saved,
    ...starterThreads.filter((starter) => !saved.some((thread) => thread.id === starter.id)),
]);
    const [storedBoards, setMyboards] = useLocalStorage("myBoards", []);
    const myBoards = storedBoards.map((board) => ({ ...board, artworks: (board.artworks ?? []).filter(isMetArtwork) }));
    
    // search / filter / sort state
    const [searchInput, setSearchInput] = useState(""); // what's typed in the box (controlled input)
    const [activeQuery, setActiveQuery] = useState(""); // what was last submitted
    const [requestId, setRequestId] = useState(0); // bumped to re-run the fetch (retry, re-submitting the same search)
    const [selectedEra, setSelectedEra] = useState("All");
    const [selectedMovement, setSelectedMovement] = useState("All");
    const [sortKey, setSortKey] = useState("relevance");

    // page is 0-based. cursors[n] is where page n starts (from page n-1's nextCursor),
    // so cursors.length > page + 1 means there's a next page
    const [page, setPage] = useState(0);
    const [cursors, setCursors] = useState([null]);
    const headingRef = useRef(null);
    const artworksHeadingRef = useRef(null);
    const savedIds = savedArtworks.map((artwork) => artwork.id);
    const publicBoards = [... communityBoards, ...myBoards.filter((board) => board.isPublic)]
    const movements = [...new Set(artworks.map((artwork) => artwork.movement))].sort();
    const eras = new Set(artworks.map((artwork) => artwork.era)); // CollectionControls keeps them in chronological order
    const visibleArtworks = sortArtworks(
        filterArtworks(artworks, {
            era: selectedEra,
            movement: selectedMovement,
        }),
        sortKey,
    );
    const filtersActive = selectedEra !== "All" || selectedMovement !== "All";
    const pageCursor = cursors[page];
    const hasNextPage = cursors.length > page + 1 && cursors[page + 1] !== null;
    useEffect(() => {
        // effect to load a page of artworks whenever the active query, request ID or page changes
        const controller = new AbortController();
        loadCollection(activeQuery, PAGE_SIZE, controller.signal, { cursor: pageCursor, page }) // fetch artworks from the Met API
            .then((response) => {
                if (controller.signal.aborted) return; // request was aborted, do not update state
                const { results, error, nextCursor } = response; // destructure the response from the Met API
                setArtworks(results);
                setSelectedEra(keepIfPresent(results, "era"));
                setSelectedMovement(keepIfPresent(results, "movement"));
                setError(error);
                // remember where the next page starts (null = this is the last page)
                setCursors((previous) => [...previous.slice(0, page + 1), nextCursor]);
                setLoading(false);
            });
        return () => controller.abort(); // cleanup function to abort the request if the component unmounts or dependencies change
    }, [activeQuery, requestId, page, pageCursor]);

    function runSearch(query) {
        // loading is set here instead of in the effect so the effect never sets state synchronously
        setActiveQuery(query);
        setRequestId((id) => id + 1);
        setPage(0);
        setCursors([null]);
        setLoading(true);
    }

    function goToPage(nextPage) {
        setPage(nextPage);
        setLoading(true);
        // bring the top of the results back into view (and move focus there for keyboard/screen reader users)
        artworksHeadingRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        artworksHeadingRef.current?.focus({ preventScroll: true });
    }

    // AI-assisted - see AI-USAGE.md #8
    // then edited by DJ for new loadCollection usage with limit parameter
    function searchArtworks(query, signal) {
        return loadCollection(query, 12, signal);
    }

    function handleLogoClick(){
        setSearchInput("");
        if(activeQuery) runSearch("");
    }

    function handleSearchSubmit() {
        const query = searchInput.trim();
        navigate("/");
        runSearch(query);
    }

    function handleClearSearch() {
        setSearchInput("");
        runSearch("");
    }

    function handleClearFilters() {
        setSelectedEra("All");
        setSelectedMovement("All");
    }

    /* AI-assisted - see AI-USAGE.md #5 */
    // then edited by DJ again for consistency with other handlers
    function handleToggleSave(artwork) {
        setSavedArtworks((previousArtworks) => (
            previousArtworks.some((item) => item?.id === artwork.id)
                ? previousArtworks.filter((item) => item?.id !== artwork.id)
                : [...previousArtworks, artwork]
        ));
    }

    function handleAddThread(artworkId, title, text){
        setThreads((previousThreads) => [
            ...previousThreads,
            { id: Date.now(), artworkId, author: "You", title, text, replies: [] },
        ]);
    }

    function handleAddReply(threadId, text){
        setThreads((previousThreads) => previousThreads.map((thread) => (
            thread.id === threadId
            ? { ...thread, replies: [...thread.replies, { id: Date.now(), author: "You", text}]}
            : thread
        )));
    }

    function handleEditThread(threadId, title, text) {
        setThreads((previousThreads) => previousThreads.map((thread) => 
            (thread.id === threadId ? {...thread, title, text} : thread)
        ));
    }

    function handleDeleteThread(threadId){
        setThreads((previousThreads) => previousThreads.filter((thread) => thread.id !== threadId));
    }

    function handleEditReply(threadId, replyId, text) {
        setThreads((previousThreads) => previousThreads.map((thread) => (
            thread.id === threadId
            ? {...thread, replies: thread.replies.map((reply) => reply.id === replyId ? {...reply, text } : reply) }
            : thread
        )));
    }

    function handleDeleteReply(threadId, replyId){
        setThreads((previousThreads) => previousThreads.map((thread) => (
            thread.id === threadId
            ? {...thread, replies: thread.replies.filter((reply) => reply.id !== replyId)}
            : thread
        )));
    }
// AI-assisted - see AI-USAGE.md #7
    function handleEditBoard(target) {
        navigate("/account", { state: { editBoardId: target.id } });
    }

    function handleSaveBoard(board){
        setMyboards((previousBoards) => (
            board.id
            // AI-assisted - see AI-USAGE.md #7
            ? previousBoards.map((existing) => existing.id === board.id ? board : existing)
            : [...previousBoards, {...board, id: Date.now() }]
        ));
    }

    function handleDeleteBoard(id){
        setMyboards((previousBoards) => previousBoards.filter((board) => board.id !== id));
        if (location.pathname === `/boards/${id}`) navigate("/account", { replace: true });
    }

    // AI-assisted - see AI-USAGE.md #6
    
    useEffect(() => {
        headingRef.current?.focus();
        const heading = headingRef.current;
        if (heading) document.title = `${heading.textContent.trim()} | Exhibito`;
    }, [location]);

    return (
        <OfflineImagesContext.Provider value={usingFallback}>
            <a className="skip-link" href="#main-content">Skip to content</a>
            <SiteHeader
                searchInput = {searchInput}
                onSearchInputChange = {setSearchInput}
                onSearchSubmit = {handleSearchSubmit}
                onLogoClick = {handleLogoClick}
            />
            <main id="main-content">
                <Routes>
                    <Route path="/:artworkId" element={
                        // AI-assisted - see AI-USAGE.md #7
                        <ArtworkRoute
                            artworks={artworks}
                            savedArtworks={savedArtworks}
                            boards={myBoards}
                            collectionOffline={usingFallback}
                            threads={threads}
                            onAddThread={handleAddThread}
                            onAddReply={handleAddReply}
                            onEditThread={handleEditThread}
                            onDeleteThread={handleDeleteThread}
                            onEditReply={handleEditReply}
                            onDeleteReply={handleDeleteReply}
                        />
                    } />
                    <Route path="/community" element={
                        <CommunityBoards
                            boards={publicBoards}
                            savedIds={savedIds}
                            onToggleSave={handleToggleSave}
                            onEditBoard={handleEditBoard}
                            onDeleteBoard={handleDeleteBoard}
                            headingRef={headingRef}
                        />
                    } />
                    <Route path="/boards/:boardId" element={
                        <BoardRoute
                            boards={[...communityBoards, ...myBoards]}
                            savedIds={savedIds}
                            onToggleSave={handleToggleSave}
                            onEditBoard={handleEditBoard}
                            onDeleteBoard={handleDeleteBoard}
                            headingRef={headingRef}
                        />
                    } />
                    <Route path="/account" element={
                        // AI-assisted - see AI-USAGE.md #7
                        <AccountPage
                            savedArtworks={savedArtworks}
                            savedIds={savedIds}
                            myBoards={myBoards}
                            onSaveBoard={handleSaveBoard}
                            onDeleteBoard={handleDeleteBoard}
                            onToggleSave={handleToggleSave}
                            // AI-assisted - see AI-USAGE.md #8
                            onSearchArtworks={searchArtworks}
                            headingRef={headingRef}
                        />
                    } />
                    <Route path="/" element={
                        <>
                            <section className="collection-intro" aria-labelledby="collection-heading">
                                <p className="eyebrow">The collection</p>
                                <h1 id="collection-heading" ref={headingRef} tabIndex="-1">
                                    Every artwork has a story.
                                </h1>
                                <p>
                                    Explore a few favorites from {MET_MUSEUM_NAME}.
                                    Open a work to meet its artist and discover its story.
                                </p>
                            </section>
                            <CollectionControls
                                era={selectedEra}
                                onEraChange={setSelectedEra}
                                eras={eras}
                                movement={selectedMovement}
                                onMovementChange={setSelectedMovement}
                                movements={movements.includes(selectedMovement) || selectedMovement === "All"
                                    ? movements
                                    : [...movements, selectedMovement]}
                                sortKey={sortKey}
                                onSortChange={setSortKey}
                                paginated={page > 0 || hasNextPage}
                            />
                            {!loading && usingFallback && (
                                // error state: we couldn't reach the met, so explain what's shown and offer a retry
                                <div className="status-notice status-notice--warning" role="alert">
                                    <span>
                                        Couldn't load artworks from The Metropolitan Museum of Art
                                        {error ? ` (${error})` : ""}. Showing downloaded Met artworks
                                        {activeQuery ? `, searched for “${activeQuery}”` : ""} instead.
                                    </span>
                                    <button className="text-button" type="button" onClick={() => runSearch(activeQuery)}>
                                        Try again
                                    </button>
                                </div>
                            )}
                            <section aria-labelledby="artworks-heading" aria-busy={loading}>
                                <div className="section-heading">
                                    <h2 id="artworks-heading" ref={artworksHeadingRef} tabIndex="-1">
                                        {activeQuery ? `Results for “${activeQuery}”` : "Featured Artworks"}
                                    </h2>
                                    <span className="muted" role="status">
                                        {loading
                                            ? (page > 0
                                                ? `Loading page ${page + 1}…`
                                                : activeQuery ? `Searching for “${activeQuery}”…` : "Loading artworks…")
                                            : `${page > 0 || hasNextPage ? `Page ${page + 1} · ` : ""}`}
                                    </span>
                                </div>
                                {loading ? (
                                    // loading state: placeholder cards keep the layout from jumping
                                    <ul className="artwork-grid" aria-hidden="true">
                                        {Array.from({ length: SKELETON_COUNT }, (_, i) => (
                                            <li key={i} className="artwork-skeleton">
                                                <span className="skeleton-image" />
                                                <span className="skeleton-line" />
                                                <span className="skeleton-line skeleton-line--short" />
                                            </li>
                                        ))}
                                    </ul>
                                ) : visibleArtworks.length === 0 ? (
                                    // empty state: say why nothing matched and how to get results back
                                    <div className="empty-state">
                                        <p className="empty-message">
                                            {artworks.length === 0 && !usingFallback
                                                ? `The Met returned no European paintings with images${activeQuery ? ` matching “${activeQuery}”` : ""}. Try a different search.`
                                                : "No artworks match your search and filters."}
                                        </p>
                                        <div className="empty-actions">
                                            {filtersActive && (
                                                <button className="save-button" type="button" onClick={handleClearFilters}>
                                                    Clear filters
                                                </button>
                                            )}
                                            {activeQuery && (
                                                <button className="save-button" type="button" onClick={handleClearSearch}>
                                                    Clear search
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <ArtworkGrid
                                        artworks={visibleArtworks}
                                        savedIds={savedIds}
                                        onToggleSave={handleToggleSave}
                                    />
                                )}
                                {(page > 0 || hasNextPage) && (
                                    // the met only gives us ~24 works per load before rate-limiting, so page through the rest
                                    <nav className="pagination" aria-label="Artwork pages">
                                        <button
                                            className="save-button"
                                            type="button"
                                            onClick={() => goToPage(page - 1)}
                                            disabled={loading || page === 0}
                                        >
                                            ← Previous
                                        </button>
                                        <span className="muted">Page {page + 1}</span>
                                        <button
                                            className="save-button"
                                            type="button"
                                            onClick={() => goToPage(page + 1)}
                                            disabled={loading || !hasNextPage}
                                        >
                                            Next →
                                        </button>
                                    </nav>
                                )}
                            </section>
                        </>
                    } />
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </main>
            <footer className="site-footer">
                <span>Exhibito · A little closer to art.</span>
                <span>Public-domain artworks · {MET_MUSEUM_NAME}</span>
            </footer>
        </OfflineImagesContext.Provider>
    );
}
