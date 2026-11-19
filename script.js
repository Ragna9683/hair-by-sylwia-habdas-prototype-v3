const film = document.querySelector("#kadr");
const video = document.querySelector("#salon-film");
const filmControl = document.querySelector(".film-control");
const filmLabel = document.querySelector(".film-label");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const canObserve = "IntersectionObserver" in window;
let autoStart = !reducedMotion.matches && !navigator.connection?.saveData && location.hash !== "#o-nas";

function syncFilmControl() {
  const playing = !video.paused && !video.ended;
  let label = "Odtwórz film";
  if (video.ended) label = "Odtwórz film ponownie";
  if (playing) label = "Wstrzymaj film";

  filmControl.toggleAttribute("data-playing", playing);
  filmControl.setAttribute("aria-label", label);
  filmControl.title = label;
  filmLabel.textContent = label;
}

function showPoster() {
  autoStart = false;
  video.hidden = true;
  filmControl.hidden = true;
}

async function playFilm() {
  if (video.ended) video.currentTime = 0;
  try {
    await video.play();
  } catch (error) {
    if (error.name === "NotSupportedError") showPoster();
    syncFilmControl();
  }
}

if (video.canPlayType("video/mp4")) {
  video.muted = true;
  video.addEventListener("error", showPoster);
  for (const event of ["playing", "pause", "ended"]) {
    video.addEventListener(event, syncFilmControl);
  }

  filmControl.hidden = false;
  filmControl.addEventListener("click", () => {
    autoStart = false;
    if (video.paused || video.ended) playFilm();
    else video.pause();
  });

  if (canObserve) {
    const filmObserver = new IntersectionObserver(([entry]) => {
      if (entry.intersectionRatio < 0.08) {
        video.pause();
        return;
      }
      if (autoStart && entry.intersectionRatio >= 0.45 && !document.hidden) {
        autoStart = false;
        playFilm();
      }
    }, { threshold: [0.08, 0.45] });

    filmObserver.observe(film);
  }

  reducedMotion.addEventListener("change", ({ matches }) => {
    if (!matches) return;
    autoStart = false;
    video.pause();
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) video.pause();
  });
} else {
  showPoster();
}

if (canObserve && !reducedMotion.matches) {
  const reveal = new IntersectionObserver((entries, observer) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    }
  }, { threshold: 0.12 });

  document.querySelectorAll("[data-reveal]").forEach(element => reveal.observe(element));
}
