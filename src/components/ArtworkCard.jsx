export default function ArtworkCard({ artwork, onSelect, isSaved, onToggleSave }) {
  return (
    <article className="artwork-card">
      <div className="card-image-wrap" onClick={() => onSelect(artwork)}>
        <img src={artwork.imageUrl} alt={artwork.title} loading="lazy" />
      </div>
      <div className="card-info">
        <h3>{artwork.title}</h3>
        <p className="artist">{artwork.artist} ({artwork.date})</p>
        <span className="badge">{artwork.era}</span>

        <div className="card-actions">
          <button
            type="button"
            className={`btn-action ${isSaved ? "active" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave(artwork.id);
            }}
          >
            {isSaved ? "★ Saved" : "☆ Save"}
          </button>
          <button
            type="button"
            className="btn-details"
            onClick={() => onSelect(artwork)}
          >
            Inspect
          </button>
        </div>
      </div>
    </article>
  );
}