(function () {
  "use strict";

  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initMobileNav() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-nav]");
    if (!toggle || !menu) {
      return;
    }

    toggle.addEventListener("click", function () {
      var isOpen = menu.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  }

  function initHeroSlider() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }

    var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
    var previous = slider.querySelector("[data-hero-prev]");
    var next = slider.querySelector("[data-hero-next]");
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

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        start();
      });
    });

    if (previous) {
      previous.addEventListener("click", function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        start();
      });
    }

    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function initCatalogFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));
    panels.forEach(function (panel) {
      var root = document.querySelector(panel.getAttribute("data-filter-panel"));
      if (!root) {
        return;
      }

      var input = panel.querySelector("[data-filter-keyword]");
      var year = panel.querySelector("[data-filter-year]");
      var region = panel.querySelector("[data-filter-region]");
      var cards = Array.prototype.slice.call(root.querySelectorAll("[data-catalog-card]"));

      function applyFilter() {
        var keyword = normalize(input && input.value);
        var selectedYear = normalize(year && year.value);
        var selectedRegion = normalize(region && region.value);

        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-year"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-tags")
          ].join(" "));

          var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
          var matchYear = !selectedYear || normalize(card.getAttribute("data-year")) === selectedYear;
          var matchRegion = !selectedRegion || normalize(card.getAttribute("data-region")) === selectedRegion;
          card.style.display = matchKeyword && matchYear && matchRegion ? "" : "none";
        });
      }

      [input, year, region].forEach(function (control) {
        if (control) {
          control.addEventListener("input", applyFilter);
          control.addEventListener("change", applyFilter);
        }
      });

      applyFilter();
    });
  }

  function movieCard(item, rootPath) {
    var tags = Array.isArray(item.tags) ? item.tags.slice(0, 3).join(" / ") : "";
    return [
      '<article class="movie-card">',
      '  <a class="card-media" href="' + rootPath + item.link + '">',
      '    <img src="' + rootPath + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
      '    <span class="badge">' + escapeHtml(String(item.year)) + '</span>',
      '    <span class="play-badge">▶</span>',
      '  </a>',
      '  <div class="card-body">',
      '    <h3 class="card-title"><a href="' + rootPath + item.link + '">' + escapeHtml(item.title) + '</a></h3>',
      '    <p class="card-desc">' + escapeHtml(item.description) + '</p>',
      '    <div class="card-meta">',
      '      <span>' + escapeHtml(item.region) + '</span>',
      '      <span>' + escapeHtml(item.type) + '</span>',
      '      <span>' + escapeHtml(tags) + '</span>',
      '    </div>',
      '  </div>',
      '</article>'
    ].join("");
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function initSearchPage() {
    var results = document.querySelector("[data-search-results]");
    var input = document.querySelector("[data-search-input]");
    if (!results || !input || !window.SEARCH_INDEX) {
      return;
    }

    var rootPath = document.body.getAttribute("data-root") || "";
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";
    input.value = initialQuery;

    function runSearch() {
      var keyword = normalize(input.value);
      var items = window.SEARCH_INDEX.filter(function (item) {
        if (!keyword) {
          return true;
        }

        return normalize([
          item.title,
          item.description,
          item.region,
          item.type,
          item.year,
          item.genre,
          Array.isArray(item.tags) ? item.tags.join(" ") : ""
        ].join(" ")).indexOf(keyword) !== -1;
      }).slice(0, 120);

      if (!items.length) {
        results.innerHTML = '<div class="empty-state">没有找到匹配的影片，请尝试更换关键词。</div>';
        return;
      }

      results.innerHTML = items.map(function (item) {
        return movieCard(item, rootPath);
      }).join("");
    }

    input.addEventListener("input", runSearch);
    runSearch();
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player-card]"));
    players.forEach(function (card) {
      var video = card.querySelector("video");
      var button = card.querySelector("[data-player-start]");
      var message = card.querySelector("[data-player-message]");
      if (!video || !button) {
        return;
      }

      var source = video.getAttribute("data-src") || button.getAttribute("data-src");

      function showMessage(text) {
        if (!message) {
          return;
        }
        message.textContent = text;
        message.classList.add("is-visible");
        window.setTimeout(function () {
          message.classList.remove("is-visible");
        }, 4200);
      }

      function attachSource() {
        if (!source || video.getAttribute("data-loaded") === "true") {
          return;
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(source);
          hls.attachMedia(video);
          video._hlsInstance = hls;
        } else {
          video.src = source;
        }

        video.setAttribute("data-loaded", "true");
      }

      function playVideo() {
        attachSource();
        card.classList.add("is-playing");
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {
            showMessage("请再次点击播放按钮或使用视频控件开始播放。");
          });
        }
      }

      button.addEventListener("click", playVideo);
      video.addEventListener("click", function () {
        if (video.paused) {
          playVideo();
        }
      });
    });
  }

  ready(function () {
    initMobileNav();
    initHeroSlider();
    initCatalogFilters();
    initSearchPage();
    initPlayers();
  });
})();
