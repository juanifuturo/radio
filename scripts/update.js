const Parser = require("rss-parser");
const fs = require("fs");

const parser = new Parser();

const podcasts = JSON.parse(
    fs.readFileSync("podcasts.json")
);

async function update(){

    let episodes=[];

    for(const podcast of podcasts){

        console.log("Leyendo:",podcast.title);

        const feed=await parser.parseURL(podcast.rss);

        const latest=feed.items[0];

        episodes.push({

            podcast:podcast.title,

            episode:latest.title,

            date:latest.pubDate,

            audio:latest.enclosure?.url || "",

            webpage:latest.link,

            image:feed.image?.url || ""

        });

    }

    fs.writeFileSync(

        "episodes.json",

        JSON.stringify(episodes,null,2)

    );

    console.log("Todo terminado.");

}

update();