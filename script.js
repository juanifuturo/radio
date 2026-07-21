async function cargar() {

    const respuesta = await fetch("episodes.json");

    const podcasts = await respuesta.json();

    const contenedor = document.getElementById("podcasts");

    podcasts.forEach(podcast => {

        const bloque = document.createElement("div");

        bloque.className = "program";

        bloque.innerHTML = `
            <h2>${podcast.podcast}</h2>

            <p>${podcast.episode}</p>

            <button>Escuchar</button>
        `;

        contenedor.appendChild(bloque);

    });

}

cargar();