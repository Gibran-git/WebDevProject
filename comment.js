const form = document.getElementById("comment-form");
const commentbox = document.getElementById("comment");
const errormessage = document.getElementById("comment-error");

form.addEventListener("submit", function (event) {
    const comment = commentbox.value.trim();

    if (comment.length < 1){
        event.preventDefault()
        errormessage.textContent = "Please enter a comment clicking submit.";
        return;
    }

    errormessage.textContent = "";
});

commentbox.addEventListener("input", function() {
    errormessage.textContent = "";
});