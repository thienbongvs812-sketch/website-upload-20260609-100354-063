(function () {
    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function bindMenu() {
        var button = document.querySelector("[data-menu-toggle]");
        var menu = document.querySelector("[data-mobile-menu]");
        if (!button || !menu) {
            return;
        }
        button.addEventListener("click", function () {
            menu.classList.toggle("is-open");
        });
    }

    function bindImages() {
        selectAll("img").forEach(function (image) {
            image.addEventListener("error", function () {
                image.classList.add("image-missing");
                image.removeAttribute("src");
            });
        });
    }

    function bindHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = selectAll("[data-hero-slide]", hero);
        var dots = selectAll("[data-hero-dot]", hero);
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function restart() {
            if (timer) {
                clearInterval(timer);
            }
            timer = setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        if (!slides.length) {
            return;
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
                restart();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                show(current - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
                restart();
            });
        }

        show(0);
        restart();
    }

    function matchYear(cardYear, selected) {
        var year = parseInt(cardYear || "0", 10);
        if (!selected) {
            return true;
        }
        if (selected === "1990-2019") {
            return year >= 1990 && year <= 2019;
        }
        if (selected === "before-1990") {
            return year > 0 && year < 1990;
        }
        return String(year) === selected;
    }

    function bindCardFilters() {
        var panels = selectAll("[data-filter-panel]");
        panels.forEach(function (panel) {
            var search = panel.querySelector("[data-card-search]");
            var year = panel.querySelector("[data-year-filter]");
            var type = panel.querySelector("[data-type-filter]");
            var scope = panel.parentElement || document;
            var cards = selectAll("[data-card]", scope);
            var empty = scope.querySelector("[data-empty-state]");

            function update() {
                var query = search ? search.value.trim().toLowerCase() : "";
                var selectedYear = year ? year.value : "";
                var selectedType = type ? type.value : "";
                var visible = 0;
                cards.forEach(function (card) {
                    var text = (card.getAttribute("data-search") || "").toLowerCase();
                    var cardType = card.getAttribute("data-type") || "";
                    var ok = true;
                    if (query && text.indexOf(query) === -1) {
                        ok = false;
                    }
                    if (selectedYear && !matchYear(card.getAttribute("data-year"), selectedYear)) {
                        ok = false;
                    }
                    if (selectedType && cardType.indexOf(selectedType) === -1) {
                        ok = false;
                    }
                    card.style.display = ok ? "" : "none";
                    if (ok) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            }

            [search, year, type].forEach(function (element) {
                if (!element) {
                    return;
                }
                element.addEventListener("input", update);
                element.addEventListener("change", update);
            });
        });
    }

    function getQueryValue(name) {
        var params = new URLSearchParams(window.location.search);
        return params.get(name) || "";
    }

    function createSearchCard(movie) {
        var tags = (movie.tags || []).slice(0, 4).map(function (tag) {
            return "<span>" + escapeHtml(tag) + "</span>";
        }).join("");
        return "<article class=\"movie-card\">" +
            "<a class=\"poster-frame\" href=\"" + escapeHtml(movie.url) + "\">" +
            "<img src=\"" + escapeHtml(movie.image) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">" +
            "<span class=\"type-badge\">" + escapeHtml(movie.type) + "</span>" +
            "</a>" +
            "<div class=\"movie-card-body\">" +
            "<div class=\"movie-meta-line\"><span>" + escapeHtml(movie.year) + "</span><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.genre) + "</span></div>" +
            "<h3><a href=\"" + escapeHtml(movie.url) + "\">" + escapeHtml(movie.title) + "</a></h3>" +
            "<p>" + escapeHtml(movie.oneLine) + "</p>" +
            "<div class=\"tag-row\">" + tags + "</div>" +
            "</div>" +
            "</article>";
    }

    function bindGlobalSearch() {
        var input = document.querySelector("[data-global-search-input]");
        var results = document.querySelector("[data-global-results]");
        var summary = document.querySelector("[data-global-search-summary]");
        var form = document.querySelector("[data-global-search-form]");
        var index = window.MOVIE_SEARCH_INDEX || [];
        if (!input || !results || !summary) {
            return;
        }

        function render(query) {
            var normalized = query.trim().toLowerCase();
            var matched = index.filter(function (movie) {
                if (!normalized) {
                    return true;
                }
                return movie.searchText.toLowerCase().indexOf(normalized) !== -1;
            }).slice(0, 160);
            results.innerHTML = matched.map(createSearchCard).join("");
            summary.textContent = normalized ? "搜索结果" : "热门片库推荐";
            bindImages();
        }

        input.value = getQueryValue("q");
        render(input.value);

        input.addEventListener("input", function () {
            render(input.value);
        });

        if (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var url = new URL(window.location.href);
                url.searchParams.set("q", input.value.trim());
                window.history.replaceState({}, "", url.toString());
                render(input.value);
            });
        }
    }

    function initMoviePlayer(source, HlsConstructor) {
        var video = document.querySelector("[data-player-video]");
        var overlay = document.querySelector("[data-play-overlay]");
        var toggle = document.querySelector("[data-play-toggle]");
        if (!video || !source) {
            return;
        }
        var loaded = false;
        var hls = null;

        function load() {
            if (loaded) {
                return;
            }
            loaded = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
                video.load();
                return;
            }
            if (HlsConstructor && HlsConstructor.isSupported()) {
                hls = new HlsConstructor({ enableWorker: true, lowLatencyMode: true });
                hls.loadSource(source);
                hls.attachMedia(video);
                return;
            }
            video.src = source;
            video.load();
        }

        function play() {
            load();
            var attempt = video.play();
            if (attempt && typeof attempt.catch === "function") {
                attempt.catch(function () {});
            }
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
        }

        function pause() {
            video.pause();
        }

        function updateButton() {
            if (!toggle) {
                return;
            }
            toggle.textContent = video.paused ? "播放" : "暂停";
        }

        if (overlay) {
            overlay.addEventListener("click", play);
        }
        if (toggle) {
            toggle.addEventListener("click", function () {
                if (video.paused) {
                    play();
                } else {
                    pause();
                }
            });
        }
        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            } else {
                pause();
            }
        });
        video.addEventListener("play", updateButton);
        video.addEventListener("pause", updateButton);
        window.addEventListener("beforeunload", function () {
            if (hls && typeof hls.destroy === "function") {
                hls.destroy();
            }
        });
    }

    window.initMoviePlayer = initMoviePlayer;

    document.addEventListener("DOMContentLoaded", function () {
        bindMenu();
        bindImages();
        bindHero();
        bindCardFilters();
        bindGlobalSearch();
    });
})();
