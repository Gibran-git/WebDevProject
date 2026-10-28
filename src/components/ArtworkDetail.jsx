// AI-assisted - see AI-USAGE.md #1.
import { useState } from "react";
import ArtistBio from "./ArtistBio.jsx";

export default function ArtworkDetail({ artwork, onBack, headingRef }) {
    const [isZoomed, setIsZoomed] = useState(false);

    return (
        <>
            <button className="text-button back-button" type="button" onClick={onBack}>
                <span aria-hidden="true">← </span>Back to collection
            </button>
            <div className="detail-layout">
                <figure className="artwork-figure">
                    <div className="image-frame">
                        <div
                            id="artwork-image"
                            className={`image-viewport${isZoomed ? " is-zoomed" : ""}`}
                            tabIndex={isZoomed ? 0 : undefined}
                            role="region"
                            aria-label="Artwork image; scroll to explore when enlarged"
                        >
                            <img src={artwork.image} alt={artwork.imageAlt} />
                        </div>
                    </div>
                    <button
                        className="text-button zoom-button"
                        type="button"
                        aria-expanded={isZoomed}
                        aria-controls="artwork-image"
                        onClick={() => setIsZoomed((zoomed) => !zoomed)}
                    >
                        {isZoomed ? "Reset image" : "Enlarge image"}
                        <span aria-hidden="true"> {isZoomed ? "−" : "+"}</span>
                    </button>
                    <figcaption>Art Institute of Chicago · {artwork.credit}</figcaption>
                </figure>
                <div>
                    <p className="eyebrow">{artwork.movement}</p>
                    <h1 ref={headingRef} tabIndex="-1">{artwork.title}</h1>
                    <p className="artist-line">{artwork.artist.name} · {artwork.date}</p>
                    <p>{artwork.description}</p>
                    <dl className="artwork-facts">
                        <div><dt>Medium</dt><dd>{artwork.medium}</dd></div>
                        <div><dt>Dimensions</dt><dd>{artwork.dimensions}</dd></div>
                    </dl>
                    <ArtistBio artist={artwork.artist} />
                    <section className="context-panel" aria-labelledby="context-heading">
                        <h2 id="context-heading">Cultural context</h2>
                        <p>{artwork.context}</p>
                    </section>
                    <a className="source-link" href={artwork.sourceUrl}>
                        View museum record <span aria-hidden="true">↗</span>
                    </a>
                </div>
            </div>
        </>
    );
}
