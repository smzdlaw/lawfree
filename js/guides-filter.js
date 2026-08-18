(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    var filterBar = document.querySelector('.guides-filter');
    var buttons = filterBar ? filterBar.querySelectorAll('.guides-filter__btn') : [];
    var cards = document.querySelectorAll('.guide-card[data-category]');

    if (!filterBar || !buttons.length || !cards.length) {
      return;
    }

    var counts = { all: cards.length };

    cards.forEach(function (card) {
      var category = card.getAttribute('data-category');
      if (category) {
        counts[category] = (counts[category] || 0) + 1;
      }
    });

    buttons.forEach(function (button) {
      var filter = button.getAttribute('data-filter');
      var countEl = button.querySelector('.guides-filter__count');

      if (countEl && filter && counts[filter] !== undefined) {
        countEl.textContent = String(counts[filter]);
      }
    });

    function setActiveButton(activeButton) {
      buttons.forEach(function (button) {
        var isActive = button === activeButton;
        button.classList.toggle('active', isActive);
        button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      });
    }

    function applyFilter(filter) {
      cards.forEach(function (card) {
        var category = card.getAttribute('data-category');
        var show = filter === 'all' || category === filter;
        card.hidden = !show;
      });
    }

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        var filter = button.getAttribute('data-filter');
        if (!filter) {
          return;
        }
        setActiveButton(button);
        applyFilter(filter);
      });
    });
  });
})();
