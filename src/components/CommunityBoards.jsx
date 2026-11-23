import { Link, useLocation } from "react-router";
import ArtworkGrid from "./ArtworkGrid.jsx";
import {artworks} from "../data/artworks.js";
import ArtworkImage from "./ArtworkImage.jsx";
import OptionsMenu from "./OptionsMenu.jsx";

// AI-assisted - see AI-USAGE.md #7
const getArtworks = (board) => board.artworks ?? artworks.filter((artwork) => board.artworkIds.includes(artwork.id));

const getCover = (board) => {
    const boardArtworks = getArtworks(board);
    return boardArtworks.find((artwork) => artwork.id === board.coverId) ?? boardArtworks[0];
};

export function BoardList({boards, onEditBoard, onDeleteBoard}){
    const location = useLocation();
    return (
        <ul className = "artwork-grid">
            {boards.map((board) => (
                <li className = "board-item" key = {board.id}>
                    <Link className = "artwork-card" to={`/boards/${board.id}`} state={{ from: location.pathname }}>
                        {getCover(board) && <ArtworkImage artwork = {getCover(board)} />}
                        <span className = "card-content">
                            <span className = "eyebrow"> {board.kind}{board.isPublic === false ? " · Private" : ""} </span>
                            <span className = "card-title"> {board.title} </span>
                            <span className = "card-artist">
                                by {board.owner} · {getArtworks(board).length} {getArtworks(board).length === 1 ? "art piece" : "art pieces"}
                            </span>
                            {board.description && <span className = "card-description">{board.description}</span>}
                            <span className = "card-link"> View board <span aria-hidden = "true"> → </span></span>
                        </span>
                    </Link>
                    {board.owner === "You" && (
                        <OptionsMenu name = "board" onEdit = {() => onEditBoard(board)} onDelete = {() => onDeleteBoard(board.id)} />
                    )}
                </li>
            ))}
        </ul>
    );
}

export default function CommunityBoards({ boards, selectedBoard, onSelectBoard, savedIds, onToggleSave, onEditBoard, onDeleteBoard, backLabel, headingRef}){
    if(selectedBoard) {
        return (
            <>
                <button className = "text-button back-button" type = "button" onClick = {() => onSelectBoard(null)}>
                    <span aria-hidden = "true"> ← </span> Back to {backLabel}
                </button>
                {/* AI-assisted - see AI-USAGE.md #5 */}
                <section className = "collection-intro" aria-labelledby= "board-heading">
                    <p className = "eyebrow"> {selectedBoard.kind} {selectedBoard.isPublic === false ? " · Private" : ""} · {selectedBoard.owner} </p>
                    <div className = "post-header">
                        <h1 id = "board-heading" ref = {headingRef} tabIndex = "-1"> {selectedBoard.title}</h1>
                        {selectedBoard.owner === "You" && (
                            <OptionsMenu name = "board" onEdit = {() => onEditBoard(selectedBoard)} onDelete = {() => onDeleteBoard(selectedBoard.id)} />
                        )}
                    </div>
                    {selectedBoard.description && <p>{selectedBoard.description} </p> }
                </section>
                <ArtworkGrid
                    artworks = {getArtworks(selectedBoard)}
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
            <BoardList
                boards = {boards}
                onEditBoard = {onEditBoard}
                onDeleteBoard = {onDeleteBoard}
            />
        </>
    );
}