(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function initializeNavigation() {
    var toggle = document.querySelector('[data-nav-toggle]');
    var links = document.querySelector('[data-nav-links]');
    if (!toggle || !links) {
      return;
    }
    toggle.addEventListener('click', function () {
      links.classList.toggle('is-open');
    });
  }

  function initializeHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var miniCards = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-mini]'));
    var backdrop = hero.querySelector('[data-hero-backdrop]');
    var current = 0;
    var timer = null;

    function setSlide(index) {
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
      miniCards.forEach(function (card, cardIndex) {
        card.classList.toggle('is-active', cardIndex === current);
      });
      if (backdrop) {
        var imageUrl = slides[current].getAttribute('data-bg');
        if (imageUrl) {
          backdrop.style.backgroundImage = "url('" + imageUrl + "')";
        }
      }
    }

    function startTimer() {
      stopTimer();
      timer = window.setInterval(function () {
        setSlide(current + 1);
      }, 5200);
    }

    function stopTimer() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    if (prev) {
      prev.addEventListener('click', function () {
        setSlide(current - 1);
        startTimer();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        setSlide(current + 1);
        startTimer();
      });
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        setSlide(index);
        startTimer();
      });
    });
    miniCards.forEach(function (card, index) {
      card.addEventListener('mouseenter', function () {
        setSlide(index);
      });
    });

    setSlide(0);
    startTimer();
  }

  function initializeCardFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]'));
    scopes.forEach(function (scope) {
      var input = scope.querySelector('[data-filter-input]');
      var yearSelect = scope.querySelector('[data-filter-year]');
      var typeSelect = scope.querySelector('[data-filter-type]');
      var count = scope.querySelector('[data-filter-count]');
      var grid = scope.nextElementSibling;
      if (!grid) {
        return;
      }
      var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));

      function applyFilter() {
        var keyword = input ? input.value.trim().toLowerCase() : '';
        var year = yearSelect ? yearSelect.value : '';
        var type = typeSelect ? typeSelect.value : '';
        var visible = 0;

        cards.forEach(function (card) {
          var text = card.getAttribute('data-title') || '';
          var cardYear = card.getAttribute('data-year') || '';
          var cardType = card.getAttribute('data-type') || '';
          var matchesKeyword = !keyword || text.indexOf(keyword) !== -1;
          var matchesYear = !year || cardYear === year;
          var matchesType = !type || cardType === type;
          var show = matchesKeyword && matchesYear && matchesType;
          card.classList.toggle('is-hidden', !show);
          if (show) {
            visible += 1;
          }
        });

        if (count) {
          count.textContent = String(visible);
        }
      }

      [input, yearSelect, typeSelect].forEach(function (element) {
        if (element) {
          element.addEventListener('input', applyFilter);
          element.addEventListener('change', applyFilter);
        }
      });
      applyFilter();
    });
  }

  function initializeSearchPage() {
    var app = document.querySelector('[data-search-app]');
    if (!app || !window.SEARCH_MOVIES) {
      return;
    }

    var queryInput = app.querySelector('[data-search-query]');
    var yearInput = app.querySelector('[data-search-year]');
    var typeInput = app.querySelector('[data-search-type]');
    var results = app.querySelector('[data-search-results]');
    var count = app.querySelector('[data-search-count]');
    var params = new URLSearchParams(window.location.search);

    if (params.get('q') && queryInput) {
      queryInput.value = params.get('q');
    }

    function appendText(element, text) {
      element.textContent = text || '';
    }

    function makeCard(movie) {
      var article = document.createElement('article');
      article.className = 'movie-card';

      var poster = document.createElement('a');
      poster.className = 'movie-poster';
      poster.href = movie.url;

      var image = document.createElement('img');
      image.src = movie.cover;
      image.alt = movie.title;
      image.loading = 'lazy';
      poster.appendChild(image);

      var badge = document.createElement('span');
      badge.className = 'poster-badge';
      appendText(badge, movie.type);
      poster.appendChild(badge);

      var year = document.createElement('span');
      year.className = 'poster-year';
      appendText(year, movie.year);
      poster.appendChild(year);

      var body = document.createElement('div');
      body.className = 'movie-card-body';

      var title = document.createElement('a');
      title.className = 'movie-title';
      title.href = movie.url;
      appendText(title, movie.title);
      body.appendChild(title);

      var description = document.createElement('p');
      appendText(description, movie.oneLine);
      body.appendChild(description);

      var meta = document.createElement('div');
      meta.className = 'movie-meta';
      var category = document.createElement('a');
      category.href = movie.categoryUrl;
      appendText(category, movie.category);
      var region = document.createElement('span');
      appendText(region, movie.region);
      meta.appendChild(category);
      meta.appendChild(region);
      body.appendChild(meta);

      article.appendChild(poster);
      article.appendChild(body);
      return article;
    }

    function render() {
      var query = queryInput ? queryInput.value.trim().toLowerCase() : '';
      var year = yearInput ? yearInput.value.trim() : '';
      var type = typeInput ? typeInput.value.trim().toLowerCase() : '';
      var matches = window.SEARCH_MOVIES.filter(function (movie) {
        var text = (movie.title + ' ' + movie.oneLine + ' ' + movie.region + ' ' + movie.type + ' ' + movie.genre + ' ' + movie.tags).toLowerCase();
        var okQuery = !query || text.indexOf(query) !== -1;
        var okYear = !year || String(movie.year) === year;
        var okType = !type || String(movie.type).toLowerCase().indexOf(type) !== -1;
        return okQuery && okYear && okType;
      }).slice(0, 96);

      results.innerHTML = '';
      matches.forEach(function (movie) {
        results.appendChild(makeCard(movie));
      });
      if (count) {
        count.textContent = matches.length + ' 条';
      }
    }

    [queryInput, yearInput, typeInput].forEach(function (element) {
      if (element) {
        element.addEventListener('input', render);
      }
    });
    render();
  }

  function initializePlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
    players.forEach(function (player) {
      var video = player.querySelector('video');
      var overlay = player.querySelector('.player-overlay');
      var status = player.querySelector('[data-player-status]');
      var source = player.getAttribute('data-video-url');
      var attached = false;
      var hlsInstance = null;

      function setStatus(text) {
        if (status) {
          status.textContent = text;
        }
      }

      function attachSource() {
        if (attached || !video || !source) {
          return;
        }
        attached = true;

        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            setStatus('播放源已就绪');
          });
          hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
            if (!data || !data.fatal) {
              return;
            }
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              setStatus('网络异常，正在重试');
              hlsInstance.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              setStatus('媒体异常，正在恢复');
              hlsInstance.recoverMediaError();
            } else {
              setStatus('播放器错误，请刷新页面');
            }
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          setStatus('播放源已就绪');
        } else {
          setStatus('当前浏览器暂不支持 HLS 播放');
        }
      }

      function playVideo(event) {
        if (event) {
          event.preventDefault();
        }
        attachSource();
        if (!video) {
          return;
        }
        video.controls = true;
        player.classList.add('is-playing');
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {
            setStatus('请再次点击播放');
            player.classList.remove('is-playing');
          });
        }
      }

      if (overlay) {
        overlay.addEventListener('click', playVideo);
      }
      player.addEventListener('click', function (event) {
        if (event.target === video) {
          return;
        }
        playVideo(event);
      });
      if (video) {
        video.addEventListener('play', function () {
          player.classList.add('is-playing');
          setStatus('正在播放');
        });
        video.addEventListener('pause', function () {
          setStatus('已暂停');
        });
        video.addEventListener('ended', function () {
          setStatus('播放结束');
        });
      }
      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  function handleMissingImages() {
    var images = Array.prototype.slice.call(document.querySelectorAll('img'));
    images.forEach(function (image) {
      image.addEventListener('error', function () {
        image.style.opacity = '0';
      });
    });
  }

  ready(function () {
    initializeNavigation();
    initializeHero();
    initializeCardFilters();
    initializeSearchPage();
    initializePlayers();
    handleMissingImages();
  });
})();
