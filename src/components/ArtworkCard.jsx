// AI-assisted - see AI-USAGE.md #1.
export default function ArtworkCard({ artwork, onSelect }) {
    return (
        <li>
            <button className="artwork-card" type="button" onClick={() => onSelect(artwork)}>
                <img src={artwork.image} alt={artwork.imageAlt} width="600" height="440" />
                <span className="card-content">
                    <span className="eyebrow">{artwork.movement}</span>
                    <span className="card-title">{artwork.title}</span>
                    <span className="card-artist">{artwork.artist.name}</span>
                    <span className="card-link">Explore artwork <span aria-hidden="true">→</span></span>
                </span>
            </button>
        </li>
    );
}
