// grab art images from https://api.artic.edu/docs/ for display in the art section

fetch('https://api.artic.edu/api/v1/artworks')
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error('Error fetching artworks:', error));

    const artSection = document.getElementById('art');
    fetch('https://api.artic.edu/api/v1/artworks')
        .then(response => response.json())
        .then(data => {
            data.data.forEach(artwork => {
                const listItem = document.createElement('li');
                const img = document.createElement('img');
                img.src = `https://www.artic.edu/iiif/2/${artwork.image_id}/full/200,/0/default.jpg`;
                img.alt = artwork.title;
                listItem.appendChild(img);
                listItem.appendChild(document.createTextNode(artwork.title));
                artList.appendChild(listItem);
            });
        })
        .catch(error => console.error('Error fetching artworks:', error));

        const artList = document.createElement('ul');
        artList.id = 'art';
        artSection.appendChild(artList);