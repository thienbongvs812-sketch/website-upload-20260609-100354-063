(function () {
    const menuButton = document.querySelector(".nav-toggle");
    const menu = document.querySelector(".nav-menu");

    if (menuButton && menu) {
        menuButton.addEventListener("click", function () {
            const open = menu.classList.toggle("is-open");
            menuButton.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    const slides = Array.from(document.querySelectorAll(".hero-slide"));
    const dots = Array.from(document.querySelectorAll(".hero-dot"));
    const prev = document.querySelector(".hero-prev");
    const next = document.querySelector(".hero-next");
    let slideIndex = 0;
    let timer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        slideIndex = (index + slides.length) % slides.length;
        slides.forEach(function (slide, current) {
            slide.classList.toggle("is-active", current === slideIndex);
        });
        dots.forEach(function (dot, current) {
            dot.classList.toggle("is-active", current === slideIndex);
        });
    }

    function startSlider() {
        if (slides.length < 2) {
            return;
        }
        clearInterval(timer);
        timer = setInterval(function () {
            showSlide(slideIndex + 1);
        }, 5200);
    }

    if (slides.length) {
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                showSlide(Number(dot.getAttribute("data-slide")) || 0);
                startSlider();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                showSlide(slideIndex - 1);
                startSlider();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                showSlide(slideIndex + 1);
                startSlider();
            });
        }

        startSlider();
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function filterScope(scope) {
        const panel = scope.closest("main") || document;
        const queryInput = panel.querySelector(".site-filter");
        const categorySelect = panel.querySelector(".category-filter");
        const yearSelect = panel.querySelector(".year-filter");
        const query = normalize(queryInput && queryInput.value);
        const category = normalize(categorySelect && categorySelect.value);
        const year = normalize(yearSelect && yearSelect.value);
        const items = Array.from(scope.querySelectorAll(".movie-card, .rank-item"));

        items.forEach(function (item) {
            const text = normalize([
                item.getAttribute("data-title"),
                item.getAttribute("data-year"),
                item.getAttribute("data-genre"),
                item.getAttribute("data-region"),
                item.getAttribute("data-category"),
                item.textContent
            ].join(" "));
            const itemCategory = normalize(item.getAttribute("data-category"));
            const itemYear = normalize(item.getAttribute("data-year"));
            const matchQuery = !query || text.indexOf(query) !== -1;
            const matchCategory = !category || itemCategory === category;
            const matchYear = !year || itemYear.indexOf(year) !== -1;
            item.classList.toggle("is-filter-hidden", !(matchQuery && matchCategory && matchYear));
        });
    }

    const filterInputs = Array.from(document.querySelectorAll(".site-filter, .category-filter, .year-filter"));
    filterInputs.forEach(function (input) {
        input.addEventListener("input", function () {
            document.querySelectorAll("[data-filter-scope]").forEach(filterScope);
        });
        input.addEventListener("change", function () {
            document.querySelectorAll("[data-filter-scope]").forEach(filterScope);
        });
    });

    let hlsLoading = null;

    function loadHls() {
        if (window.Hls) {
            return Promise.resolve(window.Hls);
        }
        if (hlsLoading) {
            return hlsLoading;
        }
        hlsLoading = new Promise(function (resolve, reject) {
            const script = document.createElement("script");
            script.src = "https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js";
            script.async = true;
            script.onload = function () {
                resolve(window.Hls);
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });
        return hlsLoading;
    }

    function playStream(video, stream) {
        if (!video || !stream) {
            return;
        }
        const nativeHls = video.canPlayType("application/vnd.apple.mpegurl");
        if (nativeHls) {
            video.src = stream;
            video.play().catch(function () {});
            return;
        }
        loadHls().then(function (Hls) {
            if (Hls && Hls.isSupported()) {
                const player = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                player.loadSource(stream);
                player.attachMedia(video);
                player.on(Hls.Events.MANIFEST_PARSED, function () {
                    video.play().catch(function () {});
                });
            } else {
                video.src = stream;
                video.play().catch(function () {});
            }
        }).catch(function () {
            video.src = stream;
            video.play().catch(function () {});
        });
    }

    document.querySelectorAll(".play-trigger").forEach(function (button) {
        button.addEventListener("click", function () {
            const id = button.getAttribute("data-video");
            const stream = button.getAttribute("data-stream");
            const video = document.getElementById(id);
            button.classList.add("is-hidden");
            playStream(video, stream);
        });
    });
})();
