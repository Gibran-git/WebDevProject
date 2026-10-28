// AI-assisted - see AI-USAGE.md #1.
import { useEffect, useRef, useState } from "react";
import ArtworkCard from "./components/ArtworkCard.jsx";
import ArtworkDetail from "./components/ArtworkDetail.jsx";
import { artworks } from "./data/artworks.js";

export default function App() {
    const [selectedArtwork, setSelectedArtwork] = useState(null);
    const headingRef = useRef(null);

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
                    <span className="header-caption">Art & the people behind it</span>
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
                                <span className="muted">{artworks.length} works</span>
                            </div>
                            <ul className="artwork-grid">
                                {artworks.map((artwork) => (
                                    <ArtworkCard key={artwork.id} artwork={artwork} onSelect={setSelectedArtwork} />
                                ))}
                            </ul>
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
