const Parser = require("rss-parser");
const fs = require("fs");

const parser = new Parser();

const podcasts = JSON.parse(
    fs.readFileSync("podcasts.json", "utf8")
);

async function update() {

    for (const podcast of podcasts) {

        try {

            console.log("Leyendo:", podcast.name);

            const feed = await parser.parseURL(podcast.rss);

            if (!feed.items || feed.items.length === 0) {
                console.log("⚠ Sin episodios:", podcast.name);
                continue;
            }

            const latest = feed.items[0];

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
