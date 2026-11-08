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
import { fetchArtworks } from "./api/met.js";

const FETCH_TIMEOUT_MS = 8000; // give enough time for met api to respond, otherwise may be a legit timeout

export default function App() {
    // local data just in case the met api fails / is being slow
    const [artworks, setArtworks] = useState(localArtworks);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [usingFallback, setUsingFallback] = useState(true);
    const [selectedArtwork, setSelectedArtwork] = useState(null);
    const [selectedMovement, setSelectedMovement] = useState("All");
    const [savedIds, setSavedIds] = useState([]);
    const headingRef = useRef(null);
    const movements = [...new Set(artworks.map((artwork) => artwork.movement))].sort();
    const filteredArtworks = selectedMovement === "All"
        ? artworks
        : artworks.filter((artwork) => artwork.movement === selectedMovement);
    const sourceName = usingFallback ? "the Art Institute of Chicago" : "The Metropolitan Museum of Art";

    useEffect(() => {
        // fetch artworks with timeout and cancellation handling
        const controller = new AbortController(); // used to cancel the fetch request if it times out or the component unmounts
        let timedOut = false;
        let cancelled = false;
        const timeoutId = setTimeout(() => { timedOut = true; controller.abort(); }, FETCH_TIMEOUT_MS); // abort the fetch if it takes longer than the timeout

        fetchArtworks({ signal: controller.signal }) // pass the abort signal to the fetch request for cancellation handling
            .then((data) => {
                if (cancelled) return;
                if (data.length === 0) {
                    setError("The API returned no artworks."); // error response
                    return;
                }
                // success response
                setArtworks(data); // update the artworks state with the fetched data
                setSelectedMovement("All"); // local movements won't exist in the met data, so reset the filter
                setUsingFallback(false); // indicate that we are no longer using fallback/local data
                setError(null); // clear previous error messages (if any) on successful fetch
            })
            .catch((err) => {
                // handle fetch errors (network issues, API errors, or aborts)
                if (cancelled) return;
                setError(timedOut ? "The request timed out." : err.message || "Failed to load artworks."); // set the error message based on the type of failure
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
            controller.abort(); // abort the fetch request if the component unmounts
        };
    }, []);

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
                        {loading && (
                            // added a loading status notice (partially for debug, but also good UX practice)
                            // get rid of this notice after discussion ?
                            <p className="status-notice" role="status">Loading artworks from The Metropolitan Museum of Art…</p>
                        )}
                        {!loading && usingFallback && (
                            // debug: warning notice when using fallback/local data
                            <p className="status-notice status-notice--warning" role="status">
                                Showing offline sample data{error ? ` (${error})` : ""}.
                            </p>
                        )}
                        <section aria-labelledby="artworks-heading">
                            <div className="section-heading">
                                <h2 id="artworks-heading">Selected artworks</h2>
                                <span className="muted" role="status">
                                    {filteredArtworks.length} {filteredArtworks.length === 1 ? "work" : "works"}
                                </span>
                            </div>
                            <div className="collection-filters">
                                <label htmlFor="movement-filter">Filter by movement</label>
                                <select
                                    id="movement-filter"
                                    value={selectedMovement}
                                    onChange={(event) => setSelectedMovement(event.target.value)}
                                >
                                    <option value="All">All movements</option>
                                    {movements.map((movement) => (
                                        <option key={movement} value={movement}>{movement}</option>
                                    ))}
                                </select>
                            </div>
                            <ArtworkGrid
                                artworks={filteredArtworks}
                                onSelectArtwork={setSelectedArtwork}
                                savedIds={savedIds}
                                onToggleSave={handleToggleSave}
                            />
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
