const Parser = require("rss-parser");
const fs = require("fs");

const parser = new Parser();

const podcasts = JSON.parse(
    fs.readFileSync("podcasts.json", "utf8")
);

// Convierte la duración del RSS a segundos.
function duracionEnSegundos(duracion) {

    if (!duracion) return 0;

    if (typeof duracion === "number") {
        return duracion;
    }

    const partes = String(duracion).split(":").map(Number);

    if (partes.some(Number.isNaN)) return 0;

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

// Devuelve el episodio más reciente que supera una duración mínima.
function buscarEpisodioLargo(episodios, duracionMinima) {

    return episodios
        .filter(episodio =>
            duracionEnSegundos(episodio.itunes?.duration) > duracionMinima
        )
        .sort((a, b) =>
            new Date(b.pubDate || 0) - new Date(a.pubDate || 0)
        )[0] || null;
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
            const nombre = podcast.name.toLowerCase();

            if (nombre.includes("cultureta")) {

                // La Cultureta: 45 minutos o más.
                latest = feed.items
                    .filter(episodio =>
                        duracionEnSegundos(episodio.itunes?.duration) >= 45 * 60
                    )
                    .sort((a, b) =>
                        new Date(b.pubDate || 0) - new Date(a.pubDate || 0)
                    )[0] || null;

            } else if (nombre.includes("sofá sonoro") || nombre.includes("sofa sonoro")) {

                // Sofá Sonoro: más de 30 minutos.
                latest = buscarEpisodioLargo(feed.items, 30 * 60);

            } else if (nombre.includes("de película") || nombre.includes("de pelicula")) {

                // De Película: más de 1 hora y 30 minutos.
                latest = buscarEpisodioLargo(feed.items, 90 * 60);

            } else {

                // Resto de podcasts: comportamiento original.
                latest = feed.items[0];

            }

            if (!latest) {

                console.log("⚠ No hay episodios que cumplan el filtro. Se conserva el anterior:", podcast.name);
                continue;

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
