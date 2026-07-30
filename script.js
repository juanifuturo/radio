let podcasts = [];

let indiceActual = 0;

function reproducir(indice) {

    indiceActual = indice;

    localStorage.setItem("indiceActual", indice);

    const podcast = podcasts[indice];

    if (!podcast.lastEpisode) {
        alert("Este podcast todavía no está disponible.");
        return;
    }

    const player = document.getElementById("player");

    player.src = podcast.lastEpisode.audio;

    document.getElementById("playing").textContent =
        podcast.name + " — " + podcast.lastEpisode.title;

    player.play();

}

async function cargar() {

    const respuesta = await fetch("podcasts.json");

podcasts = await respuesta.json();

podcasts.sort((a, b) => {

    const fechaA = a.lastEpisode?.date
        ? new Date(a.lastEpisode.date)
        : new Date(0);

    const fechaB = b.lastEpisode?.date
        ? new Date(b.lastEpisode.date)
        : new Date(0);

    return fechaB - fechaA;

});

const contenedor = document.getElementById("podcasts");

    contenedor.innerHTML = "";

    podcasts.forEach((podcast, i) => {

        const bloque = document.createElement("div");

        bloque.className = "program";

        const titulo = podcast.lastEpisode?.title || "Actualizando...";
const duracion = podcast.lastEpisode?.duration || "";
const fecha = podcast.lastEpisode?.date
    ? new Date(podcast.lastEpisode.date).toLocaleDateString("es-ES", {
          day: "numeric",
          month: "short",
          year: "numeric"
      })
    : "";

const podcastsOrdenados = [...podcasts].sort((a, b) =>
    a.name.localeCompare(b.name, "es", {
        sensitivity: "base"
    })
);

const lista = document.getElementById("linksPodcast");

lista.innerHTML = "";

podcastsOrdenados.forEach(podcast => {

    const li = document.createElement("li");

    li.innerHTML = `
        <a href="${podcast.link}"
           target="_blank">
            ${podcast.name}
        </a>
    `;

    lista.appendChild(li);

});
        

bloque.innerHTML = `
    <div class="info">
        <h2>${podcast.name.toUpperCase()}</h2>
        <p>${titulo}</p>

        <div class="meta">
            <span>${duracion}</span>
            <span>${fecha}</span>
        </div>
    </div>
`;

        bloque.addEventListener("click", () => {

            reproducir(i);

        });

        contenedor.appendChild(bloque);

    });

    const guardado = localStorage.getItem("indiceActual");

if (guardado !== null) {

    reproducir(Number(guardado));

} else {

    reproducir(0);

}
}

player.addEventListener("ended", () => {

    let siguiente = indiceActual + 1;

    if (siguiente >= podcasts.length) {
        siguiente = 0;
    }

    reproducir(siguiente);

});


document.getElementById("nextButton").addEventListener("click", () => {

    let siguiente = indiceActual + 1;

    if (siguiente >= podcasts.length) {
        siguiente = 0;
    }

    reproducir(siguiente);

});

document.getElementById("prevButton").addEventListener("click", () => {

    let anterior = indiceActual - 1;

    if (anterior < 0) {
        anterior = podcasts.length - 1;
    }

    reproducir(anterior);

});

cargar();
