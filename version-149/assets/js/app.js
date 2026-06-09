(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var menuButton = document.querySelector("[data-menu-toggle]");
    var mobileMenu = document.querySelector("[data-mobile-menu]");

    if (menuButton && mobileMenu) {
      menuButton.addEventListener("click", function () {
        mobileMenu.classList.toggle("is-open");
      });
    }

    var hero = document.querySelector("[data-hero]");

    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var prev = hero.querySelector("[data-hero-prev]");
      var next = hero.querySelector("[data-hero-next]");
      var index = 0;
      var timer = null;

      function show(nextIndex) {
        if (!slides.length) {
          return;
        }

        index = (nextIndex + slides.length) % slides.length;

        slides.forEach(function (slide, itemIndex) {
          slide.classList.toggle("is-active", itemIndex === index);
        });

        dots.forEach(function (dot, itemIndex) {
          dot.classList.toggle("is-active", itemIndex === index);
        });
      }

      function start() {
        stop();
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5200);
      }

      function stop() {
        if (timer) {
          window.clearInterval(timer);
          timer = null;
        }
      }

      dots.forEach(function (dot, itemIndex) {
        dot.addEventListener("click", function () {
          show(itemIndex);
          start();
        });
      });

      if (prev) {
        prev.addEventListener("click", function () {
          show(index - 1);
          start();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          show(index + 1);
          start();
        });
      }

      hero.addEventListener("mouseenter", stop);
      hero.addEventListener("mouseleave", start);
      show(0);
      start();
    }

    var localSearch = document.querySelector("[data-local-search]");
    var searchInput = localSearch ? localSearch.querySelector("input[name='q']") : null;
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
    var emptyState = document.querySelector("[data-empty-state]");
    var filterButtons = Array.prototype.slice.call(document.querySelectorAll("[data-filter]"));
    var params = new URLSearchParams(window.location.search);
    var activeFilter = "all";

    function normalize(value) {
      return String(value || "").trim().toLowerCase();
    }

    function applySearch() {
      var query = normalize(searchInput ? searchInput.value : params.get("q"));
      var anyVisible = false;

      cards.forEach(function (card) {
        var text = normalize(card.getAttribute("data-search"));
        var category = card.getAttribute("data-category") || "";
        var matchQuery = !query || text.indexOf(query) !== -1;
        var matchFilter = activeFilter === "all" || category === activeFilter;
        var visible = matchQuery && matchFilter;
        card.hidden = !visible;
        anyVisible = anyVisible || visible;
      });

      if (emptyState) {
        emptyState.hidden = anyVisible;
      }
    }

    if (searchInput) {
      if (params.get("q")) {
        searchInput.value = params.get("q");
      }

      searchInput.addEventListener("input", applySearch);
      localSearch.addEventListener("submit", function (event) {
        event.preventDefault();
        applySearch();
      });

      applySearch();
    }

    filterButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        activeFilter = button.getAttribute("data-filter") || "all";
        filterButtons.forEach(function (item) {
          item.classList.toggle("is-active", item === button);
        });
        applySearch();
      });
    });
  });
})();
