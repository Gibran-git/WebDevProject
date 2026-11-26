/*
The Met API allows cross-origin requests, so development and production both
call it directly. This avoids sending localhost request state through a proxy,
which the Met's edge protection can reject with a 403.

keeping scope to european paintings only (for now) until we want to
expand, because department is being explicitly passed to the search api.

european paintings were selected because they represent a significant
and well-documented portion of the met's collection, making it easier
to fetch high-quality images / metadata
they also work with our year/era-based categorization scheme as other
types of artworks may not fit as neatly.

NEW: re-ported onto the new data shape from PR #23/#24 
(artist objects,`image`/`imageAlt`, `movement`, `context`, etc.)
for the record: `era` got swapped out for `movement` during the #23 merge
and nobody told me. found out when my cherry-pick exploded.
"Replaces the missing ArtworkDetailModal" is NOT a description of
"also changed the whole artwork schema". please mention schema changes in
the PR description next time folks

- DJ
*/

/* TODO: still need to discuss future plans for 
non-painting artworks e.g., sculptures, etc. */

const MET_BASE = "https://collectionapi.metmuseum.org";
const API = `${MET_BASE}/public/collection/v1`;
const SEARCH_API = `${MET_BASE}/public/collection/v1.1/search`;

export const MET_MUSEUM_NAME = "The Metropolitan Museum of Art";

// european paintings department id is 11, grabbed from https://collectionapi.metmuseum.org/public/collection/v1/departments
const PAINTINGS_DEPT = 11;
// try to get variety across periods, results are de-duped
const DEFAULT_QUERIES = ["Impressionism", "Baroque", "Renaissance"];
const CONCURRENCY = 4;

// derive an era from a start year (the met has no style/movement field for european paintings)
export function eraFromYear(year) {
    if (typeof year !== "number" || Number.isNaN(year)) return "Unknown";
    if (year < 1400) return "Medieval"; // pre-Renaissance
    if (year < 1600) return "Renaissance"; // 1400-1599
    if (year < 1750) return "Baroque"; // 1600-1749
    if (year < 1800) return "18th Century"; // 1750-1799
    if (year < 1900) return "19th Century"; // 1800-1899
    return "Modern"; // 1900+, contemporary
}
// Search results can claim to have images even when their detail record has no
// displayable image. Scan a page at a time and cap the work at three pages.
const SEARCH_PAGE_SIZE = 100;
const MAX_SEARCH_PAGES = 3;

/*
the met doesn't give us a dedicated style/movement field (`period` is almost always
blank for european paintings), so:
- `era` is derived from the object's start date (see src/utils/collection.js)
- `movement` uses `period` when the met has one, otherwise the artist's national school
  (e.g. "French painting"), which is how the met itself groups european paintings
*/
function movementOf(record) {
  if (record.period) return record.period;
  // nationality can be pipe-separated ("French|Dutch"), keep the first one
  const nationality = record.artistNationality?.split("|")[0].trim();
  return nationality ? `${nationality} painting` : "European painting";
}

// "1853" + "1890" -> "1853–1890", tolerate either side being missing
function lifespanOf(record) {
  const start = record.artistBeginDate?.trim();
  const end = record.artistEndDate?.trim();
  if (start && end) return `${start}–${end}`;
  return start || end || "Dates unknown";
}

