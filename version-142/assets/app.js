(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobileNav = document.querySelector('.mobile-nav');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      var isOpen = mobileNav.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', String(isOpen));
    });
  }

  var hero = document.querySelector('[data-hero-slider]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var current = 0;

    function showSlide(index) {
      current = index;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide((current + 1) % slides.length);
      }, 5200);
    }
  }

  var searchInput = document.getElementById('movieSearch');
  var yearSelect = document.getElementById('filterYear');
  var regionSelect = document.getElementById('filterRegion');
  var typeSelect = document.getElementById('filterType');
  var genreSelect = document.getElementById('filterGenre');
  var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function filterCards() {
    var keyword = normalize(searchInput && searchInput.value);
    var year = normalize(yearSelect && yearSelect.value);
    var region = normalize(regionSelect && regionSelect.value);
    var type = normalize(typeSelect && typeSelect.value);
    var genre = normalize(genreSelect && genreSelect.value);

    cards.forEach(function (card) {
      var haystack = normalize([
        card.dataset.title,
        card.dataset.region,
        card.dataset.type,
        card.dataset.year,
        card.dataset.genre,
        card.dataset.tags
      ].join(' '));

      var matched = true;
      matched = matched && (!keyword || haystack.indexOf(keyword) !== -1);
      matched = matched && (!year || normalize(card.dataset.year) === year);
      matched = matched && (!region || normalize(card.dataset.region) === region);
      matched = matched && (!type || normalize(card.dataset.type) === type);
      matched = matched && (!genre || normalize(card.dataset.genre).indexOf(genre) !== -1);
      card.classList.toggle('is-filtered-out', !matched);
    });
  }

  [searchInput, yearSelect, regionSelect, typeSelect, genreSelect].forEach(function (control) {
    if (control) {
      control.addEventListener('input', filterCards);
      control.addEventListener('change', filterCards);
    }
  });

  function bindPlayer(player) {
    var video = player.querySelector('video');
    var cover = player.querySelector('.play-cover');
    var stream = player.getAttribute('data-stream');
    var hlsInstance = null;
    var loaded = false;

    function loadStream() {
      if (!video || !stream || loaded) {
        return;
      }

      loaded = true;

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      }
    }

    function start() {
      loadStream();
      if (cover) {
        cover.classList.add('is-hidden');
      }
      if (video) {
        var playResult = video.play();
        if (playResult && typeof playResult.catch === 'function') {
          playResult.catch(function () {
            if (cover) {
              cover.classList.remove('is-hidden');
            }
          });
        }
      }
    }

    if (cover) {
      cover.addEventListener('click', start);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (!loaded || video.paused) {
          start();
        }
      });
      video.addEventListener('play', function () {
        if (cover) {
          cover.classList.add('is-hidden');
        }
      });
      video.addEventListener('ended', function () {
        if (cover) {
          cover.classList.remove('is-hidden');
        }
      });
    }

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('.movie-player')).forEach(bindPlayer);
})();
