// AI-assisted - see AI-USAGE.md #1.
import { useId } from "react";

export default function ArtistBio({ artist }) {
    const biographyId = useId();

    return (
        <section className="info-panel" aria-labelledby={`${biographyId}-heading`}>
            <p className="eyebrow">Behind the artwork</p>
            <h2 id={`${biographyId}-heading`}>About {artist.name}</h2>
            <p className="muted">{artist.nationality} · {artist.lifespan}</p>
            <p>{artist.summary}</p>
        </section>
    );
}
