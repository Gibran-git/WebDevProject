export default function PersonalBoards({ pinnedItems, onUnpin }) {
  if (pinnedItems.length === 0) {
    return <p className="empty-board">No pinned artworks yet.</p>;
  }

  return (
    <section className="boards-container">
      <h2>My Pinned Board ({pinnedItems.length})</h2>
      <div className="masonry-grid">
        {pinnedItems.map((art) => (
          <div key={art.id} className="masonry-card">
            <img src={art.imageUrl} alt={art.title} />
            <div className="masonry-details">
              <h4>{art.title}</h4>
              <button onClick={() => onUnpin(art.id)}>Remove Pin</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}