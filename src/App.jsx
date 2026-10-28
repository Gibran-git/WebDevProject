import { useState } from "react";
import initialData from "./data/mockArtworks.json";
import ArtworkGrid from "./components/ArtworkGrid";
import ArtworkDetailModal from "./components/ArtworkDetailModal";
import PersonalBoards from './components/PersonalBoards';

export default function App() {
  const [artworks] = useState(initialData);
  const [selectedEra, setSelectedEra] = useState("All");
  const [activeItem, setActiveItem] = useState(null);
  const [savedIds, setSavedIds] = useState([]);

  // Toggle state requirement (fav/save/pin)
  const handleToggleSave = (id) => {
    setSavedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Filter state
  const filteredArtworks = selectedEra === "All"
    ? artworks
    : artworks.filter((item) => item.era === selectedEra);

  const pinnedArtworks = artworks.filter((art) => savedIds.includes(art.id));
  return (
    <div className="app-shell">
      <header className="header">
        <h1>Digital Museum & Archive</h1>
        <p>Saved Pieces: {savedIds.length}</p>
      </header>

      <main className="main-content">
        <div className="filters">
          <label htmlFor="era-filter">Filter by Era: </label>
          <select
            id="era-filter"
            value={selectedEra}
            onChange={(e) => setSelectedEra(e.target.value)}
          >
            <option value="All">All Eras</option>
            <option value="Post-Impressionism">Post-Impressionism</option>
            <option value="Impressionism">Impressionism</option>
          </select>
        </div>

        <ArtworkGrid
          artworks={filteredArtworks}
          onSelectArtwork={setActiveItem}
          savedIds={savedIds}
          onToggleSave={handleToggleSave}
        />
      </main>
        <PersonalBoards
          pinnedItems={pinnedArtworks}
          onUnpin={handleToggleSave}
        />
      <ArtworkDetailModal
        artwork={activeItem}
        onClose={() => setActiveItem(null)}
      />
    </div>
  );
  
}

