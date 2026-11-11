// AI-assisted foundation and integration - see AI-USAGE.md #1 and #2.

/*
important notes for local/dev testing (delete me):

had to switch from aic api to met api due to cloudflare restrictions.
www.artic.edu/iiif answered every image request i sent with a bot check or challenge
and images were often blurred or inaccessible. not great for reliable image fetching

switched to met, which has more reliable image access but rate-limits bursts of requests.
bursts of requests get 403s and react dev mode doubles them on mount, so now we fetch
artworks in small batches at a time.

art details are fetched 4 at a time, stopping once there are 24 artworks with images

- DJ
*/
import { useEffect, useRef, useState } from "react";
import ArtworkGrid from "./components/ArtworkGrid.jsx";
import ArtworkDetail from "./components/ArtworkDetail.jsx";
import { artworks as localArtworks } from "./data/artworks.js";
import { fetchArtworks, eraFromYear } from "./api/met.js";
import CollectionControls from "./components/CollectionControls.jsx";

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

function filterArtworks(artworks, { query = "", era = "All", movement = "All" } = {}) {
    // filter artworks based on the selected era, movement, and search query
    return artworks.filter((artwork) => (
        (era === "All" || artwork.era === era)
        && (movement === "All" || artwork.movement === movement)
        && matchesQuery(artwork, query)
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
const LOCAL_ARTWORKS = localArtworks.map(withEra); // local data has no `era`/`year`, derive them once
const SKELETON_COUNT = 6;

// keep the selected category if the new results still have it, otherwise go back to "All"
const keepIfPresent = (list) => (previous) => (
    list.some((artwork) => artwork.movement === previous) ? previous : "All"
);

export default function App() {
    // local data just in case the met api fails / is being slow
    const [artworks, setArtworks] = useState(LOCAL_ARTWORKS);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [usingFallback, setUsingFallback] = useState(true);
    const [selectedArtwork, setSelectedArtwork] = useState(null);
    const [savedIds, setSavedIds] = useState([]);
    // search / filter / sort state
    const [searchInput, setSearchInput] = useState(""); // what's typed in the box (controlled input)
    const [activeQuery, setActiveQuery] = useState(""); // what was last submitted
    const [requestId, setRequestId] = useState(0); // bumped to re-run the fetch (retry, re-submitting the same search)
    const [selectedEra, setSelectedEra] = useState("All");
    const [selectedMovement, setSelectedMovement] = useState("All");
    const [sortKey, setSortKey] = useState("relevance");
    const headingRef = useRef(null);

    const movements = [...new Set(artworks.map((artwork) => artwork.movement))].sort();
    // the met already searched for us; the offline data has to be searched locally
    const visibleArtworks = sortArtworks(
        filterArtworks(artworks, {
            query: usingFallback ? activeQuery : "",
            era: selectedEra,
            movement: selectedMovement,
        }),
        sortKey,
    );
    const filtersActive = selectedEra !== "All" || selectedMovement !== "All";
    const sourceName = usingFallback ? "the Art Institute of Chicago" : "The Metropolitan Museum of Art";

    useEffect(() => {
        // fetch artworks with timeout and cancellation handling
        const controller = new AbortController(); // used to cancel the fetch request if it times out or the component unmounts
        let timedOut = false;
        let cancelled = false;
        const timeoutId = setTimeout(() => { timedOut = true; controller.abort(); }, FETCH_TIMEOUT_MS); // abort the fetch if it takes longer than the timeout

        function showFallback(message) {
            // show the fallback artworks and update the UI state accordingly
            setArtworks(LOCAL_ARTWORKS);
            setUsingFallback(true);
            setSelectedMovement(keepIfPresent(LOCAL_ARTWORKS));
            setError(message);
        }

        fetchArtworks({ query: activeQuery, timeBudgetMs: FETCH_BUDGET_MS, signal: controller.signal }) // pass the abort signal to the fetch request for cancellation handling
            .then((data) => {
                if (cancelled) return;
                if (data.length === 0 && !activeQuery) {
                    // the preset queries should always find something, so this is an api problem
                    showFallback("The API returned no artworks.");
                    return;
                }
                // success response. an empty list for a user search is a valid "no results", not an error
                const results = data.map(withEra);
                setArtworks(results);
                setSelectedMovement(keepIfPresent(results)); // local categories won't exist in the met data
                setUsingFallback(false);
                setError(null);
            })
            .catch((err) => {
                // handle fetch errors (network issues, API errors, or aborts)
                if (cancelled) return;
                showFallback(timedOut ? "The request timed out." : err.message || "Failed to load artworks.");
            })
            // finalize fetch process by clearing the timeout and updating the loading state
            .finally(() => {
                clearTimeout(timeoutId);
                if (!cancelled) setLoading(false); // update the loading state only if the fetch was NOT cancelled
            });

        return () => {
            // cleanup function
            cancelled = true;
            clearTimeout(timeoutId); // clear the timeout to prevent it from firing after unmount
            controller.abort(); // abort the fetch request if the component unmounts or a new search starts
        };
    }, [activeQuery, requestId]);

    function runSearch(query) {
        // loading is set here instead of in the effect so the effect never sets state synchronously
        setActiveQuery(query);
        setRequestId((id) => id + 1);
        setLoading(true);
    }

    function handleSearchSubmit() {
        const query = searchInput.trim();
        setSearchInput(query);
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

    function handleToggleSave(id) {
        setSavedIds((previousIds) => (
            previousIds.includes(id)
                ? previousIds.filter((savedId) => savedId !== id)
                : [...previousIds, id]
        ));
    }

    useEffect(() => {
        headingRef.current?.focus();
    }, [selectedArtwork]);

    return (
        <>
            <a className="skip-link" href="#main-content">Skip to content</a>
            <header className="site-header">
                <div className="header-content">
                    <button className="brand" type="button" onClick={() => setSelectedArtwork(null)}>
                        Exhibito<span aria-hidden="true">.</span>
                    </button>
                    <div className="header-info">
                        <span className="header-caption">Art & the people behind it</span>
                        <span className="saved-count" role="status">Saved pieces: {savedIds.length}</span>
                    </div>
                </div>
            </header>
            <main id="main-content">
                {selectedArtwork ? (
                    <ArtworkDetail
                        key={selectedArtwork.id}
                        artwork={selectedArtwork}
                        onBack={() => setSelectedArtwork(null)}
                        headingRef={headingRef}
                    />
                ) : (
                    <>
                        <section className="collection-intro" aria-labelledby="collection-heading">
                            <p className="eyebrow">The collection</p>
                            <h1 id="collection-heading" ref={headingRef} tabIndex="-1">
                                Every artwork has a story.
                            </h1>
                            <p>
                                Explore a few favorites from {sourceName}.
                                Open a work to meet its artist and discover its story.
                            </p>
                        </section>
                        <CollectionControls
                            searchInput={searchInput}
                            onSearchInputChange={setSearchInput}
                            onSearchSubmit={handleSearchSubmit}
                            onClearSearch={handleClearSearch}
                            activeQuery={activeQuery}
                            era={selectedEra}
                            onEraChange={setSelectedEra}
                            movement={selectedMovement}
                            onMovementChange={setSelectedMovement}
                            movements={movements.includes(selectedMovement) || selectedMovement === "All"
                                ? movements
                                : [...movements, selectedMovement]}
                            sortKey={sortKey}
                            onSortChange={setSortKey}
                        />
                        {!loading && usingFallback && (
                            // error state: we couldn't reach the met, so explain what's shown and offer a retry
                            <div className="status-notice status-notice--warning" role="alert">
                                <span>
                                    Couldn't load artworks from The Metropolitan Museum of Art
                                    {error ? ` (${error})` : ""}. Showing offline sample data
                                    {activeQuery ? `, searched for “${activeQuery}”` : ""} instead.
                                </span>
                                <button className="text-button" type="button" onClick={() => runSearch(activeQuery)}>
                                    Try again
                                </button>
                            </div>
                        )}
                        <section aria-labelledby="artworks-heading" aria-busy={loading}>
                            <div className="section-heading">
                                <h2 id="artworks-heading">
                                    {activeQuery ? `Results for “${activeQuery}”` : "Selected artworks"}
                                </h2>
                                <span className="muted" role="status">
                                    {loading
                                        ? (activeQuery ? `Searching for “${activeQuery}”…` : "Loading artworks…")
                                        : `${visibleArtworks.length} ${visibleArtworks.length === 1 ? "work" : "works"}`}
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
                                        {artworks.length === 0
                                            ? `The Met has no European paintings with images matching “${activeQuery}”. Try a different spelling or a broader term.`
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
                                    onSelectArtwork={setSelectedArtwork}
                                    savedIds={savedIds}
                                    onToggleSave={handleToggleSave}
                                />
                            )}
                        </section>
                    </>
                )}
            </main>
            <footer className="site-footer">
                <span>Exhibito · A little closer to art.</span>
                <span>Public-domain artworks · {usingFallback ? "Art Institute of Chicago" : "The Metropolitan Museum of Art"}</span>
            </footer>
        </>
    );
}
