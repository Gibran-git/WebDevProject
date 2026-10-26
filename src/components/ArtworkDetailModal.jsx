import ArtworkImage from "./ArtworkImage";

export default function ArtworkDetailModal({ artwork, onClose }) {
  if (!artwork) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose} aria-label="Close details">
          ×
        </button>
        <ArtworkImage key={artwork.id} artwork={artwork} className="modal-image" />
        <div className="modal-details">
          <h2>{artwork.title}</h2>
          <p className="subtitle">{artwork.artist} — {artwork.date}</p>
          <p><strong>Medium:</strong> {artwork.medium}</p>
          <p><strong>Era:</strong> {artwork.era}</p>
          <p className="description">{artwork.description}</p>
        </div>
      </div>
    </div>
  );
}