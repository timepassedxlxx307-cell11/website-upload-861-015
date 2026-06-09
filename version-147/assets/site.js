(function () {
  "use strict";

  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMobileMenu() {
    var button = document.querySelector(".mobile-menu-button");
    var panel = document.querySelector(".mobile-panel");

    if (!button || !panel) {
      return;
    }

    button.addEventListener("click", function () {
      var open = panel.hasAttribute("hidden");
      panel.toggleAttribute("hidden", !open);
      button.setAttribute("aria-expanded", String(open));
    });
  }

  function setupHeroCarousel() {
    var hero = document.querySelector(".hero-carousel");

    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        var active = slideIndex === index;
        slide.classList.toggle("is-active", active);
        slide.setAttribute("aria-hidden", active ? "false" : "true");
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5600);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        restart();
      });
    });

    show(0);
    restart();
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function setupFilters() {
    var roots = Array.prototype.slice.call(document.querySelectorAll("[data-filter-root]"));

    roots.forEach(function (root) {
      var form = root.querySelector(".js-filter-form");
      var cards = Array.prototype.slice.call(root.querySelectorAll(".movie-card"));
      var count = root.querySelector(".js-filter-count");
      var empty = root.querySelector(".js-empty-state");

      if (!form || !cards.length) {
        return;
      }

      var keyword = form.querySelector(".js-filter-keyword");
      var year = form.querySelector(".js-filter-year");
      var region = form.querySelector(".js-filter-region");
      var type = form.querySelector(".js-filter-type");

      function apply() {
        var keywordValue = normalize(keyword && keyword.value);
        var yearValue = normalize(year && year.value);
        var regionValue = normalize(region && region.value);
        var typeValue = normalize(type && type.value);
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-year"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-tags"),
            card.getAttribute("data-category"),
            card.textContent
          ].join(" "));

          var matched = true;

          if (keywordValue && haystack.indexOf(keywordValue) === -1) {
            matched = false;
          }

          if (yearValue && normalize(card.getAttribute("data-year")) !== yearValue) {
            matched = false;
          }

          if (regionValue && normalize(card.getAttribute("data-region")) !== regionValue) {
            matched = false;
          }

          if (typeValue && normalize(card.getAttribute("data-type")) !== typeValue) {
            matched = false;
          }

          card.style.display = matched ? "" : "none";

          if (matched) {
            visible += 1;
          }
        });

        if (count) {
          count.textContent = String(visible);
        }

        if (empty) {
          empty.hidden = visible !== 0;
        }
      }

      form.addEventListener("input", apply);
      form.addEventListener("change", apply);
      form.addEventListener("reset", function () {
        window.setTimeout(apply, 0);
      });

      if (root.hasAttribute("data-search-page")) {
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q") || "";

        if (query && keyword) {
          keyword.value = query;
        }
      }

      apply();
    });
  }

  var hlsLoaderPromise = null;

  function loadHlsLibrary() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }

    if (hlsLoaderPromise) {
      return hlsLoaderPromise;
    }

    hlsLoaderPromise = new Promise(function (resolve) {
      var script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js";
      script.async = true;
      script.onload = function () {
        resolve(window.Hls || null);
      };
      script.onerror = function () {
        resolve(null);
      };
      document.head.appendChild(script);
    });

    return hlsLoaderPromise;
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll(".js-player"));

    players.forEach(function (shell) {
      var video = shell.querySelector("video");
      var overlay = shell.querySelector(".player-overlay");
      var message = shell.querySelector(".player-message");
      var source = shell.getAttribute("data-video-src");
      var started = false;
      var hlsInstance = null;

      if (!video || !source) {
        return;
      }

      function setMessage(text) {
        if (message) {
          message.textContent = text || "";
        }
      }

      function playWhenReady() {
        var result = video.play();

        if (result && typeof result.catch === "function") {
          result.catch(function () {
            setMessage("浏览器阻止了自动播放，请再次点击播放按钮。");
            if (overlay) {
              overlay.hidden = false;
            }
          });
        }
      }

      function start() {
        if (started) {
          playWhenReady();
          return;
        }

        started = true;
        shell.classList.add("is-loading");
        setMessage("正在初始化 HLS 播放源...");

        if (overlay) {
          overlay.hidden = true;
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
          video.addEventListener("loadedmetadata", playWhenReady, { once: true });
          setMessage("");
          return;
        }

        loadHlsLibrary().then(function (Hls) {
          if (Hls && Hls.isSupported()) {
            hlsInstance = new Hls({
              enableWorker: true,
              lowLatencyMode: true,
              backBufferLength: 90
            });

            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
            hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
              shell.classList.remove("is-loading");
              setMessage("");
              playWhenReady();
            });
            hlsInstance.on(Hls.Events.ERROR, function (event, data) {
              if (data && data.fatal) {
                setMessage("播放源暂时无法加载，请检查网络或稍后重试。");
              }
            });
          } else {
            video.src = source;
            shell.classList.remove("is-loading");
            setMessage("当前浏览器不支持 HLS.js，已尝试使用原生播放。");
            playWhenReady();
          }
        });
      }

      shell.addEventListener("click", function (event) {
        if (event.target === video && started) {
          return;
        }

        start();
      });

      video.addEventListener("play", function () {
        if (overlay) {
          overlay.hidden = true;
        }
      });

      window.addEventListener("pagehide", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  ready(function () {
    setupMobileMenu();
    setupHeroCarousel();
    setupFilters();
    setupPlayers();
  });
})();
