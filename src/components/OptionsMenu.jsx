import {useEffect, useId, useRef, useState} from "react";

function ConfirmDialog ({name, onConfirm, onCancel}){
    const dialogRef = useRef(null);
    const headingId = useId();

    useEffect(() => {
        const dialog = dialogRef.current;
        if(!dialog.open) dialog.showModal();
    }, []);

    return (
        <dialog
            className = "confirm-dialog"
            ref = {dialogRef}
            aria-labelledby = {headingId}
            onClose = {onCancel}
            onClick = {(event) => event.target === event.currentTarget && dialogRef.current.close()}
        >

            <div className = "confirm-body">
                <h2 id = {headingId}>Are you sure you want to delete this {name}?</h2>
                <p>This can't be undone</p>
                <div className = "form-actions">
                    <button className = "text-button" type = "button" onClick = {() => dialogRef.current.close()}>Cancel</button>
                    <button className = "danger-button" type = "button" onClick = {onConfirm}>Delete</button>
                </div>
            </div>
        </dialog>
    );
}

export default function OptionsMenu({ name, onEdit, onDelete }){
    const [open, setOpen] = useState(false);
    const [confirming, setConfirming] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        if(!open) return;
        function handleClickOutside(event){
            if(!menuRef.current.contains(event.target)) setOpen(false);
        }
        function handleKeyDown(event){
            if(event.key === "Escape") setOpen(false);
        }
        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [open]);

    function handleEdit(){
        setOpen(false);
        onEdit();
    }

    function handleDelete(){
        setOpen(false);
        setConfirming(true);
    }

    function handleConfirm(){
        setConfirming(false);
        onDelete();
    }

// AI-assisted - see AI-USAGE.md #7
    return (
        <div className = "options-menu" ref = {menuRef}>
            <button 
                className = "options-button"
                type = "button"
                aria-label = {`options for this ${name}`}
                aria-expanded = {open}
                onClick = {() => setOpen((isOpen) => !isOpen)}
            >
                <span aria-hidden = "true">...</span>
            </button>
            {open && (
                <div className = "options-list">
                    <button type = "button" onClick = {handleEdit}>Edit</button>
                    <button type = "button" onClick = {handleDelete}>Delete</button>
                </div>
            )}
            {confirming && <ConfirmDialog name = {name} onConfirm = {handleConfirm} onCancel = {() => setConfirming(false)} />}
        </div>
    );
}