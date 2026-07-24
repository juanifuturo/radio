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

function crearRandom(seed) {

    return function () {

        seed = (seed * 1664525 + 1013904223) % 4294967296;

        return seed / 4294967296;

    };

}

function mezclarArray(array, seed) {

    const random = crearRandom(seed);

    const copia = [...array];

    for (let i = copia.length - 1; i > 0; i--) {

        const j = Math.floor(random() * (i + 1));

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

    const hoy = new Date();

    const seed =
        hoy.getFullYear() * 10000 +
        (hoy.getMonth() + 1) * 100 +
        hoy.getDate();

    return mezclarArray(

        podcasts.map((_, indice) => indice),

        seed

    );

}

function obtenerOffsetDelDia() {

    const hoy = new Date();

    const seed =
        hoy.getFullYear() * 10000 +
        (hoy.getMonth() + 1) * 100 +
        hoy.getDate();

    const random = crearRandom(seed + 9999);

    return Math.floor(random() * 86400);

}

function duracionEnSegundos(texto) {

    if (!texto) return 0;

    const partes = texto.split(":").map(Number);

    if (partes.length === 3) {

        return partes[0] * 3600 +
               partes[1] * 60 +
               partes[2];

    }

    if (partes.length === 2) {

        return partes[0] * 60 +
               partes[1];

    }

    return 0;

}

function calcularDirecto() {

    const parrilla = obtenerParrillaDelDia();

    const ahora = new Date();

    let segundosHoy =
        ahora.getHours() * 3600 +
        ahora.getMinutes() * 60 +
        ahora.getSeconds();

    const offset = obtenerOffsetDelDia();

segundosHoy -= offset;

while (segundosHoy < 0) {

    segundosHoy += 86400;

}

    let acumulado = 0;

    while (true) {

        for (const indice of parrilla) {

            const podcast = podcasts[indice];

            const duracion =
                duracionEnSegundos(
                    podcast.lastEpisode.duration
                );

            if (segundosHoy < acumulado + duracion) {

                return {

                    indice,

                    segundo: segundosHoy - acumulado

                };

            }

            acumulado += duracion;

        }

        // Si se acaba la parrilla, vuelve a empezar.

    }

}

function reproducirDirecto(autoplay = true) {

    modoDirecto = true;

    document.getElementById("liveButton").style.display = "none";

    const directo = calcularDirecto();

    reproducir(directo.indice, false, true);

    player.addEventListener("loadedmetadata", function sincronizar() {

        player.currentTime = directo.segundo;

        if (autoplay) {

            player.play().catch(() => {});

        }

        player.removeEventListener("loadedmetadata", sincronizar);

    });

}

//--------------------------------------------------
// Reproducción
//--------------------------------------------------

function reproducir(indice, autoplay = true, directo = false) {

    modoDirecto = directo;

    guardarPosicion();

    indiceActual = indice;

    if (!modoDirecto) {

        document.getElementById("liveButton").style.display = "block";

    } else {

        document.getElementById("liveButton").style.display = "none";

    }

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

            player.removeEventListener("loadedmetadata", restaurar);

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

   restaurarPosicion = false;

reproducirDirecto(false);

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

document.getElementById("liveButton").addEventListener("click", () => {

    reproducirDirecto();

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

function iniciarRadio() {

    if (!player.paused) return;

    player.play().catch(() => {});

    document.removeEventListener("click", iniciarRadio);
    document.removeEventListener("keydown", detectarTecla);

}

function detectarTecla(e) {

    if (e.code === "Space" || e.code === "Enter") {

        iniciarRadio();

    }

}

document.addEventListener("click", iniciarRadio);

document.addEventListener("keydown", detectarTecla);

cargar();