export function toArtwork(record) {
  // convert a met object record into the new artwork shape from src/data/artworks.js
  const name = record.artistDisplayName || "Unknown artist"; // fallback if artist name is not available
  const title = record.title || "Untitled"; // fallback if title is not available
  const details = [record.department, record.classification].filter(Boolean).join(" · ");

  return {
    id: `met-${record.objectID}`,
    title,
    date: record.objectDate || "Undated", // fallback if object date is not available
    medium: record.medium || "Unknown medium", // fallback if medium is not available
    dimensions: record.dimensions || "Dimensions unavailable",
    movement: movementOf(record), // determine the artistic movement or fallback to nationality-based description
    year: typeof record.objectBeginDate === "number" ? record.objectBeginDate : null, // extract the year from the object begin date if available
    era: eraFromYear(record.objectBeginDate), // backward-compatible era determination based on the object begin date
    image: record.primaryImageSmall,
    fullImage: record.primaryImage || record.primaryImageSmall,
    // the met doesn't provide alt text, so this is the best we can do without writing it by hand
    imageAlt: `${title} by ${name}`,
    description: `${title} by ${name}${record.objectDate ? `, ${record.objectDate}` : ""}.`,
    // the met has no curated "cultural context" text; show what we do know instead of making things up
    context: details
      ? `Held in the Met's ${details} collection.`
      : "No additional context is available for this work.",
    credit: record.creditLine || "",
    sourceUrl: record.objectURL || "https://www.metmuseum.org/art/collection",
    museum: MET_MUSEUM_NAME,
    artist: {
      name,
      lifespan: lifespanOf(record),
      nationality: record.artistNationality || "Nationality unknown",
      // no written bios from the met, so artistDisplayBio is the closest thing
      // (e.g. "Dutch, Zundert 1853–1890 Auvers-sur-Oise")
      summary: record.artistDisplayBio ? `${name} (${record.artistDisplayBio}).` : `${name}.`,
      biography: "A full biography isn't available from the Met's collection API for this artist yet.",
    },
  };
}

/* AI-assisted - see AI-USAGE.md #3.
  in-memory caches (live until the page reloads), so repeat 
  work doesn't hit the met's rate limit again:
  - searchCache: search query -> object ids. re-running a search or 
    clearing it back to the presets is free
  - objectCache: object id -> artwork (or null if it has no image). 
    each artwork's details are fetched once, even if it shows up 
    again in a different search
  
  only successful responses are cached. a 403 / network error is temporary, 
  so that id is tried again next time. images don't need this: the browser's 
  http cache already keeps them.
 */
const searchCache = new Map(); // search query -> object ids
const objectCache = new Map(); // object id -> artwork (or null if it has no image)

async function getJson(url, signal) {
  // fetch json from the given url, respecting abort signal
  const res = await fetch(url, { signal });
  if (!res.ok) {
    const error = new Error(`Met request failed (${res.status})`);
    error.status = res.status;
    throw error;
  }
  return res.json();
}

export async function fetchArtworkById(artworkId, { signal } = {}) {
  if (!/^met-\d+$/.test(artworkId)) return null;
  const objectId = Number(artworkId.slice(4));
  if (!Number.isSafeInteger(objectId) || objectId <= 0) return null;
  if (objectCache.has(objectId)) return objectCache.get(objectId);
  try {
    const record = await getJson(`${API}/objects/${objectId}`, signal);
    const artwork = record.primaryImageSmall ? toArtwork(record) : null;
    objectCache.set(objectId, artwork);
    return artwork;
  } catch (error) {
    if (error.status === 404) return null;
    throw error;
  }
}

async function searchIds(query, limit, offset, signal) {
  // search for object ids matching the query (cached by query, case-insensitive)
  // AI-assisted (cache lookup + store below) - see AI-USAGE.md #3
  const cacheKey = `${query.toLowerCase()}|${limit}|${offset}`; // cache key for the requested result page
  if (searchCache.has(cacheKey)) return searchCache.get(cacheKey); // return cached ids if available
  const params = new URLSearchParams({
    q: query,
    hasImages: "true",
    departmentId: String(PAINTINGS_DEPT), // limited to those with images in the european paintings department
    limit: String(limit),
    offset: String(offset),
  });
  const json = await getJson(`${SEARCH_API}?${params}`, signal); // fetch search results
  const ids = json.objectIDs || []; // extract object ids from the search results
  searchCache.set(cacheKey, ids); // cache the ids for this query
  return ids;
}

