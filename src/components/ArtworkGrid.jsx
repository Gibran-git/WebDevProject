import ArtworkCard from "./ArtworkCard";

export default function ArtworkGrid({ artworks, onSelectArtwork, savedIds, onToggleSave }) {
  if (artworks.length === 0) {
    return <p className="empty-message">No artworks found matching your filter criteria.</p>;
  }

  return (
    <section className="artwork-grid">
      {artworks.map((item) => (
        <ArtworkCard
          key={item.id}
          artwork={item}
          onSelect={onSelectArtwork}
          isSaved={savedIds.includes(item.id)}
          onToggleSave={onToggleSave}
        />
      ))}
    </section>
  );
}