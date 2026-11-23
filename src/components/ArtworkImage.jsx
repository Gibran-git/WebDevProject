/*
helper component to display artwork images with a fallback
placeholder if error occurs or image is missing
*/

import { useContext, useState } from "react";
import { OfflineImagesContext, offlineImages } from "../data/artworks.js";

// text placeholder instead of a broken-image icon
export default function ArtworkImage({ artwork, className, ...imgProps }) {
  const offline = useContext(OfflineImagesContext);
  const localSrc = offlineImages.get(artwork.id);
  // if the remote image fails, retry with the downloaded copy when we have one
  const candidates = [...new Set([offline && localSrc, artwork.image, localSrc].filter(Boolean))];
  const [failedSrcs, setFailedSrcs] = useState([]);
  const src = candidates.find((candidate) => !failedSrcs.includes(candidate));

  if (!src) {
    return (
      // show placeholder if image fails to load or is missing
      <div className={`image-placeholder ${className ?? ""}`.trim()} role="img" aria-label={artwork.imageAlt || artwork.title}>
        Image unavailable
      </div>
    );
  }
  return (
    // show the actual image if it loads successfully
    // imgProps passes through width/height/loading etc. so the card keeps its layout hints
    <img
      {...imgProps}
      src={src}
      alt={artwork.imageAlt || artwork.title}
      className={className}
      onError={() => setFailedSrcs((previous) => [...previous, src])}
    />
  );
}
