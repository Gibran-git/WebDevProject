/*
helper component to display artwork images with a fallback
placeholder if error occurs or image is missing

updated for the new artwork shape: `imageUrl` -> `image`, and `title` -> `imageAlt`
for alt text. yet another rename I got to discover on my own :thumbs_up:
- DJ
*/

import { useState } from "react";

// text placeholder instead of a broken-image icon
export default function ArtworkImage({ artwork, className, ...imgProps }) {
  const [failed, setFailed] = useState(false);

  if (failed || !artwork.image) {
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
      src={artwork.image}
      alt={artwork.imageAlt || artwork.title}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
