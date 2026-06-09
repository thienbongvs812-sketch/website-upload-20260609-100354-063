(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function () {
    document.querySelectorAll('img').forEach(function (img) {
      img.addEventListener('error', function () {
        img.classList.add('is-hidden');
      });
    });

    var toggle = document.querySelector('[data-mobile-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (toggle && panel) {
      toggle.addEventListener('click', function () {
        panel.classList.toggle('is-open');
      });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
      var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
      var current = 0;
      var timer = null;

      function show(index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, idx) {
          slide.classList.toggle('is-active', idx === current);
        });
        dots.forEach(function (dot, idx) {
          dot.classList.toggle('is-active', idx === current);
        });
      }

      function start() {
        if (slides.length < 2) {
          return;
        }
        timer = window.setInterval(function () {
          show(current + 1);
        }, 5200);
      }

      dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
          window.clearInterval(timer);
          show(Number(dot.getAttribute('data-hero-dot')) || 0);
          start();
        });
      });
      start();
    }

    var panelFilter = document.querySelector('[data-filter-panel]');
    var grid = document.querySelector('[data-filter-grid]');
    if (panelFilter && grid) {
      var keywordInput = panelFilter.querySelector('[data-filter-keyword]');
      var typeSelect = panelFilter.querySelector('[data-filter-type]');
      var yearSelect = panelFilter.querySelector('[data-filter-year]');
      var reset = panelFilter.querySelector('[data-filter-reset]');
      var empty = document.querySelector('[data-empty-state]');
      var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
      var params = new URLSearchParams(window.location.search);
      var initialQ = params.get('q');

      if (initialQ && keywordInput) {
        keywordInput.value = initialQ;
      }

      function normalize(value) {
        return String(value || '').trim().toLowerCase();
      }

      function applyFilter() {
        var keyword = normalize(keywordInput && keywordInput.value);
        var type = normalize(typeSelect && typeSelect.value);
        var year = normalize(yearSelect && yearSelect.value);
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-year'),
            card.getAttribute('data-type'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-tags')
          ].join(' '));
          var ok = true;

          if (keyword && haystack.indexOf(keyword) === -1) {
            ok = false;
          }
          if (type && normalize(card.getAttribute('data-type')) !== type) {
            ok = false;
          }
          if (year && normalize(card.getAttribute('data-year')) !== year) {
            ok = false;
          }

          card.hidden = !ok;
          if (ok) {
            visible += 1;
          }
        });

        if (empty) {
          empty.hidden = visible !== 0;
        }
      }

      [keywordInput, typeSelect, yearSelect].forEach(function (control) {
        if (control) {
          control.addEventListener('input', applyFilter);
          control.addEventListener('change', applyFilter);
        }
      });

      if (reset) {
        reset.addEventListener('click', function () {
          if (keywordInput) {
            keywordInput.value = '';
          }
          if (typeSelect) {
            typeSelect.value = '';
          }
          if (yearSelect) {
            yearSelect.value = '';
          }
          applyFilter();
        });
      }

      applyFilter();
    }
  });
})();
