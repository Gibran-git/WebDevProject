/*
helper component to display artwork images with a fallback 
placeholder if error occurs or image is missing
*/

import { useState } from "react";

// text placeholder instead of a broken-image icon
export default function ArtworkImage({ artwork, className, loading }) {
  const [failed, setFailed] = useState(false);

  if (failed || !artwork.imageUrl) {
    return (
      // show placeholder if image fails to load or is missing
      <div className={`image-placeholder ${className ?? ""}`.trim()} role="img" aria-label={artwork.title}> 
        Image unavailable
      </div>
    );
  }
  return (
    // show the actual image if it loads successfully
    <img
      src={artwork.imageUrl}
      alt={artwork.title}
      className={className}
      loading={loading}
      onError={() => setFailed(true)}
    />
  );
}