/*
  pagination implementation below
  important note.. the met can't tell us up front which search hits have a usable
  image, so eg "page 3" can't be computed as an offset. instead each call returns
  a nextCursor ({ page, index } = search page + position inside it) that says
  where it stopped scanning, and the next call resumes from there. pass cursor
  back in to get the next page; nextCursor is null once the met runs out
*/
export async function fetchArtworks({ query = "", limit = 24, cursor = null, timeBudgetMs = Infinity, signal } = {}) {
  const startedAt = Date.now();
  // a user search replaces the preset queries; an empty search falls back to the presets for variety
  const trimmed = query.trim(); // remove leading/trailing whitespace from the query
  const queries = trimmed ? [trimmed] : DEFAULT_QUERIES; // use user query or fallback to default queries
  const perQuery = Math.ceil(SEARCH_PAGE_SIZE / queries.length); // number of ids to fetch per query from each search page
  async function candidateIds(page) {
    const offset = page * perQuery;
    const idLists = await Promise.all(queries.map((q) => searchIds(q, perQuery, offset, signal)));
    const longest = Math.max(0, ...idLists.map((list) => list.length));
    const interleaved = Array.from({ length: longest }, (_, index) => idLists.map((list) => list[index])).flat();
    return {
      ids: [...new Set(interleaved.filter((id) => id !== undefined))],
      // every query came back short, so there's no further search page to ask for
      isLast: idLists.every((list) => list.length < perQuery),
    };
  }

  const startPage = cursor?.page ?? 0;
  let page = startPage;
  let { ids, isLast } = await candidateIds(page);
  let i = Math.min(cursor?.index ?? 0, ids.length);
  let detailError;
  let exhausted = false;

  // met has no fields= filter: each object is a separate/individual request, and bursts get rate-limited (403). fetch a few at a time and stop once we have enough
  // each entry remembers where its id sat so the cursor can resume right after the last one we return
  const found = [];
  const seen = new Set(); // different preset queries can return the same painting on different search pages
  const add = (artwork, at) => {
    if (!artwork || seen.has(artwork.id)) return;
    seen.add(artwork.id);
    found.push({ artwork, page, index: at });
  };
  while (found.length < limit) {
    if (i >= ids.length) {
      if (isLast || ids.length === 0) {
        exhausted = true;
        break;
      }
      // cap the search pages scanned per call; the cursor picks up from the next one
      if (page + 1 - startPage >= MAX_SEARCH_PAGES) {
        page += 1;
        i = 0;
        break;
      }
      page += 1;
      ({ ids, isLast } = await candidateIds(page));
      i = 0;
      continue;
    }
    // AI-assisted (objectCache reads/writes in this loop) - see AI-USAGE.md #3
    // already-loaded artworks come straight from the cache, no request needed
    if (objectCache.has(ids[i])) {
      add(objectCache.get(ids[i]), i);
      i += 1;
      continue;
    }
    // when met is throttling us, return what we already have instead of timing out with nothing
    if (found.length > 0 && Date.now() - startedAt > timeBudgetMs) break;
    // the next run of up to CONCURRENCY uncached ids, kept in order
    const batchStart = i;
    const batch = [];
    while (i < ids.length && batch.length < CONCURRENCY && !objectCache.has(ids[i])) batch.push(ids[i++]);
    const results = await Promise.allSettled(batch.map((id) => getJson(`${API}/objects/${id}`, signal)));
    if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
    results.forEach((r, index) => {
      // one fail should not prevent other artworks from being added
      if (r.status !== "fulfilled") {
        detailError = r.reason;
        return;
      }
      const artwork = r.value.primaryImageSmall ? toArtwork(r.value) : null;
      objectCache.set(batch[index], artwork);
      add(artwork, batchStart + index);
    });
  }

  if (found.length === 0 && detailError) throw detailError;

  // a batch can overshoot the limit; the extras are cached, and the cursor
  // points just past the last artwork we actually return so none are skipped
  const returned = found.slice(0, limit);
  let nextCursor = { page, index: i };
  if (found.length > limit) {
    const last = returned[returned.length - 1];
    nextCursor = { page: last.page, index: last.index + 1 };
  } else if (exhausted || (isLast && i >= ids.length)) {
    nextCursor = null;
  }
  return { artworks: returned.map((entry) => entry.artwork), nextCursor };
}
