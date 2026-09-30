**TOPIC:**

We are going to create a digital museum archive website using the Art Institute of Chicago API. It will be an online exhibition for paintings, sculptures, and artifacts across different time periods. We will allow users to create Pinterest-like boards and filter art pieces by specific eras. We will provide detailed information about the actual pieces, their artists, and their acquisition history. It also allows users to create their own virtual rooms based on their tastes, which others can view and review.


**DATA SOURCE**

We will be using the Art Institute of Chicago API. This API returns JSON, which will give a variety of details we can use, such as the title, artist, date, and medium. dimensions, image ID, description, etc.

A sample of the artwork data shape would look like:

{
  "data": {
    "id": 27992,
    "title": "A Sunday on La Grande Jatte — 1884",

    "artist_id": 4115,
    "artist_title": "Georges Seurat",

    "date_display": "1884–1886",
    "date_start": 1884,
    "date_end": 1886,

    "artwork_type_title": "Painting",

    "medium_display": "Oil on canvas",

    "dimensions": "207.6 × 308 cm",

    "description": "A large painting depicting people relaxing...",
    "short_description": "A famous example of Neo-Impressionism.",

    "department_title": "Modern Art",

    "classification_title": "painting",

    "style_title": "Post-Impressionism",

    "credit_line": "Helen Birch Bartlett Memorial Collection",

    "main_reference_number": "1926.224",

    "image_id": "2d484387-2509-5e8e-2c43-22f9981972eb"
  },

  "config": {
    "iiif_url": "https://www.artic.edu/iiif/2"
  }
}

**COMPETITORS**

1: Google Arts and Culture: https://artsandculture.google.com/

2: Europeana: https://www.europeana.eu/en?utm_source=chatgpt.com

3: The MET Collection: https://www.metmuseum.org/art/collection?utm_source=chatgpt.com

These other websites focus on very similar things to ours; they are all digital museum archives that provide detailed information about the artwork and allow for virtual viewing experiences. However, they don't offer the same social and interactive features our website does. As in, they don't allow users to create their own collections and rooms based on their own tastes that other users can view and review.
