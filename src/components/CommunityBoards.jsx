import ArtworkGrid from "./ArtworkGrid.jsx";
import {artworks} from "../data/artworks.js";
import {communityBoards} from "../data/communityBoards.js";

export default function CommunityBoards({ selectedBoard, onSelectBoard, onSelectArtwork, savedIds, onToggleSave, headingRef}){
    if(selectedBoard) {
        const boardArtworks = artworks.filter((artwork) => selectedBoard.artworkIds.includes(artwork.id));
        return (
            <>
                <button className = "text-button back-button" type = "button" onClick = {() => onSelectBoard(null)}>
                    <span aria-hidden = "true"> ← </span> Back to community boards
                </button>
                {/* AI-assisted - see AI-USAGE.md #5 */}
                <section className = "collection-intro" aria-labelledby= "board-heading">
                    <p className = "eyebrow">{selectedBoard.kind} · {selectedBoard.owner}</p>
                    <h1 id = "board-heading" ref = {headingRef} tabIndex = "-1"> {selectedBoard.title}</h1>
                    <p>{selectedBoard.description}</p>
                </section>
                <ArtworkGrid
                    artworks = {boardArtworks}
                    onSelectArtwork = {onSelectArtwork}
                    savedIds = {savedIds}
                    onToggleSave = {onToggleSave}
                />
            </>
        );
    }
    return (
        <>
            <section className = "collection-intro" aria-labelledby = "community-heading">
                <p className = "eyebrow"> Community boards</p>
                <h1 id = "community-heading" ref = {headingRef} tabIndex = "-1">
                    See what everyone is saving
                </h1>
                <p>
                    Browse the pieces and collections of other members, start a discussion under any artwork
                </p>
            </section>
            <ul className = "artwork-grid">
                {communityBoards.map((board) => (
                    <li key = {board.id}>
                        <button className = "artwork-card" type = "button" onClick = {() => onSelectBoard(board)}>
                            <span className = "card-content">
                                <span className = "eyebrow"> {board.kind}</span>
                                <span className = "card-title"> {board.title}</span>
                                <span className = "card-artist">
                                    by {board.owner} · {board.artworkIds.length} {board.artworkIds.length === 1 ? "work" : "works"}
                                </span>
                                <span className = "card-link"> View board <span aria-hidden = "true"> → </span></span>
                            </span>
                        </button>
                    </li>
                ))}
            </ul>
        </>
    );
}