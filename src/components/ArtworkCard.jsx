// AI-assisted foundation and integration - see AI-USAGE.md #1 and #2.
export default function ArtworkCard({ artwork, onSelect, isSaved, onToggleSave }) {
    return (
        <li>
            <article className="artwork-card">
                <button className="artwork-open" type="button" onClick={() => onSelect(artwork)}>
                    <img src={artwork.image} alt={artwork.imageAlt} width="600" height="440" />
                    <span className="card-content">
                        <span className="eyebrow">{artwork.movement}</span>
                        <span className="card-title">{artwork.title}</span>
                        <span className="card-artist">{artwork.artist.name}</span>
                        <span className="card-link">Explore artwork <span aria-hidden="true">→</span></span>
                    </span>
                </button>
                <div className="card-actions">
                    <button
                        className="save-button"
                        type="button"
                        aria-pressed={isSaved}
                        aria-label={`Save ${artwork.title}`}
                        onClick={() => onToggleSave(artwork.id)}
                    >
                        <span aria-hidden="true">{isSaved ? "★" : "☆"} </span>
                        {isSaved ? "Saved" : "Save artwork"}
                    </button>
                </div>
            </article>
        </li>
    );
}
