(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  qsa('[data-nav-toggle]').forEach(function (button) {
    button.addEventListener('click', function () {
      var target = qs(button.getAttribute('data-nav-toggle'));
      if (target) {
        target.classList.toggle('is-open');
      }
    });
  });

  qsa('[data-search-form]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = qs('input', form);
      var value = input ? input.value.trim() : '';
      if (value) {
        window.location.href = './search.html?q=' + encodeURIComponent(value);
      }
    });
  });

  qsa('[data-hero]').forEach(function (hero) {
    var slides = qsa('[data-hero-slide]', hero);
    var dots = qsa('[data-hero-dot]', hero);
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    qsa('[data-hero-next]', hero).forEach(function (button) {
      button.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    });

    qsa('[data-hero-prev]', hero).forEach(function (button) {
      button.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    });

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  });

  qsa('[data-filter-area]').forEach(function (area) {
    var input = qs('[data-filter-input]', area) || qs('[data-filter-input]');
    var year = qs('[data-filter-year]', area) || qs('[data-filter-year]');
    var type = qs('[data-filter-type]', area) || qs('[data-filter-type]');
    var cards = qsa('[data-movie-card]', area);
    var empty = qs('[data-empty-state]', area);

    function apply() {
      var query = normalize(input ? input.value : '');
      var selectedYear = year ? year.value : '';
      var selectedType = type ? type.value : '';
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-tags'),
          card.getAttribute('data-region'),
          card.getAttribute('data-genre')
        ].join(' '));
        var matchQuery = !query || haystack.indexOf(query) !== -1;
        var matchYear = !selectedYear || card.getAttribute('data-year') === selectedYear;
        var matchType = !selectedType || card.getAttribute('data-type') === selectedType;
        var showCard = matchQuery && matchYear && matchType;
        card.hidden = !showCard;
        if (showCard) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    [input, year, type].forEach(function (element) {
      if (element) {
        element.addEventListener('input', apply);
        element.addEventListener('change', apply);
      }
    });

    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    if (q && input) {
      input.value = q;
      var label = qs('[data-search-label]');
      if (label) {
        label.textContent = q;
      }
    }
    apply();
  });
})();
