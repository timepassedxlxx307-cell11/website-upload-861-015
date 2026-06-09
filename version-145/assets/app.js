(() => {
  const menuButton = document.querySelector("[data-menu-toggle]");
  const menu = document.querySelector("[data-menu]");
  if (menuButton && menu) {
    menuButton.addEventListener("click", () => {
      menu.classList.toggle("is-open");
    });
  }

  document.querySelectorAll("img").forEach((image) => {
    image.addEventListener("error", () => {
      image.classList.add("is-missing");
    });
  });

  document.querySelectorAll("[data-hero]").forEach((hero) => {
    const slides = Array.from(hero.querySelectorAll(".hero-slide"));
    const dots = Array.from(hero.querySelectorAll(".hero-dot"));
    const next = hero.querySelector("[data-hero-next]");
    const prev = hero.querySelector("[data-hero-prev]");
    let index = 0;
    let timer = null;

    const show = (nextIndex) => {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach((dot, dotIndex) => {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    };

    const play = () => {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(() => show(index + 1), 5200);
    };

    if (next) {
      next.addEventListener("click", () => {
        show(index + 1);
        play();
      });
    }

    if (prev) {
      prev.addEventListener("click", () => {
        show(index - 1);
        play();
      });
    }

    dots.forEach((dot, dotIndex) => {
      dot.addEventListener("click", () => {
        show(dotIndex);
        play();
      });
    });

    show(0);
    play();
  });

  document.querySelectorAll("[data-filter-input]").forEach((input) => {
    const target = document.querySelector(input.getAttribute("data-filter-input"));
    if (!target) {
      return;
    }
    const items = Array.from(target.querySelectorAll(".filter-item"));
    const apply = () => {
      const value = input.value.trim().toLowerCase();
      items.forEach((item) => {
        const haystack = (item.getAttribute("data-search") || item.textContent || "").toLowerCase();
        item.classList.toggle("hidden", value && !haystack.includes(value));
      });
    };
    input.addEventListener("input", apply);
    apply();
  });
})();
