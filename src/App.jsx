// AI-assisted foundation and integration - see AI-USAGE.md #1 and #2.
import { useEffect, useRef, useState } from "react";
import ArtworkGrid from "./components/ArtworkGrid.jsx";
import ArtworkDetail from "./components/ArtworkDetail.jsx";
import { artworks } from "./data/artworks.js";

export default function App() {
    const [selectedArtwork, setSelectedArtwork] = useState(null);
    const [selectedMovement, setSelectedMovement] = useState("All");
    const [savedIds, setSavedIds] = useState([]);
    const headingRef = useRef(null);
    const movements = [...new Set(artworks.map((artwork) => artwork.movement))];
    const filteredArtworks = selectedMovement === "All"
        ? artworks
        : artworks.filter((artwork) => artwork.movement === selectedMovement);

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
                                Explore a few favorites from the Art Institute of Chicago.
                                Open a work to meet its artist and discover its story.
                            </p>
                        </section>
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
                <span>Public-domain artworks · Art Institute of Chicago</span>
            </footer>
        </>
    );
}
