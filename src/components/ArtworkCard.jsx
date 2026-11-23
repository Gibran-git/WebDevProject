import { useContext } from "react";
import { Link, useLocation } from "react-router";
import { OfflineImagesContext } from "../data/artworks.js";
// AI-assisted foundation and integration - see AI-USAGE.md #1 and #2.
import ArtworkImage from "./ArtworkImage.jsx";

export default function ArtworkCard({ artwork, isSaved, onToggleSave }) {
    const location = useLocation();
    const offline = useContext(OfflineImagesContext);
    return (
        <li>
            <article className="artwork-card">
                <Link className="artwork-open" to={`/${artwork.id}`} state={{ from: location.pathname, originState: location.state, offline }}>
                    {/* placeholder fallback for broken/missing api images */}
                    <ArtworkImage artwork={artwork} width="600" height="440" loading="lazy" />
                    <span className="card-content">
                        <span className="eyebrow">{artwork.movement}</span>
                        <span className="card-title">{artwork.title}</span>
                        <span className="card-artist">{artwork.artist.name}</span>
                        <span className="card-link">Explore artwork <span aria-hidden="true">→</span></span>
                    </span>
                </Link>
                <div className="card-actions">
                    <button
                        className="save-button"
                        type="button"
                        aria-pressed={isSaved}
                        aria-label={`Save ${artwork.title}`}
                        onClick={() => onToggleSave(artwork)}
                    >
                        <span aria-hidden="true">{isSaved ? "★" : "☆"} </span>
                        {isSaved ? "Saved" : "Save artwork"}
                    </button>
                </div>
            </article>
        </li>
    );
}
