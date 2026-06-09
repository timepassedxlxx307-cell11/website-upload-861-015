(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function setupMobileMenu() {
        var button = qs("[data-mobile-toggle]");
        var panel = qs("[data-mobile-panel]");
        if (!button || !panel) {
            return;
        }
        button.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    function setupSearchForms() {
        qsa("[data-site-search]").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var input = qs("input[name='q']", form);
                var value = input ? input.value.trim() : "";
                if (value) {
                    window.location.href = "./search.html?q=" + encodeURIComponent(value);
                }
            });
        });
    }

    function setupHero() {
        var hero = qs("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = qsa("[data-hero-slide]", hero);
        var dots = qsa("[data-hero-dot]", hero);
        var prev = qs("[data-hero-prev]", hero);
        var next = qs("[data-hero-next]", hero);
        var index = 0;
        var timer;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function start() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5000);
        }

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
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
                start();
            });
        });
        show(0);
        start();
    }

    function setupFilters() {
        qsa("[data-filter-section]").forEach(function (section) {
            var input = qs("[data-filter-input]", section);
            var select = qs("[data-filter-type]", section);
            var cards = qsa("[data-movie-card]", section);

            function apply() {
                var keyword = input ? input.value.trim().toLowerCase() : "";
                var type = select ? select.value : "";
                cards.forEach(function (card) {
                    var text = card.getAttribute("data-search") || "";
                    var cardType = card.getAttribute("data-type") || "";
                    var matchedText = !keyword || text.indexOf(keyword) !== -1;
                    var matchedType = !type || cardType === type || cardType.indexOf(type) !== -1;
                    card.classList.toggle("is-hidden", !(matchedText && matchedType));
                });
            }

            if (input) {
                input.addEventListener("input", apply);
            }
            if (select) {
                select.addEventListener("change", apply);
            }
        });
    }

    function createResultCard(movie) {
        var tags = (movie.tags || []).slice(0, 2).map(function (tag) {
            return "<span>" + escapeHtml(tag) + "</span>";
        }).join("");
        return "<a class=\"movie-card\" href=\"" + movie.url + "\">" +
            "<figure><img src=\"" + movie.cover + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">" +
            "<span class=\"year-pill\">" + movie.year + "</span></figure>" +
            "<div class=\"card-copy\"><h2>" + escapeHtml(movie.title) + "</h2>" +
            "<p>" + escapeHtml(movie.oneLine) + "</p>" +
            "<div class=\"meta-line\"><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.type) + "</span></div>" +
            "<div class=\"tag-row\">" + tags + "</div></div></a>";
    }

    function escapeHtml(value) {
        return String(value || "").replace(/[&<>\"']/g, function (char) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                "\"": "&quot;",
                "'": "&#039;"
            }[char];
        });
    }

    function setupSearchPage() {
        var form = qs("[data-search-page-form]");
        var input = qs("[data-search-page-input]");
        var results = qs("[data-search-results]");
        var status = qs("[data-search-status]");
        if (!form || !input || !results || !status || !window.SEARCH_MOVIES) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        input.value = params.get("q") || "";

        function render() {
            var value = input.value.trim().toLowerCase();
            if (!value) {
                status.textContent = "请输入关键词开始搜索。";
                results.innerHTML = "";
                return;
            }
            var matched = window.SEARCH_MOVIES.filter(function (movie) {
                return movie.index.indexOf(value) !== -1;
            }).slice(0, 120);
            status.textContent = matched.length ? "搜索结果" : "没有找到匹配内容";
            results.innerHTML = matched.map(createResultCard).join("");
        }

        form.addEventListener("submit", function (event) {
            event.preventDefault();
            var value = input.value.trim();
            var nextUrl = value ? "./search.html?q=" + encodeURIComponent(value) : "./search.html";
            window.history.replaceState(null, "", nextUrl);
            render();
        });
        input.addEventListener("input", render);
        render();
    }

    window.initMoviePlayer = function (id, sourceUrl) {
        var video = document.getElementById(id);
        if (!video) {
            return;
        }
        var shell = video.closest(".player-shell");
        var button = shell ? qs("[data-play-button]", shell) : null;
        var attached = false;
        var hlsInstance = null;

        function attach() {
            if (attached) {
                return;
            }
            attached = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = sourceUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(sourceUrl);
                hlsInstance.attachMedia(video);
            } else {
                video.src = sourceUrl;
            }
        }

        function play() {
            attach();
            video.controls = true;
            if (button) {
                button.classList.add("is-hidden");
            }
            var promise = video.play();
            if (promise && promise.catch) {
                promise.catch(function () {});
            }
        }

        if (button) {
            button.addEventListener("click", play);
        }
        video.addEventListener("click", function () {
            if (!attached || video.paused) {
                play();
            }
        });
        window.addEventListener("beforeunload", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };

    document.addEventListener("DOMContentLoaded", function () {
        setupMobileMenu();
        setupSearchForms();
        setupHero();
        setupFilters();
        setupSearchPage();
    });
})();
