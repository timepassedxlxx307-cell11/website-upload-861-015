(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var previous = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function startTimer() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showSlide(dotIndex);
        startTimer();
      });
    });

    if (previous) {
      previous.addEventListener('click', function () {
        showSlide(index - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(index + 1);
        startTimer();
      });
    }

    showSlide(0);
    startTimer();
  }

  var params = new URLSearchParams(window.location.search);
  var queryFromUrl = params.get('q');
  var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));

  panels.forEach(function (panel) {
    var input = panel.querySelector('[data-search-input]');
    var year = panel.querySelector('[data-year-filter]');
    var region = panel.querySelector('[data-region-filter]');
    var genre = panel.querySelector('[data-genre-filter]');
    var list = document.querySelector('[data-card-list]');
    var empty = document.querySelector('[data-empty-state]');

    if (!list) {
      return;
    }

    var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));

    if (input && queryFromUrl) {
      input.value = queryFromUrl;
    }

    function applyFilters() {
      var term = input ? input.value.trim().toLowerCase() : '';
      var selectedYear = year ? year.value : '';
      var selectedRegion = region ? region.value : '';
      var selectedGenre = genre ? genre.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var title = (card.getAttribute('data-title') || '').toLowerCase();
        var meta = (card.getAttribute('data-meta') || '').toLowerCase();
        var yearValue = card.getAttribute('data-year') || '';
        var regionValue = card.getAttribute('data-region') || '';
        var genreValue = card.getAttribute('data-genre') || '';
        var matched = true;

        if (term && title.indexOf(term) === -1 && meta.indexOf(term) === -1) {
          matched = false;
        }

        if (selectedYear && yearValue !== selectedYear) {
          matched = false;
        }

        if (selectedRegion && regionValue !== selectedRegion) {
          matched = false;
        }

        if (selectedGenre && genreValue.indexOf(selectedGenre) === -1) {
          matched = false;
        }

        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('visible', visible === 0);
      }
    }

    [input, year, region, genre].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });

    applyFilters();
  });

  var playerBox = document.querySelector('[data-player]');
  if (playerBox) {
    var video = playerBox.querySelector('video');
    var overlay = playerBox.querySelector('[data-player-overlay]');
    var stream = playerBox.getAttribute('data-stream');
    var hls = null;
    var ready = false;

    function prepare() {
      if (!video || !stream || ready) {
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else {
        video.src = stream;
      }

      ready = true;
    }

    function start() {
      prepare();
      if (overlay) {
        overlay.classList.add('hidden');
      }
      if (video) {
        var result = video.play();
        if (result && typeof result.catch === 'function') {
          result.catch(function () {
            if (overlay) {
              overlay.classList.remove('hidden');
            }
          });
        }
      }
    }

    if (overlay) {
      overlay.addEventListener('click', start);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          start();
        }
      });
      video.addEventListener('play', function () {
        if (overlay) {
          overlay.classList.add('hidden');
        }
      });
    }

    window.addEventListener('beforeunload', function () {
      if (hls && typeof hls.destroy === 'function') {
        hls.destroy();
      }
    });
  }
})();
