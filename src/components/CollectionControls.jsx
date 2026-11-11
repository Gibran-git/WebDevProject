// AI-assisted - see AI-USAGE.md #4.
/*
  controlled search form + era/category filters + sort.
  search box only hits the API on submit (not every keystroke) 
  b/c of Met rate-limits
*/

// era buckets in chronological order (centuries, not art movements)
const ERAS = ["Medieval", "Renaissance", "Baroque", "18th Century", "19th Century", "Modern", "Unknown"];

// sort options for the collection controls
const SORT_OPTIONS = [
    { value: "relevance", label: "Relevance" },
    { value: "title-asc", label: "Title (A–Z)" },
    { value: "title-desc", label: "Title (Z–A)" },
    { value: "artist-asc", label: "Artist (A–Z)" },
    { value: "date-asc", label: "Date (oldest first)" },
    { value: "date-desc", label: "Date (newest first)" },
];

// all eras and categories are included in the filters
export default function CollectionControls({
    searchInput,
    onSearchInputChange,
    onSearchSubmit,
    onClearSearch,
    activeQuery,
    era,
    onEraChange,
    movement,
    onMovementChange,
    movements,
    sortKey,
    onSortChange,
}) {
    function handleSubmit(event) {
        event.preventDefault(); // prevent default form submission
        onSearchSubmit();
    }

    return (
        <div className="collection-controls">
            <form className="search-form" role="search" onSubmit={handleSubmit}>
                {/* search input and buttons */}
                <label htmlFor="artwork-search">Search artworks</label>
                <div className="search-row">
                    <input
                        id="artwork-search"
                        type="search"
                        placeholder="Try “Monet”, “still life” or “portrait”" // example search suggestions
                        value={searchInput}
                        onChange={(event) => onSearchInputChange(event.target.value)} // call the provided handler when the input changes
                        maxLength={100}
                        autoComplete="off" // browsers like to suggest previous searches
                    />
                    <button className="primary-button" type="submit">Search</button>
                    {activeQuery && (
                        <button className="text-button" type="button" onClick={onClearSearch}>
                            Clear search
                        </button>
                    )}
                    {/* additional controls could go here if needed */}
                </div>
            </form>
            <div className="collection-filters">
                {/* collection filters section */}
                <div className="control">
                    <label htmlFor="era-filter">Era</label>
                    {/* era filter dropdown */}
                    <select id="era-filter" value={era} onChange={(event) => onEraChange(event.target.value)}>
                        <option value="All">All eras</option>
                        {ERAS.map((value) => <option key={value} value={value}>{value}</option>)}
                    </select>
                </div>
                <div className="control">
                    <label htmlFor="movement-filter">Category</label>
                    {/* category filter dropdown */}
                    <select
                        id="movement-filter"
                        value={movement}
                        onChange={(event) => onMovementChange(event.target.value)}
                    >
                        <option value="All">All categories</option>
                        {movements.map((value) => <option key={value} value={value}>{value}</option>)}
                    </select>
                </div>
                <div className="control">
                    {/* sort order dropdown */}
                    <label htmlFor="sort-order">Sort by</label>
                    <select id="sort-order" value={sortKey} onChange={(event) => onSortChange(event.target.value)}>
                        {SORT_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
}
