(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function initMenu() {
        var button = document.querySelector("[data-menu-button]");
        var menu = document.querySelector("[data-mobile-menu]");
        if (!button || !menu) {
            return;
        }
        button.addEventListener("click", function () {
            menu.classList.toggle("is-open");
        });
    }

    function initHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;
        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }
        function start() {
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                if (timer) {
                    window.clearInterval(timer);
                }
                show(i);
                start();
            });
        });
        show(0);
        start();
    }

    function initGlobalSearch() {
        Array.prototype.slice.call(document.querySelectorAll("[data-global-search]")).forEach(function (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var input = form.querySelector("input");
                var value = input ? input.value.trim() : "";
                var url = "./search.html";
                if (value) {
                    url += "?q=" + encodeURIComponent(value);
                }
                window.location.href = url;
            });
        });
    }

    function initFilters() {
        var input = document.querySelector("[data-search-input]");
        var filters = Array.prototype.slice.call(document.querySelectorAll("[data-filter-field]"));
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
        var empty = document.querySelector("[data-empty-state]");
        if (!cards.length || (!input && !filters.length)) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var q = params.get("q");
        if (q && input) {
            input.value = q;
        }
        function cardText(card) {
            return normalize([
                card.getAttribute("data-title"),
                card.getAttribute("data-region"),
                card.getAttribute("data-type"),
                card.getAttribute("data-year"),
                card.getAttribute("data-genre"),
                card.getAttribute("data-tags"),
                card.getAttribute("data-category")
            ].join(" "));
        }
        function apply() {
            var keyword = input ? normalize(input.value) : "";
            var activeFilters = filters.map(function (filter) {
                return {
                    key: filter.getAttribute("data-filter-field"),
                    value: normalize(filter.value)
                };
            }).filter(function (item) {
                return item.key && item.value;
            });
            var visible = 0;
            cards.forEach(function (card) {
                var text = cardText(card);
                var matched = !keyword || text.indexOf(keyword) !== -1;
                activeFilters.forEach(function (item) {
                    if (normalize(card.getAttribute("data-" + item.key)) !== item.value) {
                        matched = false;
                    }
                });
                card.hidden = !matched;
                if (matched) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle("is-visible", visible === 0);
            }
        }
        if (input) {
            input.addEventListener("input", apply);
        }
        filters.forEach(function (filter) {
            filter.addEventListener("change", apply);
        });
        apply();
    }

    function initPlayer(source) {
        var video = document.getElementById("movieVideo");
        var button = document.getElementById("playButton");
        var shell = document.getElementById("playerShell");
        if (!video || !source) {
            return;
        }
        var loaded = false;
        var hls = null;
        function bindSource() {
            if (loaded) {
                return;
            }
            loaded = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                return;
            }
            video.src = source;
        }
        function start() {
            bindSource();
            if (button) {
                button.classList.add("is-hidden");
            }
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {
                    if (button) {
                        button.classList.remove("is-hidden");
                    }
                });
            }
        }
        if (button) {
            button.addEventListener("click", start);
        }
        if (shell) {
            shell.addEventListener("click", function (event) {
                if (event.target === video) {
                    return;
                }
                if (!loaded) {
                    start();
                }
            });
        }
        video.addEventListener("play", function () {
            if (button) {
                button.classList.add("is-hidden");
            }
        });
        window.addEventListener("pagehide", function () {
            if (hls) {
                hls.destroy();
                hls = null;
            }
        });
    }

    window.initPlayer = initPlayer;

    ready(function () {
        initMenu();
        initHero();
        initGlobalSearch();
        initFilters();
    });
})();
