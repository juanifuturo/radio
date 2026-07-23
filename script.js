let podcasts = [];
let indiceActual = 0;
let restaurarPosicion = true;

const player = document.getElementById("player");
const playing = document.getElementById("playing");
const duration = document.getElementById("duration");
const contenedor = document.getElementById("podcasts");

function reproducir(indice) {

    guardarPosicion();

    indiceActual = indice;

    localStorage.setItem("indiceActual", indice);

    const podcast = podcasts[indice];

    if (!podcast.lastEpisode) {
        alert("Este podcast todavía no está disponible.");
        return;
    }

    player.src = podcast.lastEpisode.audio;

    playing.textContent =
        podcast.name + " — " + podcast.lastEpisode.title;

    duration.textContent =
        "Duración: " + (podcast.lastEpisode.duration || "Desconocida");

    if (restaurarPosicion &&
        indice === Number(localStorage.getItem("indiceActual"))) {

        const tiempoGuardado = Number(localStorage.getItem("tiempoActual"));

        player.addEventListener("loadedmetadata", function restaurar() {

            if (!isNaN(tiempoGuardado)) {
                player.currentTime = tiempoGuardado;
            }

            player.removeEventListener("loadedmetadata", restaurar);

        });

        restaurarPosicion = false;

    }

    player.play();

}

async function cargar() {

    const respuesta = await fetch("podcasts.json");

    podcasts = await respuesta.json();

    // Orden alfabético
    podcasts.sort((a, b) =>
        a.name.localeCompare(b.name, "es", {
            sensitivity: "base"
        })
    );

    contenedor.innerHTML = "";

    podcasts.forEach((podcast, indice) => {

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

            restaurarPosicion = false;
            reproducir(indice);

        });

        contenedor.appendChild(bloque);

    });

    const guardado = localStorage.getItem("indiceActual");

    if (guardado !== null && guardado < podcasts.length) {

        reproducir(Number(guardado));

    } else {

        restaurarPosicion = false;
        reproducir(0);

    }

}

player.addEventListener("ended", () => {

    let siguiente = indiceActual + 1;

    if (siguiente >= podcasts.length) {
        siguiente = 0;
    }

    restaurarPosicion = false;
    reproducir(siguiente);

});

document.getElementById("nextButton").addEventListener("click", () => {

    let siguiente = indiceActual + 1;

    if (siguiente >= podcasts.length) {
        siguiente = 0;
    }

    restaurarPosicion = false;
    reproducir(siguiente);

});

document.getElementById("prevButton").addEventListener("click", () => {

    let anterior = indiceActual - 1;

    if (anterior < 0) {
        anterior = podcasts.length - 1;
    }

    restaurarPosicion = false;
    reproducir(anterior);

});

function guardarPosicion() {

    if (!player.src) return;

    localStorage.setItem("tiempoActual", player.currentTime);

}

// Al pausar
player.addEventListener("pause", guardarPosicion);

// Al terminar un episodio
player.addEventListener("ended", guardarPosicion);

// Antes de cerrar o recargar la página
window.addEventListener("beforeunload", guardarPosicion);

cargar();
