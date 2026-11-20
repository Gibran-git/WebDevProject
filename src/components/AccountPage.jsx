import ArtworkGrid from "./ArtworkGrid.jsx";

// AI-assisted - see AI-USAGE.md #5
export default function AccountPage({ savedArtworks, savedIds, onSelectArtwork, onToggleSave, headingRef}){
    return (
        <>
            {/* AI-assisted - see AI-USAGE.md #5 */}
            <section className = "collection-intro" aria-labelledby = "account-heading">
                <p className = "eyebrow"> Your account </p>
                <h1 id = "account-heading" ref = {headingRef} tabIndex = "-1"> Your saved art </h1>
                <p> Everything you have saved while browsing. Saved pieces will reset when the page is refreshed </p>
            </section>
            { savedArtworks.length === 0 ? (
                <div className = "empty-state">
                    <p className = "empty-message">
                        You haven't saved any artwork yet. Save a piece from a collection and it will show up here
                    </p>
                </div>
            ):(
                <ArtworkGrid
                    artworks = {savedArtworks}
                    savedIds = {savedIds}
                    onSelectArtwork = {onSelectArtwork}
                    onToggleSave = {onToggleSave}
                />
            )}
        </>
    );
}