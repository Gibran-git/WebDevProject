import { Link, NavLink } from "react-router";

export default function SiteHeader({ searchInput, onSearchInputChange, onSearchSubmit, onLogoClick}){
    function handleSubmit(event){
        event.preventDefault();
        onSearchSubmit();
    }
    // AI-assisted - see AI-USAGE.md #5
    return (
        <header className = "site-header">
            <div className = "header-content">
                <Link className = "brand" to="/" onClick={(event) => {
                    if (event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) onLogoClick();
                }}>
                    Exhibito <span aria-hidden = "true">.</span>
                </Link>
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
                    <NavLink
                        className = "nav-button"
                        to="/community"
                    >
                        Community boards
                    </NavLink>
                    <NavLink
                        className = "account-button"
                        to="/account"
                        aria-label = "Your account"
                    >
                        <svg width = "24" height = "24" viewBox = "0 0 24 24" fill = "none" stroke = "currentColor" strokeWidth = "1.8" aria-hidden = "true">
                            <circle cx = "12" cy = "8" r = "4" />
                            <path d = "M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" />
                        </svg>
                    </NavLink>
                </nav>
            </div>
        </header>
    );
}