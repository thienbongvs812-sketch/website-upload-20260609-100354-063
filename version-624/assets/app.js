(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileMenu = document.querySelector('[data-mobile-menu]');
    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', function () {
            mobileMenu.classList.toggle('open');
        });
    }

    var slider = document.querySelector('[data-hero-slider]');
    if (slider) {
        var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
        var current = 0;
        var showSlide = function (index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        };
        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
            });
        });
        if (slides.length > 1) {
            setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }
    }

    var localSearch = document.querySelector('[data-local-search]');
    if (localSearch) {
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
        localSearch.addEventListener('input', function () {
            var keyword = localSearch.value.trim().toLowerCase();
            cards.forEach(function (card) {
                var text = [
                    card.getAttribute('data-title'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-genre')
                ].join(' ').toLowerCase();
                card.style.display = text.indexOf(keyword) > -1 ? '' : 'none';
            });
        });
    }

    var globalForm = document.querySelector('[data-global-search]');
    var globalResults = document.querySelector('[data-search-results]');
    if (globalForm && globalResults && Array.isArray(window.SEARCH_ITEMS || SEARCH_ITEMS)) {
        var items = window.SEARCH_ITEMS || SEARCH_ITEMS;
        var input = globalForm.querySelector('input[name="q"]');
        var render = function (query) {
            var keyword = (query || '').trim().toLowerCase();
            var result = items.filter(function (item) {
                return !keyword || item.search.toLowerCase().indexOf(keyword) > -1;
            }).slice(0, 80);
            globalResults.innerHTML = result.map(function (item) {
                return '<a class="search-result-card" href="' + item.url + '">' +
                    '<img src="' + item.cover + '" alt="' + item.title.replace(/"/g, '&quot;') + '">' +
                    '<div><h3>' + item.title + '</h3><p>' + item.year + ' · ' + item.region + ' · ' + item.category + '</p></div>' +
                    '</a>';
            }).join('');
        };
        globalForm.addEventListener('submit', function (event) {
            event.preventDefault();
            render(input.value);
        });
        input.addEventListener('input', function () {
            render(input.value);
        });
        var params = new URLSearchParams(window.location.search);
        if (params.get('q')) {
            input.value = params.get('q');
        }
        render(input.value);
    }

    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
    players.forEach(function (player) {
        var video = player.querySelector('video');
        var button = player.querySelector('[data-play]');
        if (!video || !button) {
            return;
        }
        var source = video.getAttribute('data-src');
        var start = function () {
            if (!source) {
                return;
            }
            if (!video.getAttribute('data-ready')) {
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                } else if (window.Hls && window.Hls.isSupported()) {
                    var hls = new Hls();
                    hls.loadSource(source);
                    hls.attachMedia(video);
                } else {
                    video.src = source;
                }
                video.setAttribute('data-ready', 'true');
            }
            player.classList.add('is-playing');
            var playPromise = video.play();
            if (playPromise && playPromise.catch) {
                playPromise.catch(function () {});
            }
        };
        button.addEventListener('click', start);
        video.addEventListener('click', function () {
            if (video.paused) {
                start();
            }
        });
    });
})();
