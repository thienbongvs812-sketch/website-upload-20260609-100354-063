(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");

    if (toggle && panel) {
      toggle.addEventListener("click", function () {
        panel.classList.toggle("is-open");
      });
    }

    Array.prototype.forEach.call(document.querySelectorAll(".search-form"), function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector(".search-input");
        var value = input ? input.value.trim() : "";
        var action = form.getAttribute("action") || "search.html";
        if (value) {
          window.location.href = action + "?q=" + encodeURIComponent(value);
        } else {
          window.location.href = action;
        }
      });
    });

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var current = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === current);
      });
    }

    if (slides.length) {
      dots.forEach(function (dot, i) {
        dot.addEventListener("click", function () {
          showSlide(i);
        });
      });
      window.setInterval(function () {
        showSlide(current + 1);
      }, 5600);
    }

    var filterPage = document.querySelector("[data-filter-page]");
    if (filterPage) {
      var cards = Array.prototype.slice.call(filterPage.querySelectorAll(".movie-card"));
      var keyword = filterPage.querySelector("[data-filter-keyword]");
      var type = filterPage.querySelector("[data-filter-type]");
      var year = filterPage.querySelector("[data-filter-year]");
      var region = filterPage.querySelector("[data-filter-region]");
      var empty = filterPage.querySelector(".empty-state");
      var params = new URLSearchParams(window.location.search);
      var preset = params.get("q") || "";

      if (keyword && preset) {
        keyword.value = preset;
      }

      function pass(card) {
        var q = keyword ? keyword.value.trim().toLowerCase() : "";
        var t = type ? type.value : "";
        var y = year ? year.value : "";
        var r = region ? region.value : "";
        var search = (card.getAttribute("data-search") || "").toLowerCase();
        var cardType = card.getAttribute("data-type") || "";
        var cardYear = card.getAttribute("data-year") || "";
        var cardRegion = card.getAttribute("data-region") || "";
        return (!q || search.indexOf(q) !== -1) && (!t || cardType === t) && (!y || cardYear === y) && (!r || cardRegion.indexOf(r) !== -1);
      }

      function applyFilters() {
        var visible = 0;
        cards.forEach(function (card) {
          var ok = pass(card);
          card.style.display = ok ? "" : "none";
          if (ok) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      [keyword, type, year, region].forEach(function (control) {
        if (control) {
          control.addEventListener("input", applyFilters);
          control.addEventListener("change", applyFilters);
        }
      });

      applyFilters();
    }
  });
})();
