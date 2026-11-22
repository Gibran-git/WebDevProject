import {useId, useState} from "react";
import OptionsMenu from "./OptionsMenu.jsx";

const MAX_TITLE = 100;
const MAX_TEXT = 500;

function ReplyForm({ threadId, onAddReply }) {
    const [reply, setReply] = useState("");
    const [error, setError] = useState("");
    const replyId = useId();

    function handleSubmit(event){
        event.preventDefault();
        const text = reply.trim();
        if(text.length < 1){
            setError("Please enter a reply before trying to post");
            return;
        }
        onAddReply(threadId, text);
        setReply("");
    }
    return (
        <form className = "thread-form" onSubmit = {handleSubmit}>
            <label htmlFor = {replyId}> Reply </label>
            <textarea
                id = {replyId}
                rows = "2"
                maxLength = {MAX_TEXT}
                value = {reply}
                onChange = {(event) => {setReply(event.target.value); setError(""); }}
            />
            <p className = "error" role = "alert" > {error} </p>
            <button className = "primary-button" type = "submit"> Post reply </button>
        </form>
    );
}

function EditForm({ initialTitle, initialText, onSave, onCancel }){
    const [title, setTitle] = useState(initialTitle ?? "");
    const [text, setText] = useState(initialText);
    const [error, setError] = useState("");
    const editId = useId();
    const hasTitle = initialTitle !== undefined;

    function handleSubmit(event){
        // AI-assisted - see AI-USAGE.md #7
        event.preventDefault();
        if((hasTitle && title.trim().length < 1) || text.trim().length < 1){
            setError(hasTitle ? "Please enter a title and message" : "Please enter a reply");
            return;
        }
        onSave(title.trim(), text.trim());
    }
    return (
        <form className = "thread-form" onSubmit = {handleSubmit}>
            {hasTitle && (
                <>
                    <label htmlFor = {`${editId}-title`}>Title</label>
                    <input
                        id = {`${editId}-title`}
                        type = "text"
                        maxLength = {MAX_TITLE}
                        value = {title}
                        onChange = {(event) => {setTitle(event.target.value); setError("");}}
                    />
                </>
            )}
            <label htmlFor = {`${editId}-text`}>{hasTitle ? "Message" : "Reply"} </label>
            <textarea
                id = {`${editId}-text`}
                rows = {hasTitle ? "4" : "2"}
                maxLength = {MAX_TEXT}
                value = {text}
                onChange = {(event) => {setText(event.target.value); setError("");}}
            />
            <p className = "error" role = "alert">{error}</p>
            <div className = "form-actions">
                <button className = "primary-button" type = "submit">Save</button>
                <button className = "text-button" type = "button" onClick = {onCancel}>Cancel</button>
            </div>
        </form>
    );
}

function Thread ({thread, onAddReply, onEditThread, onDeleteThread, onEditReply, onDeleteReply}){
    const [editing, setEditing] = useState(false);
    const [editingReplyId, setEditingReplyId] = useState(null);
// AI-assisted - see AI-USAGE.md #7
    return (
        <article className = "thread">
            {editing ? (
                <EditForm
                    initialTitle = {thread.title}
                    initialText = {thread.text}
                    onSave = {(title, text)=> {onEditThread(thread.id, title, text); setEditing(false);}}
                    onCancel = {() => setEditing(false)}
                />
            ):(
                <>
                <div className = "post-header">
                    <h3>{thread.title}</h3>
                    {thread.author === "You" && (
                        <OptionsMenu name = "thread" onEdit = {() => setEditing(true)} onDelete = {() => onDeleteThread(thread.id)} />
                    )}
                </div>
                <p className = "muted">Started by {thread.author}</p>
                <p>{thread.text}</p>
                </>
            )}
            {thread.replies.length > 0 && (
                <ul className = "reply-list">
                    {thread.replies.map((reply) => (
                        <li key = {reply.id}>
                            {editingReplyId === reply.id ? (
                                <EditForm
                                    initialText = {reply.text}
                                    onSave = {(title, text) => {onEditReply(thread.id, reply.id, text); setEditingReplyId(null);}}
                                    onCancel = {() => setEditingReplyId(null)}
                                />
                            ):(
                                <div className = "post-header">
                                    <span><strong>{reply.author}</strong> : {reply.text}</span>
                                    {reply.author === "You" && (
                                        <OptionsMenu name = "reply" onEdit = {() => setEditingReplyId(reply.id)} onDelete = {() => onDeleteReply(thread.id, reply.id)} />
                                    )}
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            )}
            <ReplyForm threadId = {thread.id} onAddReply = {onAddReply} />
        </article>
    );
}

export default function DiscussionThreads({artworkId, threads, onAddThread, onAddReply, onEditThread, onDeleteThread, onEditReply, onDeleteReply }){
    const [title, setTitle] = useState("");
    const [text, setText] = useState("");
    const [error, setError] = useState("");
    const formId = useId();

    function handleSubmit(event){
        event.preventDefault();
        if(title.trim().length < 1 || text.trim().length < 1){
            setError("Please enter a title and message to start a thread");
            return;
        }
        onAddThread(artworkId, title.trim(), text.trim());
        setTitle("");
        setText("");
        setError("");
    }
    
    return (
        <section className = "discussion" aria-labelledby = {`${formId}-heading`}>
            <h2 id = {`${formId}-heading`}> Discussion </h2>
            {threads.length === 0 ? (
                <p className = "empty-message"> No threads posted </p>
            ):(
                <ul className = "thread-list">
                    {threads.map((thread) => (
                        <li key = {thread.id}>
                            <Thread
                                thread = {thread}
                                onAddReply = {onAddReply}
                                onEditThread = {onEditThread}
                                onDeleteThread = {onDeleteThread}
                                onEditReply = {onEditReply}
                                onDeleteReply = {onDeleteReply}
                            />
                        </li>
                    ))}
                </ul>
            )}
            <form className = "thread-form" onSubmit = {handleSubmit}>
                <h3>Start a thread</h3>
                <label htmlFor = {`${formId}-title`}>Title</label>
                <input
                    id = {`${formId}-title`}
                    type = "text"
                    maxLength = {MAX_TITLE}
                    value = {title}
                    onChange = {(event) => {setTitle(event.target.value); setError("");}}
                />
                <label htmlFor = {`${formId}-text`}>Message</label>
                {/* AI-assisted - see AI-USAGE.md #5 */}
                <textarea
                    id = {`${formId}-text`}
                    rows = "4"
                    maxLength = {MAX_TEXT}
                    value = {text}
                    onChange = {(event) => {setText(event.target.value); setError(""); }}
                />
                <p className = "helper">Title up to {MAX_TITLE} characters, message up to {MAX_TEXT}</p>
                <p className = "error" role = "alert">{error}</p>
                <button className = "primary-button" type = "submit">Start thread</button>
                </form>
        </section>
    );
}