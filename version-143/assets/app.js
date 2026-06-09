(function () {
  function each(selector, root, callback) {
    Array.prototype.forEach.call((root || document).querySelectorAll(selector), callback);
  }

  function toggleMenu() {
    var button = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!button || !nav) return;
    button.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function initCarousel() {
    each('[data-carousel]', document, function (carousel) {
      var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-slide]'));
      var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-slide-dot]'));
      var prev = carousel.querySelector('[data-slide-prev]');
      var next = carousel.querySelector('[data-slide-next]');
      var index = 0;
      var timer = null;

      function show(nextIndex) {
        if (!slides.length) return;
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle('is-active', i === index);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle('is-active', i === index);
        });
      }

      function start() {
        stop();
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5000);
      }

      function stop() {
        if (timer) window.clearInterval(timer);
        timer = null;
      }

      if (prev) prev.addEventListener('click', function () { show(index - 1); start(); });
      if (next) next.addEventListener('click', function () { show(index + 1); start(); });
      dots.forEach(function (dot, i) {
        dot.addEventListener('click', function () { show(i); start(); });
      });
      carousel.addEventListener('mouseenter', stop);
      carousel.addEventListener('mouseleave', start);
      show(0);
      start();
    });
  }

  function initFilters() {
    var input = document.querySelector('[data-search-input]');
    var select = document.querySelector('[data-filter-select]');
    var empty = document.querySelector('[data-empty-state]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
    if (!input || !cards.length) return;

    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    if (q) input.value = q;

    function apply() {
      var keyword = (input.value || '').trim().toLowerCase();
      var selected = select ? (select.value || '').trim().toLowerCase() : '';
      var visible = 0;
      cards.forEach(function (card) {
        var text = (card.getAttribute('data-filter') || '').toLowerCase();
        var matched = (!keyword || text.indexOf(keyword) !== -1) && (!selected || text.indexOf(selected) !== -1);
        card.hidden = !matched;
        if (matched) visible += 1;
      });
      if (empty) empty.hidden = visible !== 0;
    }

    input.addEventListener('input', apply);
    if (select) select.addEventListener('change', apply);
    apply();
  }

  document.addEventListener('DOMContentLoaded', function () {
    toggleMenu();
    initCarousel();
    initFilters();
  });
})();
