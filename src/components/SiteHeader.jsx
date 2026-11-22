export default function SiteHeader({ searchInput, onSearchInputChange, onSearchSubmit, view, onShowView, onLogoClick}){
    function handleSubmit(event){
        event.preventDefault();
        onSearchSubmit();
    }
    // AI-assisted - see AI-USAGE.md #5
    return (
        <header className = "site-header">
            <div className = "header-content">
                <button className = "brand" type = "button" onClick = {onLogoClick}>
                    Exhibito <span aria-hidden = "true">.</span>
                </button>
                <nav className = "header-nav" aria-label = "Main">
                    <form className = "header-search" role = "search" onSubmit = {handleSubmit}>
                        <input
                            type = "search"
                            aria-label = "Search artworks"
                            placeholder = "Search artworks"
                            value = {searchInput}
                            onChange = {(event) => onSearchInputChange(event.target.value)}
                            maxLength = {100}
                            autoComplete = "off"
                        />
                        <button className = "primary-button" type = "submit">Search</button>
                    </form>
                    {/* AI-assisted - see AI-USAGE.md #5 */}
                    <button
                        className = "nav-button"
                        type = "button"
                        aria-current = {view === "community" ? "page" : undefined}
                        onClick = {() => onShowView("community")}
                    >
                        Community boards
                    </button>
                    <button
                        className = "account-button"
                        type = "button"
                        aria-label = "Your account"
                        aria-current = {view === "account" ? "page" : undefined}
                        onClick = {() => onShowView("account")}
                    >
                        <svg width = "24" height = "24" viewBox = "0 0 24 24" fill = "none" stroke = "currentColor" strokeWidth = "1.8" aria-hidden = "true">
                            <circle cx = "12" cy = "8" r = "4" />
                            <path d = "M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" />
                        </svg>
                    </button>
                </nav>
            </div>
        </header>
    );
}