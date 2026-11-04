```javascript
const Parser = require("rss-parser");
const fs = require("fs");

const parser = new Parser();

const podcasts = JSON.parse(
    fs.readFileSync("podcasts.json", "utf8")
);

// Convierte la duración del RSS a segundos.
// Admite formatos como 180, 03:00 o 01:25:30.
function duracionEnSegundos(duracion) {

    if (!duracion) {
        return 0;
    }

    if (typeof duracion === "number") {
        return duracion;
    }

    const partes = String(duracion).split(":").map(Number);

    if (partes.some(Number.isNaN)) {
        return 0;
    }

    if (partes.length === 3) {
        return partes[0] * 3600 + partes[1] * 60 + partes[2];
    }

    if (partes.length === 2) {
        return partes[0] * 60 + partes[1];
    }

    if (partes.length === 1) {
        return partes[0];
    }

    return 0;
}

async function update() {

    for (const podcast of podcasts) {

        try {

            console.log("Leyendo:", podcast.name);

            const feed = await parser.parseURL(podcast.rss);

            if (!feed.items || feed.items.length === 0) {
                console.log("⚠ Sin episodios:", podcast.name);
                continue;
            }

            let latest;

            // Tratamiento especial para La Cultureta.
            if (podcast.name.toLowerCase().includes("cultureta")) {

                const episodiosLargos = feed.items
                    .filter(episodio =>
                        duracionEnSegundos(episodio.itunes?.duration) >= 45 * 60
                    )
                    .sort((a, b) =>
                        new Date(b.pubDate || 0) - new Date(a.pubDate || 0)
                    );

                if (episodiosLargos.length === 0) {

                    console.log("⚠ No hay episodios largos de La Cultureta. Se conserva el anterior.");
                    continue;

                }

                latest = episodiosLargos[0];

            } else {

                // Para el resto de podcasts, comportamiento original.
                latest = feed.items[0];

            }

            podcast.lastEpisode = {

                title: latest.title,

                date: latest.pubDate,

                audio: latest.enclosure?.url || "",

                webpage: latest.link,

                image: feed.image?.url || "",

                description: latest.contentSnippet || "",

                duration: latest.itunes?.duration || ""

            };

            console.log("✓ Actualizado:", podcast.name);

        } catch (error) {

            console.log("✗ Error leyendo:", podcast.name);
            console.log(error.message);

        }

    }

    fs.writeFileSync(
        "podcasts.json",
        JSON.stringify(podcasts, null, 2)
    );

    console.log("");
    console.log("Todo terminado.");

}

update();
```
