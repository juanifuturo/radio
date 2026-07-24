let podcasts = [];
let indiceActual = 0;

let modoDirecto = true;
let restaurarPosicion = true;

const player = document.getElementById("player");
const playing = document.getElementById("playing");
const duration = document.getElementById("duration");
const contenedor = document.getElementById("podcasts");

//--------------------------------------------------
// Utilidades
//--------------------------------------------------

function mezclarArray(array) {

    const copia = [...array];

    for (let i = copia.length - 1; i > 0; i--) {

        const j = Math.floor(Math.random() * (i + 1));

        [copia[i], copia[j]] = [copia[j], copia[i]];

    }

    return copia;

}

function obtenerClaveHoy() {

    const hoy = new Date();

    return hoy.getFullYear() + "-" +
        String(hoy.getMonth() + 1).padStart(2, "0") + "-" +
        String(hoy.getDate()).padStart(2, "0");

}

function obtenerParrillaDelDia() {

    const clave = "parrilla-" + obtenerClaveHoy();

    let parrilla = JSON.parse(localStorage.getItem(clave));

    if (parrilla) return parrilla;

    parrilla = mezclarArray(
        podcasts.map((_, indice) => indice)
    );

    localStorage.setItem(clave, JSON.stringify(parrilla));

    return parrilla;

}

//--------------------------------------------------
// Reproducción
//--------------------------------------------------

function reproducir(indice, autoplay = true) {

    guardarPosicion();

    indiceActual = indice;

    modoDirecto = false;

    document.getElementById("liveButton").style.display = "block";

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

    if (
        restaurarPosicion &&
        indice === Number(localStorage.getItem("indiceActual"))
    ) {

        const tiempoGuardado =
            Number(localStorage.getItem("posicionPodcast"));

        player.addEventListener("loadedmetadata", function restaurar() {

            if (!isNaN(tiempoGuardado)) {

                player.currentTime = tiempoGuardado;

            }

            player.removeEventListener(
                "loadedmetadata",
                restaurar
            );

        });

        restaurarPosicion = false;

    }

    if (autoplay) {

        player.play().catch(() => {});

    }

}

//--------------------------------------------------
// Carga de podcasts
//--------------------------------------------------

async function cargar() {

    const respuesta = await fetch("podcasts.json");

    podcasts = await respuesta.json();

    podcasts.sort((a, b) =>
        a.name.localeCompare(
            b.name,
            "es",
            {
                sensitivity: "base"
            }
        )
    );

    contenedor.innerHTML = "";

    podcasts.forEach((podcast, indice) => {

        const bloque = document.createElement("div");

        bloque.className = "program";

        const titulo =
            podcast.lastEpisode?.title || "Actualizando...";

        const duracion =
            podcast.lastEpisode?.duration || "";

        const fecha =
            podcast.lastEpisode?.date
                ? new Date(
                    podcast.lastEpisode.date
                ).toLocaleDateString("es-ES", {
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

            restaurarPosicion = true;

            reproducir(indice);

        });

        contenedor.appendChild(bloque);

    });

    // Ocultar botón "Volver al directo"
    document.getElementById("liveButton").style.display = "none";

    // De momento cargamos el primer programa,
    // pero sin reproducir automáticamente.

    restaurarPosicion = false;

    reproducir(0, false);

    console.log(obtenerParrillaDelDia());

}

//--------------------------------------------------
// Botones
//--------------------------------------------------

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

//--------------------------------------------------
// Guardar posición
//--------------------------------------------------

function guardarPosicion() {

    if (!player.src) return;

    localStorage.setItem(
        "posicionPodcast",
        player.currentTime
    );

}

player.addEventListener("pause", guardarPosicion);

player.addEventListener("ended", guardarPosicion);

window.addEventListener(
    "beforeunload",
    guardarPosicion
);

//--------------------------------------------------

cargar();
