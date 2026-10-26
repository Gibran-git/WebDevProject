/*
important notes for local/dev testing:

had to switch from aic api to met api due to cloudflare restrictions.
www.artic.edu/iiif answered every image request i sent with a bot check or challenge
and images were often blurred or inaccessible. not great for reliable image fetching

switched to met, which has more reliable image access but rate-limits bursts of requests.
bursts of requests get 403s and react dev mode doubles them on mount, so now we fetch
artworks in small batches at a time.

art details are fetched 4 at a time, stopping once there are 24 artworks with images

- DJ

**feel free to remove this block comment once reviewed and new api is agreed upon
*/

import { useEffect, useState } from "react";
import initialData from "./data/mockArtworks.json";
import { fetchArtworks } from "./api/met";
import ArtworkGrid from "./components/ArtworkGrid";
import ArtworkDetailModal from "./components/ArtworkDetailModal";

const FETCH_TIMEOUT_MS = 8000; // give enough time for met api to respond, otherwise may be a legit timeout

export default function App() {
  // mock data just in case the met api fails / is being slow
  const [artworks, setArtworks] = useState(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usingFallback, setUsingFallback] = useState(true);
  const [selectedEra, setSelectedEra] = useState("All");
  const [activeItem, setActiveItem] = useState(null);
  const [savedIds, setSavedIds] = useState([]);

  useEffect(() => {
    // fetch artworks with timeout and cancellation handling
    const controller = new AbortController(); // used to cancel the fetch request if it times out or the component unmounts
    let timedOut = false;
    let cancelled = false;
    const timeoutId = setTimeout(() => { timedOut = true; controller.abort(); }, FETCH_TIMEOUT_MS); // abort the fetch if it takes longer than the timeout

    fetchArtworks({ signal: controller.signal }) // pass the abort signal to the fetch request for cancellation handling
      .then((data) => { if (cancelled) return; 
        if (data.length === 0) {
          setError("The API returned no artworks."); // error response
          return;
        }
        // success response
        setArtworks(data); // update the artworks state with the fetched data
        setUsingFallback(false); // indicate that we are no longer using fallback/mock data
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

  const handleToggleSave = (id) => {
    setSavedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // extract unique eras from the artworks for the filter dropdown
  const eras = [...new Set(artworks.map((item) => item.era))].sort();
  const filteredArtworks = selectedEra === "All"
    ? artworks
    : artworks.filter((item) => item.era === selectedEra);

  return (
    <div className="app-shell">
      <header className="header">
        <h1>Digital Museum & Archive</h1>
        <p>Saved Pieces: {savedIds.length}</p>
      </header>

      <main className="main-content">
        {loading && (
          // added a loading status notice (partially for debug, but also good UX practice)
          // get rid of this notice after discussion ?
          <p className="status-notice" role="status">Loading artworks from The Metropolitan Museum of Art…</p>
        )}
        {!loading && usingFallback && (
          // debug: warning notice when using fallback/mock data 
          <p className="status-notice status-notice--warning" role="status">
            Showing offline sample data{error ? ` (${error})` : ""}.
          </p>
        )}

        <div className="filters">
          <label htmlFor="era-filter">Filter by Era: </label>
          <select
            id="era-filter"
            value={selectedEra}
            onChange={(e) => setSelectedEra(e.target.value)}
          >
            <option value="All">All Eras</option>
            {eras.map((era) => (
              <option key={era} value={era}>{era}</option>
            ))}
          </select>
        </div>

        <ArtworkGrid
          artworks={filteredArtworks}
          onSelectArtwork={setActiveItem}
          savedIds={savedIds}
          onToggleSave={handleToggleSave}
        />
      </main>

      <ArtworkDetailModal
        artwork={activeItem}
        onClose={() => setActiveItem(null)}
      />
    </div>
  );
}