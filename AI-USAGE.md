


### #3 - Met.js in-memory cache
- **Date:** 2026-11-10
- **Member:** DJ Leamen
- **Tool / model:** GitHub Copilot (free - student)
- **Files:** `src/api/met.js`
- **Prompt (verbatim):**

  ```
  given met.js, add two in-memory caches so we don't repeat requests the app has already made. one for search results by query, and one for artwork details by id. search cache should remember which artwork ids each search returned, artwork cache should keeps each artwork after its details load, and errors should never be cached. retry search if request gets a 403 or network err
  ```

- **What it produced & what I changed:** It produced the `searchCache` and `objectCache` maps plus the lookups and writes in `searchIds` and the `fetchArtworks` detail loop. I kept the cache logic, read through it line by line to understand it, and added the comments. I removed the automatic retry it generated, errors are never cached so a failed search or artwork is simply requested again the next time it is needed.

### #4 - CollectionControls component
- **Date:** 2026-11-11
- **Member:** DJ Leamen
- **Tool / model:** GitHub Copilot (free - student)
- **Files:** `src/components/CollectionControls.jsx`
- **Prompt (verbatim):**

  ```
  given App.jsx, build a reusable and fully controlled collection controls component with no local state / api calls. props: searchInput, onSearchInputChange, onSearchSubmit, onClearSearch, activeQuery, era, onEraChange, movement, onMovementChange, movements, sortKey, onSortChange. include a role="search" form with an accessibly labeled, controlled search input (sensible placeholder and input limits per best practices) and a submit button, plus a "Clear search" button shown only when activeQuery is set that calls onClearSearch. add era and movement dropdowns (movement populated from the movements prop) and a "Sort by" dropdown with Relevance, Title (A–Z), Title (Z–A), Artist (A–Z), Date (oldest first), and Date (newest first). css classes are provided
  ```

- **What it produced & what I changed:** It produced the component and everything I asked for in it incl. the search form, the era / category dropdowns, and the sort. I kept the logic as generated, read through it to confirm it holds no state and doesn't use an API, and added the comments. Tested and validated.