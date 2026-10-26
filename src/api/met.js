/*
in dev, requests go thru the vite proxy (same origin, no CORS)
production builds call the met directly, sends Access-Control-Allow-Origin: *

keeping scope to european paintings only (for now) until we want to
expand, because department is being explicitly passed to the search api.

european paintings were selected because they represent a significant 
and well-documented portion of the met's collection, making it easier 
to fetch high-quality images / metadata
they also work with our year/era-based categorization scheme as other 
types of artworks may not fit as neatly.

TODO: still need to discuss future plans for non-painting artworks
e.g., sculptures, etc.
*/

const MET_BASE = import.meta.env.DEV ? "/api/met" : "https://collectionapi.metmuseum.org";
const API = `${MET_BASE}/public/collection/v1`;
const SEARCH_API = `${MET_BASE}/public/collection/v1.1/search`;

// european paintings department id is 11, grabbed from https://collectionapi.metmuseum.org/public/collection/v1/departments
const PAINTINGS_DEPT = 11;
// try to get variety across periods, results are de-duped
const DEFAULT_QUERIES = ["Impressionism", "Baroque", "Renaissance"];
const CONCURRENCY = 4;

// derive era from object's start date since we don't get a dedicated style/movement field
export function eraFromYear(year) {
  if (typeof year !== "number" || Number.isNaN(year)) return "Unknown";
  if (year < 1400) return "Medieval"; // pre-Renaissance
  if (year < 1600) return "Renaissance"; // 1400-1599
  if (year < 1750) return "Baroque"; // 1600-1749
  if (year < 1800) return "18th Century"; // 1750-1799
  if (year < 1900) return "19th Century"; // 1800-1899
  return "Modern"; // 1900+, contemporary
}

export function toArtwork(record) {
  // convert a met object record into our custom artwork format
  const bio = record.artistDisplayBio ? ` (${record.artistDisplayBio})` : ""; // include artist bio if available
  const artist = record.artistDisplayName || "Unknown artist"; // fallback if artist name is not available
  const details = [record.department, record.creditLine].filter(Boolean).join(". "); // combine department and credit line if available
  return {
    id: `met-${record.objectID}`,
    title: record.title || "Untitled", // fallback if title is not available
    artist,
    date: record.objectDate || "Undated", // fallback if object date is not available
    era: record.period || eraFromYear(record.objectBeginDate),
    medium: record.medium || "Unknown medium", // fallback if medium is not available
    imageUrl: record.primaryImageSmall,
    description: `${artist}${bio}.${details ? ` ${details}.` : ""}`, // combine artist, bio, and details into a description
  };
}

async function getJson(url, signal) {
  // fetch json from the given url, respecting abort signal
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`Met request failed (${res.status})`);
  return res.json();
}

async function searchIds(query, perQuery, signal) {
  // search for object ids matching the query
  const params = new URLSearchParams({
    q: query,
    hasImages: "true",
    departmentId: String(PAINTINGS_DEPT), // limited to those with images in the european paintings department
    limit: String(perQuery),
  });
  const json = await getJson(`${SEARCH_API}?${params}`, signal); // fetch search results
  return json.objectIDs || []; // 
}

export async function fetchArtworks({ queries = DEFAULT_QUERIES, perQuery = 12, limit = 24, signal } = {}) {
  // fetch artworks matching the given queries, respecting per-query and overall limits
  const idLists = await Promise.all(queries.map((q) => searchIds(q, perQuery, signal))); // fetch lists of ids for each query
  const longest = Math.max(0, ...idLists.map((list) => list.length)); // find the length of the longest list of ids
  const interleaved = Array.from({ length: longest }, (_, i) => idLists.map((list) => list[i])).flat(); // interleave the lists so that each query contributes evenly
  const ids = [...new Set(interleaved.filter((id) => id !== undefined))];

  // met has no fields= filter: each object is a separate/individual request, and bursts get rate-limited (403). fetch a few at a time and stop once we have enough
  const artworks = [];
  for (let i = 0; i < ids.length && artworks.length < limit; i += CONCURRENCY) {
    const batch = ids.slice(i, i + CONCURRENCY);
    // fetch details for the current batch of ids
    const results = await Promise.allSettled(batch.map((id) => getJson(`${API}/objects/${id}`, signal)));
    if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
    for (const r of results) {
      // one fail should not prevent other artworks from being added
      if (r.status === "fulfilled" && r.value.primaryImageSmall) artworks.push(toArtwork(r.value));
    }
  }

  if (artworks.length === 0 && ids.length > 0) {
    // error handling: no artworks could be loaded despite having ids
    throw new Error("Could not load any artwork details from the Met.");
  }
  return artworks.slice(0, limit);
}
