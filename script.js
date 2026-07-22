async function cargar() {

    const respuesta = await fetch("podcasts.json");

    const podcasts = await respuesta.json();

    const contenedor = document.getElementById("podcasts");

    podcasts.forEach(podcast => {

        const bloque = document.createElement("div");

        bloque.className = "program";

        bloque.innerHTML = `
    <img class="cover"
     src="${podcast.lastEpisode.image}"
     alt="${podcast.name}"
     onerror="this.style.display='none'">

    <div class="info">
        <h2>${podcast.name.toUpperCase()}</h2>
        <p>${podcast.lastEpisode.title}</p>
    </div>
`;

        contenedor.appendChild(bloque);

        bloque.style.cursor = "pointer";

        bloque.addEventListener("click", () => {

            const player = document.getElementById("player");

            player.src = podcast.lastEpisode.audio;

            document.getElementById("playing").textContent =
                podcast.name + " — " + podcast.lastEpisode.title;

            player.play();

        });

    });

}

cargar();
