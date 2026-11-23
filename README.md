# Exhibito - CSCI 3230U Group Project

## React application

Exhibito uses React and Vite to browse Met artworks, save pieces, manage personal
boards, and discuss individual artworks. The Met adapter supplies consistent
`met-<objectID>` artwork IDs. Live requests go directly to the Met; downloaded
Met records and images provide a fallback during outages.

### Run locally

Use Node.js 20.19+ or 22.12+, then run `npm install` and `npm run dev`.
Open the local URL printed by Vite. `npm run build` builds the app and
`npm run preview` serves that production build locally.

### Navigation

| URL | Page |
| --- | --- |
| `/` | Collection |
| `/met-436535` | Artwork detail (replace the ID with another Met artwork ID) |
| `/community` | Community boards |
| `/account` | Saved artworks and personal boards |
| `/boards/laura-colour` | Board detail (replace with a board ID) |

Artwork and board cards are links: they support new tabs, direct visits, reloads,
and browser Back/Forward. Artwork pages fetch their own record when it is not
already loaded. Invalid URLs and unavailable records show a recovery link;
temporary detail failures offer a retry or a matching downloaded artwork.

Search, filters, and sorting stay in memory while navigating and reset on reload.
Saved pieces, personal boards, and discussions persist in localStorage. A personal
board URL works only in a browser containing that board's data; it does not sync
boards between devices. Board editing stays on the account page, and leaving the
page discards unsaved edits.

### Validation and hosting

Run `npm test` for routing and API tests, `npm run lint` for ESLint, and
`npm run build` for the production build. Tests mock Met requests so they do not
rely on network availability.

Production hosting must serve `index.html` for application routes such as
`/met-436535` and `/boards/laura-colour`, while serving existing assets normally.
Configure an SPA fallback/rewrite on the chosen host; otherwise direct visits
and refreshes can return a server 404. No production host is configured here.

The React entry point is `src/main.jsx`. Shared state and route definitions live
in `src/App.jsx`, and routed detail loading lives in `src/components/RoutePages.jsx`.
The root-level HTML/CSS prototypes are not the active React application.

### Artwork sources & assistance

Artwork metadata and images come from The Metropolitan Museum of Art.
See [image credits](public/images/README.md) for the bundled collection.

AI assistance is recorded in [AI-USAGE.md](AI-USAGE.md). The existing
[course policy](ai-policy.md) marks M1-M2 as AI-free; disclosure does not override
that restriction.

## 1. Team Members & Roles
* **Member 1 Gibran** - *Role:* (Personal Boards Slice): Builds the Pinterest-style  grid, pin/unpin toggles, and persistent storage.
* **Member 2 DJ** - *Role:* (Search & Catalog Slice): Builds the catalog explorer, search/filtering across eras and categories, API fetching, and card grid layout.
* **Member 3 Sanhith** - *Role:* (Artwork Detail & Bio Slice): Builds the dynamic detail view with artist biographies, cultural context panels, and high-resolution image zoom.
* **Member 4 Brandon Dias** - *Role:* (Community Boards & Comments Slice): Builds the community board browser, board sharing links, and the controlled comment/discussion form.

## 2. Project Topic (Domain)
* **Domain:** Digital Museum & Fine Art Exhibition Browser
* **Overview:** A web application allowing users to search, explore, and curate public-domain artworks from major international cultural institutions.

## 3. Candidate Data Sources
* **Art Institute of Chicago API:** `https://api.artic.edu/docs/` 
* **The Metropolitan Museum of Art Collection API:** `https://metmuseum.github.io/` 
* **Cleveland Museum of Art Open Access API:** `https://openaccess-api.clevelandart.org/`
