// AI-assisted - see AI-USAGE.md #1.
import { useId, useState } from "react";

export default function ArtistBio({ artist }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const biographyId = useId();

    return (
        <section className="info-panel" aria-labelledby={`${biographyId}-heading`}>
            <p className="eyebrow">Behind the artwork</p>
            <h2 id={`${biographyId}-heading`}>About {artist.name}</h2>
            <p className="muted">{artist.nationality} · {artist.lifespan}</p>
            <p>{artist.summary}</p>
            <p id={biographyId} hidden={!isExpanded}>{artist.biography}</p>
            <button
                className="text-button"
                type="button"
                aria-expanded={isExpanded}
                aria-controls={biographyId}
                onClick={() => setIsExpanded((expanded) => !expanded)}
            >
                {isExpanded ? "Read less" : "Read full bio"}
                <span aria-hidden="true"> {isExpanded ? "−" : "+"}</span>
            </button>
        </section>
    );
}
