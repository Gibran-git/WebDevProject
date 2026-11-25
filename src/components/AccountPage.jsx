import { useLocation, useNavigate } from "react-router";
import {useContext, useEffect, useId, useRef, useState} from "react";
import ArtworkGrid from "./ArtworkGrid.jsx";
import ArtworkImage from "./ArtworkImage.jsx"
import {BoardList} from "./CommunityBoards.jsx";
import {OfflineImagesContext} from "../data/artworks.js";

const MAX_TITLE = 100;
const MAX_DESCRIPTION = 200;



// AI-assisted - see AI-USAGE.md #8

function ArtworkPicker ({savedArtworks, selectedIds, onToggle, onSearch, onClose}){
    const [input, setInput] = useState("");
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [status, setStatus] = useState("idle");
    const collectionOffline = useContext(OfflineImagesContext);
    const dialogRef = useRef(null);
    const controllerRef = useRef(null);
    const headingId = useId();

    useEffect(() => {
        const dialog = dialogRef.current;
        if(!dialog.open) dialog.showModal();
        return () => controllerRef.current?.abort();
    }, []);

    function handleSearch(event){
        event.preventDefault();
        const trimmed = input.trim();
        controllerRef.current?.abort();
        setQuery(trimmed);
        if(!trimmed){
            setStatus("idle");
            return;
        }
        const controller = new AbortController();
        controllerRef.current = controller;
        setStatus("loading");
        onSearch(trimmed, controller.signal)
            .then((response) => {
                if (controller.signal.aborted) return;
                setResults(response.results);
                setStatus(response.error ? "offline" : "done");
            });
    }

    function handleBackToSaved(){
        controllerRef.current?.abort();
        setInput("");
        setQuery("");
        setStatus("idle");
    }

    const shown = query ? results : savedArtworks;

    return (
        <dialog
            className = "picker-dialog"
            ref = {dialogRef}
            aria-labelledby = {headingId}
            onClose = {onClose}
            onClick = {(event) => event.target === event.currentTarget && dialogRef.current.close()}
        >
            <div className = "picker-header">
                <h2 id = {headingId}> Add artwork to board</h2>
                <form className = "picker-search" role = "search" onSubmit = {handleSearch}>
                    <input
                        type = "search"
                        aria-label = "Search artworks"
                        placeholder = "Search for art you haven't saved"
                        value = {input}
                        onChange = {(event) => setInput(event.target.value)}
                    />
                    <button className = "primary-button" type = "submit">Search</button>
                    {query && <button className = "text-button" type = "button" onClick = {handleBackToSaved}>Back to saved art</button>}
                </form>
            </div>
            <div className = "picker-results">
                <h3>{query ? `Results for “${query}”` : "Your saved art"}</h3>
                {status === "loading" && <p className = "helper" role = "status">Searching…</p>}
                {status === "offline" && <p className="helper" role="status">The Met search isn't available right now. Showing offline collection.</p>}
                {status !== "loading" && shown.length === 0 && (
                    <p className = "helper">{query ? "No artworks found" : "You haven't saved any artwork yet, try searching above"}</p>
                )}
                {status !== "loading" && shown.length > 0 && (
                    <OfflineImagesContext.Provider value={query ? status === "offline" : collectionOffline}>
                    <div className = "picker-grid">
                        {shown.map((artwork) => (
                            <label className = {`picker-tile${selectedIds.includes(artwork.id) ? " is-selected" : ""}`} key = {artwork.id}>
                                <input type = "checkbox" checked = {selectedIds.includes(artwork.id)} onChange = {() => onToggle(artwork)} />
                                <ArtworkImage artwork = {artwork} />
                                <span className = "tile-title">{artwork.title}</span>
                                <span className = "tile-artist">{artwork.artist.name}</span>
                            </label>
                        ))}
                    </div>
                    </OfflineImagesContext.Provider>
                )}
            </div>
            <div className = "picker-footer">
                <span className = "muted">{selectedIds.length} selected</span>
                <button className = "primary-button" type = "button" onClick = {() => dialogRef.current.close()}>Done</button>
            </div>
        </dialog>
    );
}

function BoardForm ({board, savedArtworks, onSave, onCancel, onSearch}){
    const [title, setTitle] = useState(board?.title ?? "");
    const [description, setDescription] = useState(board?.description ?? "");
    const [isPublic, setIsPublic] = useState(board?.isPublic ?? false);
    const [selected, setSelected] = useState(board?.artworks ?? []);
    const [coverId, setCoverId] = useState(board?.coverId ?? null);
    const [pickerOpen, setPickerOpen] = useState(false);
    const [error, setError] = useState("");
    const formId = useId();
    const cover = selected.some((artwork) => artwork.id === coverId) ? coverId : selected[0]?.id;

    function handleToggle(artwork){
        setSelected((previousArtworks) => (
            previousArtworks.some((item) => item.id === artwork.id)
                ? previousArtworks.filter((item) => item.id !== artwork.id)
                : [...previousArtworks, artwork]
        ));
        setError("");
    }

    function handleSubmit(event){
        event.preventDefault();
        if(title.trim().length < 1){
            setError("Please give your board a title");
            return;
        }
        if(selected.length < 1){
            setError("Please add at least one artwork");
            return;
        }
        onSave({
            id: board?.id,
            owner: "You",
            kind: "Collection",
            title: title.trim(),
            description: description.trim(),
            isPublic,
            coverId: cover,
            artworks: selected,
        });
    }

    return (
        <>
            <form className = "thread-form board-form" onSubmit = {handleSubmit}>
                <h2> {board ? "Edit board" : "Create a board"} </h2>
                <label htmlFor = {`${formId}-title`}>Title</label>
                <input
                    id = {`${formId}-title`}
                    type = "text"
                    maxLength = {MAX_TITLE}
                    value = {title}
                    onChange = {(event) => {setTitle(event.target.value); setError("");}}
                />
                <label htmlFor = {`${formId}-description`}>Description (optional)</label>
                <textarea
                    id = {`${formId}-description`}
                    maxLength = {MAX_DESCRIPTION}
                    value = {description}
                    onChange = {(event) => setDescription(event.target.value)}
                />
                <p className = "helper">{description.length}/{MAX_DESCRIPTION}</p>
                <div className = "board-field">
                    <span className = "field-title">Visibility</span>
                    <div className = "visibility-switch">
                        <span className = {isPublic ? "" : "is-active"}>Private</span>
                        <button
                            className = "switch"
                            type = "button"
                            role = "switch"
                            aria-checked = {isPublic}
                            aria-label = "Make this board public"
                            onClick = {() => setIsPublic(!isPublic)}
                        />
                        <span className = {isPublic ? "is-active" : ""}>Public</span>
                    </div>
                    <p className = "helper">
                        {isPublic ? "Also shows on the community boards page" : "Only shows on your account page"}
                    </p>
                </div>
                <div className = "board-field">
                    <div className = "field-heading">
                        <span className = "field-title">Artwork</span>
                        <button className = "save-button" type = "button" onClick = {() => setPickerOpen(true)}>
                            Add artwork to board
                        </button>
                    </div>
                    {selected.length === 0 ? (
                        <p className = "helper">No artwork added yet</p>
                    ):(
                        <>
                            <p className = "helper">Choose one piece to use as the board's cover</p>
                            <div className = "selected-row">
                                {selected.map((artwork) => (
                                    <div className = {`picker-tile${cover === artwork.id ? " is-selected" : ""}`} key = {artwork.id}>
                                        <button className = "tile-remove" type = "button" aria-label = {`Remove ${artwork.title}`} onClick = {() => handleToggle(artwork)}>
                                            ×
                                        </button>
                                        <ArtworkImage artwork = {artwork} />
                                        <span className = "tile-title">{artwork.title}</span>
                                        <label className = "picker-cover">
                                            <input type = "radio" name = {`${formId}-cover`} checked = {cover === artwork.id} onChange = {() => setCoverId(artwork.id)} />
                                            Cover art
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
                <p className = "error" role = "alert">{error}</p>
                <div className = "form-actions">
                    <button className = "primary-button" type = "submit">{board ? "Save changes" : "Create board"}</button>
                    <button className = "text-button" type = "button" onClick = {onCancel}>Cancel</button>
                </div>
            </form>
            {pickerOpen && (
                <ArtworkPicker
                    savedArtworks = {savedArtworks}
                    selectedIds = {selected.map((artwork) => artwork.id)}
                    onToggle = {handleToggle}
                    onSearch = {onSearch}
                    onClose = {() => setPickerOpen(false)}
                />
            )}
        </>
    );
}

// AI-assisted - see AI-USAGE.md #5
export default function AccountPage({ savedArtworks, savedIds, myBoards, onSaveBoard, onDeleteBoard, onToggleSave, onSearchArtworks, headingRef}){
    const location = useLocation();
    const navigate = useNavigate();
    // AI-assisted - see AI-USAGE.md #12
    const [boardFilter, setBoardFilter] = useState("all");

    const filteredBoards = myBoards.filter((board) => {
        if (boardFilter === "public") return board.isPublic;
        if (boardFilter === "private") return !board.isPublic;
        return true;
    });
    // AI-assisted - see AI-USAGE.md #12
    function filterStyle(isActive) {
    return {
        padding: "0.45rem 1rem",
        borderRadius: "6px",
        border: "1px solid #2f4f3e",
        backgroundColor: isActive ? "#2f4f3e" : "transparent",
        color: isActive ? "#ffffff" : "#2f4f3e",
        cursor: "pointer",
    };
}
    const [boardForm, onEditBoard] = useState(() =>
        myBoards.find((board) => board.id === location.state?.editBoardId) ?? null,
    );
    useEffect(() => {
        if (location.state?.editBoardId != null) {
            navigate("/account", { replace: true, state: null });
        }
    }, [location.state, navigate]);

    function saveBoard(board) {
        onSaveBoard(board);
        onEditBoard(null);
    }

    return (
        <>
            {/* AI-assisted - see AI-USAGE.md #5 */}
            {/* AI-assisted - see AI-USAGE.md #8 */}
            {!boardForm && (
                <section className = "collection-intro" aria-labelledby = "account-heading">
                    <p className = "eyebrow"> Your account </p>
                    <h1 id = "account-heading" ref = {headingRef} tabIndex = "-1"> Your personal boards and saved art </h1>
                    <p> Everything you have saved while browsing and any boards you made </p>
                </section>
            )}
            {boardForm ? (
                <BoardForm
                    key = {boardForm.id ?? "new"}
                    board = {boardForm === "new" ? null : boardForm}
                    savedArtworks = {savedArtworks}
                    onSave = {saveBoard}
                    onCancel = {() => onEditBoard(null)}
                    // AI-assisted - see AI-USAGE.md #8
                    onSearch = {onSearchArtworks}
                />
            ):(
                <>
                <section className = "account-section" aria-labelledby = "boards-heading">
                    <div className = "section-heading">
                        <h2 id = "boards-heading">Your boards</h2>
                        <button className = "primary-button" type = "button" onClick = {() => onEditBoard("new")}>
                            Create a board
                        </button>
                    </div>
                    { myBoards.length === 0 ? (
                        <p className = "empty-message">
                            You have not made any boards
                        </p>
                    ):(
                        <>
                        // AI-assisted - see AI-USAGE.md #12
                            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
                                <button type="button" style={filterStyle(boardFilter === "all")} onClick={() => setBoardFilter("all")}>All</button>
                                <button type="button" style={filterStyle(boardFilter === "public")} onClick={() => setBoardFilter("public")}>Public</button>
                                <button type="button" style={filterStyle(boardFilter === "private")} onClick={() => setBoardFilter("private")}>Private</button>
                            </div>

                            {filteredBoards.length === 0 ? (
                                <p className="empty-message">No {boardFilter} boards yet.</p>
                            ) : (
                                <BoardList
                                    boards={filteredBoards}
                                    onEditBoard={onEditBoard}
                                    onDeleteBoard={onDeleteBoard}
                                />
                    )}
                </>
                    )}
                </section>
                <section className = "account-section" aria-labelledby = "saved-heading">
                    <h2 id = "saved-heading">Saved art</h2>
                    { savedArtworks.length === 0 ? (
                        <div className = "empty-state">
                            <p className = "empty-message">
                                You haven't saved any artwork. Saved pieces will appear here
                            </p>
                        </div>
                    ):(
                        <ArtworkGrid
                            artworks = {savedArtworks}
                            savedIds = {savedIds}
                            onToggleSave = {onToggleSave}
                        />
                    )}
                </section>
            </>
        )}
    </>
);
}