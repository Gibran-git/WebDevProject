import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router";
import { fetchArtworkById } from "../api/met.js";
import { artworks as localArtworks, OfflineImagesContext } from "../data/artworks.js";
import ArtworkDetail from "./ArtworkDetail.jsx";
import CommunityBoards from "./CommunityBoards.jsx";

function usePageHeading(title) {
    const headingRef = useRef(null);
    useEffect(() => {
        headingRef.current?.focus();
        document.title = `${title} | Exhibito`;
    }, [title]);
    return headingRef;
}

export function NotFound({ title = "Page not found" }) {
    const headingRef = usePageHeading(title);
    return (
        <section className="collection-intro">
            <h1 ref={headingRef} tabIndex="-1">{title}</h1>
            <p>This page is unavailable. Boards you create are stored on this browser.</p>
            <Link to="/">Back to collection</Link>
        </section>
    );
}

export function BoardRoute({ boards, ...props }) {
    const { boardId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const board = boards.find((item) => String(item.id) === boardId);
    if (!board) return <NotFound title="Board not found" />;
    const origin = location.state?.from;
    const backTo = origin === "/account" || origin === "/community"
        ? origin : board.owner === "You" ? "/account" : "/community";
    return (
        <CommunityBoards
            {...props}
            boards={boards}
            selectedBoard={board}
            onSelectBoard={() => navigate(backTo)}
            backLabel={backTo === "/account" ? "your account" : "community boards"}
        />
    );
}

export function ArtworkRoute(props) {
    const { artworkId } = useParams();
    if (!/^met-\d+$/.test(artworkId)) return <NotFound />;
    return <ArtworkPage key={artworkId} artworkId={artworkId} {...props} />;
}

function ArtworkPage({ artworkId, artworks, savedArtworks, boards, collectionOffline, threads, ...detailProps }) {
    const location = useLocation();
    const navigate = useNavigate();
    const [result, setResult] = useState(() => {
        const artwork = artworks.find((item) => item.id === artworkId)
            ?? savedArtworks.find((item) => item.id === artworkId)
            ?? boards.flatMap((board) => board.artworks ?? []).find((item) => item.id === artworkId);
        return artwork ? {
            artwork,
            offline: location.state?.offline ?? (collectionOffline && artworks.includes(artwork)),
            status: "ready",
        } : { status: "loading" };
    });
    const [attempt, setAttempt] = useState(0);
    const needsFetch = result.status === "loading";
    const title = result.artwork?.title ?? (needsFetch ? "Loading artwork..." : "Artwork unavailable");
    const headingRef = usePageHeading(title);

    useEffect(() => {
        if (!needsFetch) return;
        const controller = new AbortController();
        const signal = AbortSignal.any([controller.signal, AbortSignal.timeout(12000)]);
        fetchArtworkById(artworkId, { signal }).then((artwork) => {
            if (!controller.signal.aborted) {
                setResult(artwork ? { status: "ready", artwork, offline: false } : { status: "missing" });
            }
        }).catch(() => {
            if (controller.signal.aborted) return;
            const artwork = localArtworks.find((item) => item.id === artworkId);
            setResult(artwork ? { status: "ready", artwork, offline: true } : { status: "error" });
        });
        return () => controller.abort();
    }, [artworkId, attempt, needsFetch]);

    const origin = location.state?.from;
    const backTo = typeof origin === "string" && /^\/(?:account|community|boards\/[^/]+)?$/.test(origin)
        ? origin : "/";
    const backLabel = backTo.startsWith("/boards/") ? "board"
        : backTo === "/account" ? "your account"
            : backTo === "/community" ? "community boards" : "collection";
    const goBack = () => navigate(backTo, { state: location.state?.originState });

    if (result.status === "missing") return <NotFound title="Artwork unavailable" />;
    if (result.status !== "ready") {
        return (
            <section className="collection-intro" aria-busy={needsFetch}>
                <h1 ref={headingRef} tabIndex="-1">{title}</h1>
                <p role={needsFetch ? "status" : "alert"}>
                    {needsFetch ? "Fetching this artwork from the Met." : "Couldn't reach the Met. Please try again."}
                </p>
                {result.status === "error" && (
                    <button type="button" onClick={() => {
                        setResult({ status: "loading" });
                        setAttempt((value) => value + 1);
                    }}>Try again</button>
                )}
                <Link to={backTo} state={location.state?.originState}>Back to {backLabel}</Link>
            </section>
        );
    }
    return (
        <OfflineImagesContext.Provider value={result.offline}>
            {result.offline && <p className="status-notice" role="status">Showing a downloaded Met artwork.</p>}
            <ArtworkDetail
                {...detailProps}
                artwork={result.artwork}
                threads={threads.filter((thread) => thread.artworkId === artworkId)}
                headingRef={headingRef}
                onBack={goBack}
                backLabel={backLabel}
            />
        </OfflineImagesContext.Provider>
    );
}
