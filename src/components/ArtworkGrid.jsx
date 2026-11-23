// AI-assisted integration - see AI-USAGE.md #2.
import ArtworkCard from "./ArtworkCard.jsx";

export default function ArtworkGrid({ artworks, savedIds, onToggleSave }) {
    if (artworks.length === 0) {
        return <p className="empty-message">No artworks found matching your filter criteria.</p>;
    }

    return (
        <ul className="artwork-grid">
            {artworks.map((item) => (
                <ArtworkCard
                    key={item.id}
                    artwork={item}
                    isSaved={savedIds.includes(item.id)}
                    onToggleSave={onToggleSave}
                />
            ))}
        </ul>
    );
}
