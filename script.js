const artList = document.getElementById("art-list");

fetch("https://api.artic.edu/api/v1/artworks?limit=12&fields=id,title,artist_display,image_id")
    .then(response => response.json())
    .then(data => {

        const iiifUrl = data.config.iiif_url;

        data.data.forEach(artwork => {

            // Skip artwork if it doesn't have an image
            if (!artwork.image_id) {
                return;
            }

            const listItem = document.createElement("li");

            const img = document.createElement("img");

            img.src =
                `${iiifUrl}/${artwork.image_id}/full/400,/0/default.jpg`;

            img.alt = artwork.title || "Artwork";

            const title = document.createElement("h3");
            title.textContent = artwork.title;

            const artist = document.createElement("p");
            artist.textContent =
                artwork.artist_display || "Artist unknown";

            listItem.appendChild(img);
            listItem.appendChild(title);
            listItem.appendChild(artist);

            artList.appendChild(listItem);
        });
    })
    .catch(error => {
        console.error("Error fetching artworks:", error);
    });