import { useEffect, useRef, useState } from "react";
import ArtworkImage from "./ArtworkImage.jsx";

const FIT = { scale: 1, x: 0, y: 0 };

export default function ArtworkViewer({ artwork, onClose }) {
    const dialogRef = useRef(null);
    const stageRef = useRef(null);
    const pointers = useRef(new Map());
    const [view, setView] = useState(FIT);
    const [dragging, setDragging] = useState(false);

    function constrain(next) {
        const stage = stageRef.current;
        const scale = Math.min(5, Math.max(1, next.scale));
        const limitX = (stage?.clientWidth ?? 0) * (scale - 1) / 2;
        const limitY = (stage?.clientHeight ?? 0) * (scale - 1) / 2;
        return {
            scale,
            x: Math.max(-limitX, Math.min(limitX, next.x)),
            y: Math.max(-limitY, Math.min(limitY, next.y)),
        };
    }

    function zoom(factor) {
        setView((previous) => constrain({ ...previous, scale: previous.scale * factor }));
    }

    useEffect(() => {
        const dialog = dialogRef.current;
        const stage = stageRef.current;
        const trigger = document.activeElement;
        const overflow = document.body.style.overflow;
        dialog.showModal();
        document.body.style.overflow = "hidden";
        function wheel(event) {
            event.preventDefault();
            const factor = Math.exp(-Math.max(-100, Math.min(100, event.deltaY)) * 0.003);
            setView((previous) => constrain({ ...previous, scale: previous.scale * factor }));
        }
        function resize() {
            setView((previous) => constrain(previous));
        }
        stage.addEventListener("wheel", wheel, { passive: false });
        window.addEventListener("resize", resize);
        return () => {
            stage.removeEventListener("wheel", wheel);
            window.removeEventListener("resize", resize);
            document.body.style.overflow = overflow;
            dialog.close();
            trigger?.focus();
        };
    }, []);

    function movePointer(event) {
        const previousPoint = pointers.current.get(event.pointerId);
        if (!previousPoint) return;
        const before = [...pointers.current.values()];
        pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
        const after = [...pointers.current.values()];
        if (after.length === 2) {
            const distance = (points) => Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);
            const oldDistance = distance(before);
            if (oldDistance > 0) zoom(distance(after) / oldDistance);
        } else if (after.length === 1) {
            setView((previous) => constrain({
                ...previous,
                x: previous.x + event.clientX - previousPoint.x,
                y: previous.y + event.clientY - previousPoint.y,
            }));
        }
    }

    function releasePointer(event) {
        pointers.current.delete(event.pointerId);
        setDragging(pointers.current.size > 0);
    }

    function handleKey(event) {
        if (event.key === "+" || event.key === "=") zoom(1.25);
        else if (event.key === "-") zoom(0.8);
        else if (event.key === "0") setView(FIT);
        else if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) {
            const dx = event.key === "ArrowLeft" ? 50 : event.key === "ArrowRight" ? -50 : 0;
            const dy = event.key === "ArrowUp" ? 50 : event.key === "ArrowDown" ? -50 : 0;
            setView((previous) => constrain({ ...previous, x: previous.x + dx, y: previous.y + dy }));
        } else return;
        event.preventDefault();
    }

    return (
        <dialog ref={dialogRef} className="artwork-viewer" aria-label={`${artwork.title} fullscreen viewer`}
            onCancel={(event) => { event.preventDefault(); onClose(); }} onKeyDown={handleKey}>
            <header className="viewer-header">
                <span>{artwork.title}</span>
                <button type="button" onClick={onClose} aria-label="Close fullscreen viewer">Close <span aria-hidden="true">×</span></button>
            </header>
            <div ref={stageRef} className={`viewer-stage${dragging ? " is-dragging" : ""}${view.scale > 1 ? " is-zoomed" : ""}`}
                onPointerDown={(event) => {
                    if (event.button !== 0) return;
                    event.currentTarget.setPointerCapture(event.pointerId);
                    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
                    setDragging(true);
                }}
                onPointerMove={movePointer} onPointerUp={releasePointer} onPointerCancel={releasePointer}
                onLostPointerCapture={releasePointer}
                onDoubleClick={() => setView(view.scale > 1 ? FIT : { ...FIT, scale: 2 })}>
                <div className="viewer-image" style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})` }}>
                    <ArtworkImage artwork={artwork} highResolution draggable={false} />
                </div>
            </div>
            <footer className="viewer-footer">
                <div className="viewer-tools" role="group" aria-label="Zoom controls">
                    <button type="button" aria-label="Zoom out" disabled={view.scale <= 1} onClick={() => zoom(0.8)}>−</button>
                    <output aria-label="Zoom level">{Math.round(view.scale * 100)}%</output>
                    <button type="button" aria-label="Zoom in" disabled={view.scale >= 5} onClick={() => zoom(1.25)}>+</button>
                    <button type="button" onClick={() => setView(FIT)}>Fit image</button>
                </div>
                <p>Scroll or pinch to zoom · Drag to explore · Esc to close</p>
            </footer>
        </dialog>
    );
}

