const ready = (callback) => {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", callback);
  } else {
    callback();
  }
};

ready(() => {
  const toggle = document.querySelector(".mobile-toggle");
  const mobileNav = document.querySelector(".mobile-nav");

  if (toggle && mobileNav) {
    toggle.addEventListener("click", () => {
      const open = mobileNav.classList.toggle("is-open");
      document.body.classList.toggle("nav-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.textContent = open ? "×" : "☰";
    });
  }

  const slider = document.querySelector("[data-hero-slider]");

  if (slider) {
    const slides = Array.from(slider.querySelectorAll(".hero-slide"));
    const dots = Array.from(slider.querySelectorAll(".hero-dot"));
    const prev = slider.querySelector(".hero-prev");
    const next = slider.querySelector(".hero-next");
    let active = 0;
    let timer;

    const show = (index) => {
      active = (index + slides.length) % slides.length;
      slides.forEach((slide, i) => slide.classList.toggle("is-active", i === active));
      dots.forEach((dot, i) => dot.classList.toggle("is-active", i === active));
    };

    const start = () => {
      clearInterval(timer);
      timer = setInterval(() => show(active + 1), 5200);
    };

    dots.forEach((dot, i) => {
      dot.addEventListener("click", () => {
        show(i);
        start();
      });
    });

    prev?.addEventListener("click", () => {
      show(active - 1);
      start();
    });

    next?.addEventListener("click", () => {
      show(active + 1);
      start();
    });

    show(0);
    start();
  }

  const cards = Array.from(document.querySelectorAll(".movie-card"));
  const search = document.querySelector(".movie-search");
  const typeFilter = document.querySelector(".movie-type-filter");

  if (cards.length && (search || typeFilter)) {
    const apply = () => {
      const q = (search?.value || "").trim().toLowerCase();
      const t = (typeFilter?.value || "").trim();
      cards.forEach((card) => {
        const haystack = [
          card.dataset.title,
          card.dataset.type,
          card.dataset.genre,
          card.dataset.tags,
          card.dataset.category,
          card.textContent
        ].join(" ").toLowerCase();
        const typeOk = !t || card.dataset.type === t;
        const queryOk = !q || haystack.includes(q);
        card.hidden = !(typeOk && queryOk);
      });
    };

    search?.addEventListener("input", apply);
    typeFilter?.addEventListener("change", apply);
  }

  const players = Array.from(document.querySelectorAll(".video-shell[data-stream]"));

  if (players.length) {
    let hlsLoader;

    const loadHls = async () => {
      if (!hlsLoader) {
        hlsLoader = import("./hls-engine.js");
      }
      const module = await hlsLoader;
      return module.H;
    };

    players.forEach((shell) => {
      const video = shell.querySelector("video");
      const button = shell.querySelector(".play-overlay");
      const stream = shell.dataset.stream;
      let started = false;
      let hlsInstance = null;

      const playVideo = async () => {
        if (!video || !stream) {
          return;
        }

        shell.classList.add("is-playing");

        if (!started) {
          started = true;

          if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = stream;
          } else {
            const Hls = await loadHls();
            if (Hls.isSupported()) {
              hlsInstance = new Hls({
                enableWorker: true,
                lowLatencyMode: true
              });
              hlsInstance.loadSource(stream);
              hlsInstance.attachMedia(video);
            } else {
              video.src = stream;
            }
          }
        }

        try {
          await video.play();
        } catch (error) {
          shell.classList.remove("is-playing");
        }
      };

      button?.addEventListener("click", playVideo);
      video?.addEventListener("click", () => {
        if (!started) {
          playVideo();
        }
      });
      video?.addEventListener("play", () => shell.classList.add("is-playing"));
      video?.addEventListener("pause", () => {
        if (!video.ended) {
          shell.classList.remove("is-playing");
        }
      });
      window.addEventListener("pagehide", () => {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }
});
