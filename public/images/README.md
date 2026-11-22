# Offline Met collection

Each `met-<objectID>.webp` is a compressed copy of the `primaryImageSmall`
published by The Metropolitan Museum of Art for that object. Only records
marked `isPublicDomain: true` in the European Paintings department are included.

The [catalog](../../src/data/met-paintings.json) lists the title, artist, credit
line, Met object page (`objectURL`), and original download URL for each file.
The app uses the bundled images only when the Met collection request fails.

[The Met's Open Access policy (CC0)](https://www.metmuseum.org/hubs/open-access)
