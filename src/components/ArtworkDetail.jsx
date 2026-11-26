// AI-assisted - see AI-USAGE.md #1.
import { useState } from "react";
import ArtistBio from "./ArtistBio.jsx";
import ArtworkImage from "./ArtworkImage.jsx";
import ArtworkViewer from "./ArtworkViewer.jsx";
import DiscussionThreads from "./DiscussionThreads.jsx";

export default function ArtworkDetail({ artwork, onBack, backLabel, onSearchArtist, threads, onAddThread, onAddReply, onEditThread, onDeleteThread, onEditReply, onDeleteReply, headingRef }) {
    const [viewerOpen, setViewerOpen] = useState(false);
    const artistName = artwork.artist.name.trim();
    const canSearchArtist = artistName && artistName.toLowerCase() !== "unknown artist";

    return (
        <>
            <button className="text-button back-button" type="button" onClick={onBack}>
                <span aria-hidden="true">← </span>Back to {backLabel}
            </button>
            <div className="detail-layout">
                <figure className="artwork-figure">
                    <div className="image-frame">
                        <button className="image-viewport artwork-preview" type="button"
                            aria-label={`View ${artwork.title} fullscreen`} aria-haspopup="dialog"
                            onClick={() => setViewerOpen(true)}>
                            {/* this used to live in ArtworkDetailModal, which was deleted in #24 (also news to me) */}
                            <ArtworkImage artwork={artwork} />
                        </button>
                    </div>
                    <button className="text-button zoom-button" type="button" aria-haspopup="dialog"
                        onClick={() => setViewerOpen(true)}>
                        View fullscreen
                    </button>
                    {viewerOpen && <ArtworkViewer artwork={artwork} onClose={() => setViewerOpen(false)} />}
                    <figcaption>
                        {[artwork.museum, artwork.credit].filter(Boolean).join(" · ")}
                    </figcaption>
                </figure>
                <div>
                    <p className="eyebrow">{artwork.movement}</p>
                    <h1 ref={headingRef} tabIndex="-1">{artwork.title}</h1>
                    <p className="artist-line">
                        {canSearchArtist ? (
                            <button
                                className="artist-search"
                                type="button"
                                onClick={() => onSearchArtist(artistName)}
                                aria-label={`Search artworks by ${artistName}`}
                            >
                                {artistName}
                            </button>
                        ) : artwork.artist.name}
                        {" · "}{artwork.date}
                    </p>
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
            <DiscussionThreads
                artworkId = {artwork.id}
                threads = {threads}
                onAddThread = {onAddThread}
                onAddReply = {onAddReply}
                onEditThread = {onEditThread}
                onDeleteThread = {onDeleteThread}
                onEditReply = {onEditReply}
                onDeleteReply = {onDeleteReply}
            />
        </>
    );
}
