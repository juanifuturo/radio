async function cargar() {

    const respuesta = await fetch("podcasts.json");

    const podcasts = await respuesta.json();

    const contenedor = document.getElementById("podcasts");

    podcasts.forEach(podcast => {

        const bloque = document.createElement("div");

        bloque.className = "program";

        bloque.innerHTML = `
            <div class="info">
                <h2>${podcast.name.toUpperCase()}</h2>
                <p>${podcast.lastEpisode.title}</p>
            </div>
        `;

        bloque.addEventListener("click", () => {

            const player = document.getElementById("player");

            player.src = podcast.lastEpisode.audio;

            document.getElementById("playing").textContent =
                podcast.name + " — " + podcast.lastEpisode.title;

            player.play();

        });

        contenedor.appendChild(bloque);

    });

}

cargar();
