// AI-assisted - see AI-USAGE.md #9.
import { createContext } from "react";
import records from "./met-paintings.json";
import { toArtwork } from "../api/met.js";

// Keep the remote URL on saved pieces and boards, even when saved during an outage.
export const artworks = records.map(toArtwork);
export const offlineImages = new Map(artworks.map(({ id }) => [id, `/images/${id}.webp`]));
export const OfflineImagesContext = createContext(false);
