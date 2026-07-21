async function cargar() {

    const respuesta = await fetch("episodes.json");

    const podcasts = await respuesta.json();

    const contenedor = document.getElementById("podcasts");

    podcasts.forEach(podcast => {

        const bloque = document.createElement("div");

        bloque.className = "program";

bloque.innerHTML = `
    <h2>▶ ${podcast.podcast}</h2>
    <p>${podcast.episode}</p>
`;

        contenedor.appendChild(bloque);

        bloque.style.cursor = "pointer";

bloque.addEventListener("click", () => {

    const player = document.getElementById("player");

    player.src = podcast.audio;

    document.getElementById("playing").textContent =
        podcast.podcast + " — " + podcast.episode;

    player.play();

});

    });

}

cargar();
