(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  function normalize(value) {
    return (value || '').toString().trim().toLowerCase();
  }

  function bindHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var index = 0;

    if (!slides.length) {
      return;
    }

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
      });
    });

    setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  function bindLocalSearch() {
    var localInput = document.querySelector('[data-local-search]');
    var yearFilter = document.querySelector('[data-year-filter]');
    var list = document.querySelector('.searchable-list');
    var resultCount = document.querySelector('[data-result-count]');

    if (!list) {
      return;
    }

    var items = Array.prototype.slice.call(list.children);
    var years = [];

    items.forEach(function (item) {
      var year = item.getAttribute('data-year') || '';
      if (year && years.indexOf(year) === -1) {
        years.push(year);
      }
    });

    years.sort(function (a, b) {
      return Number(b) - Number(a);
    });

    if (yearFilter) {
      years.forEach(function (year) {
        var option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearFilter.appendChild(option);
      });
    }

    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';
    var searchPageInput = document.querySelector('[data-search-page-input]');

    if (initialQuery) {
      if (localInput) {
        localInput.value = initialQuery;
      }
      if (searchPageInput) {
        searchPageInput.value = initialQuery;
      }
    }

    function applyFilter() {
      var query = normalize(localInput ? localInput.value : '');
      var selectedYear = yearFilter ? yearFilter.value : '';
      var visible = 0;

      items.forEach(function (item) {
        var haystack = normalize(item.getAttribute('data-search') || item.textContent);
        var itemYear = item.getAttribute('data-year') || '';
        var matchedQuery = !query || haystack.indexOf(query) !== -1;
        var matchedYear = !selectedYear || itemYear === selectedYear;
        var matched = matchedQuery && matchedYear;

        item.classList.toggle('is-hidden', !matched);
        if (matched) {
          visible += 1;
        }
      });

      if (resultCount) {
        resultCount.textContent = visible ? '找到 ' + visible + ' 条相关内容' : '未找到匹配内容';
      }
    }

    if (localInput) {
      localInput.addEventListener('input', applyFilter);
    }

    if (yearFilter) {
      yearFilter.addEventListener('change', applyFilter);
    }

    applyFilter();
  }

  function bindPlayer() {
    var shell = document.querySelector('[data-player-shell]');
    var video = document.querySelector('[data-player-video]');
    var playButton = document.querySelector('[data-play-button]');

    if (!shell || !video || !playButton) {
      return;
    }

    var src = video.getAttribute('data-src');
    var loaded = false;
    var hlsInstance = null;

    function play() {
      if (!src) {
        return;
      }

      if (!loaded) {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = src;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(src);
          hlsInstance.attachMedia(video);
        } else {
          video.src = src;
        }
        loaded = true;
      }

      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
      shell.classList.add('is-playing');
    }

    playButton.addEventListener('click', play);
    video.addEventListener('play', function () {
      shell.classList.add('is-playing');
    });
    video.addEventListener('pause', function () {
      if (!video.ended) {
        shell.classList.remove('is-playing');
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  bindHero();
  bindLocalSearch();
  bindPlayer();
})();
