(function() {
  const menuButton = document.querySelector('[data-menu-toggle]');
  const mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function() {
      mobilePanel.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-search-go]').forEach(function(form) {
    form.addEventListener('submit', function(event) {
      event.preventDefault();
      const input = form.querySelector('input[name="q"]');
      const query = input ? input.value.trim() : '';
      const target = query ? './search.html?q=' + encodeURIComponent(query) : './search.html';
      window.location.href = target;
    });
  });

  const hero = document.querySelector('[data-hero]');
  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    const prev = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    let index = 0;
    let timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function start() {
      timer = window.setInterval(function() {
        show(index + 1);
      }, 5600);
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      start();
    }

    if (prev) {
      prev.addEventListener('click', function() {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function() {
        show(index + 1);
        restart();
      });
    }

    dots.forEach(function(dot) {
      dot.addEventListener('click', function() {
        show(Number(dot.getAttribute('data-hero-dot')));
        restart();
      });
    });

    start();
  }

  document.querySelectorAll('[data-search-list]').forEach(function(panel) {
    const input = panel.querySelector('[data-filter-input]');
    const cards = Array.from(panel.querySelectorAll('[data-card]'));
    const chips = Array.from(panel.querySelectorAll('[data-filter-value]'));
    const empty = panel.querySelector('[data-empty-state]');
    let selected = '';

    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    if (input && q) {
      input.value = q;
    }

    function apply() {
      const text = input ? input.value.trim().toLowerCase() : '';
      let visible = 0;

      cards.forEach(function(card) {
        const haystack = (card.getAttribute('data-text') || '').toLowerCase();
        const kind = card.getAttribute('data-kind') || '';
        const matchesText = !text || haystack.indexOf(text) !== -1;
        const matchesKind = !selected || kind === selected;
        const showCard = matchesText && matchesKind;
        card.style.display = showCard ? '' : 'none';
        if (showCard) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    if (input) {
      input.addEventListener('input', apply);
    }

    chips.forEach(function(chip) {
      chip.addEventListener('click', function() {
        selected = chip.getAttribute('data-filter-value') || '';
        chips.forEach(function(item) {
          item.classList.toggle('active', item === chip);
        });
        apply();
      });
    });

    apply();
  });
}());
