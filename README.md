# Exhibito - CSCI 3230U Group Project

## React foundation: catalog, artwork details & artist bios

This local demo combines the catalog/grid foundation from PR #23 with Sanhith's
artwork detail and bio slice. It uses Vite, React, and three local artwork records,
with movement filtering and in-memory save toggles. Search, persistent personal
boards, and React community features remain separate work.

### Run locally

Use Node.js 20.19+ or 22.12+ (supported LTS releases).

```bash
npm install
npm run dev
```

Open the Local URL printed by Vite. To check the production build, run
`npm run build`; `npm run preview` serves that build locally. Run `npm run lint`
to check the JavaScript and React code with ESLint.

### Quick demo

1. Save an artwork and point out the **Saved pieces** count.
2. Filter by each movement, then choose **All movements**. Hidden saved artworks
   still contribute to the saved count.
3. Open an artwork and point out its title, artist, medium, and dimensions.
4. Click **Read full bio**, then **Read less** to demonstrate React state.
5. Show the cultural context and **Enlarge image** / **Reset image** controls.
6. Go back: the filter and saved items are preserved. Unsave an artwork and show
   the count decrease. Open another work to show its artist's biography.

### Component structure

```text
App                         selection, movement filter, and saved IDs state
├── ArtworkGrid             filtered records, callbacks, and saved IDs props
│   └── ArtworkCard         artwork, onSelect, isSaved, onToggleSave props
└── ArtworkDetail           artwork + onBack props; image enlargement state
    └── ArtistBio           artist prop; expanded/collapsed biography state
```

`src/data/artworks.js` supplies the local records. Images are bundled in
`public/images/`, so the core demo requires no live API or internet connection
after installation. Changing views uses component state for this milestone;
URL routing, live data/loading/error handling, and further biography research
are future work. Save state lasts only while the app is open; refreshing resets
the filter and saved items. The museum record links require internet.

### Integration notes for the PR

This branch integrates [PR #23](https://github.com/Gibran-git/WebDevProject/pull/23)
and preserves its four original commits. The missing `ArtworkDetailModal` import
is replaced with the existing artwork detail view. The catalog uses one shared
data shape: `artist.name`, `image`, and `movement`. The duplicate mock dataset
and stylesheet have been retired; the demo uses the three complete local records.

The original `details.html`, `script.js`, and `styles.css` remain as prototype
references; the React app starts from `index.html` and uses `src/styles.css`.

### Artwork sources & assistance

Artwork metadata and public-domain images are from the Art Institute of Chicago:
[Seurat](https://www.artic.edu/artworks/27992),
[Van Gogh](https://www.artic.edu/artworks/28560), and
[Monet](https://www.artic.edu/artworks/16568).
Descriptions, bios, and context are short demo summaries, not museum quotations.
Bundled images use public-domain copies from Wikimedia Commons; see
[image credits](public/images/README.md) for the source of each file.

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
