import {useId, useState} from "react";

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

export default function DiscussionThreads({artworkId, threads, onAddThread, onAddReply }){
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
                            <article className = "thread">
                                <h3>{thread.title}</h3>
                                <p className = "muted"> Started by {thread.author} </p>
                                <p>{thread.text}</p>
                                {thread.replies.length > 0 && (
                                    <ul className = "reply-list">
                                        {thread.replies.map((reply) => (
                                            <li key={reply.id}>
                                                <strong>{reply.author}</strong>: {reply.text}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                                <ReplyForm threadId = {thread.id} onAddReply = {onAddReply} />
                            </article>
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