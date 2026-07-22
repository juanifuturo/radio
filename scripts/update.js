const Parser = require("rss-parser");
const fs = require("fs");

const parser = new Parser();

const podcasts = JSON.parse(
    fs.readFileSync("podcasts.json")
);

async function update() {

    for (const podcast of podcasts) {

        console.log("Leyendo:", podcast.name);

        const feed = await parser.parseURL(podcast.rss);

        const latest = feed.items[0];

        podcast.lastEpisode = {

            title: latest.title,

            date: latest.pubDate,

            audio: latest.enclosure?.url || "",

            webpage: latest.link,

            image: feed.image?.url || "",

            description: latest.contentSnippet || ""

        };

    }

    fs.writeFileSync(

        "podcasts.json",

        JSON.stringify(podcasts, null, 2)

    );

    console.log("Todo terminado.");

}

update();
