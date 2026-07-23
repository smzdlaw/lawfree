/**
 * 應用程式入口
 */
document.addEventListener('DOMContentLoaded', async () => {
  initSidebarToggle();
  initViewTabs();

  Router.init();
  Wizard.init(1);
  Download.init();
  await Forms.init('payment-order');
});

function initSidebarToggle() {
  const menuToggle = document.getElementById('menuToggle');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');

  menuToggle?.addEventListener('click', () => {
    sidebar?.classList.toggle('open');
    overlay?.classList.toggle('visible');
  });

  overlay?.addEventListener('click', () => {
    sidebar?.classList.remove('open');
    overlay?.classList.remove('visible');
  });
}

function initViewTabs() {
  const tabs = document.querySelectorAll('.view-tab[data-view]');
  const formArea = document.getElementById('formArea');
  const previewArea = document.getElementById('previewArea');
  const wizard = document.getElementById('wizard');

  if (!tabs.length) return;

  const setView = (view) => {
    tabs.forEach((tab) => {
      const isActive = tab.dataset.view === view;
      tab.classList.toggle('view-tab--active', isActive);
      tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    formArea?.classList.toggle('content-panel--hidden', view !== 'form');
    previewArea?.classList.toggle('content-panel--hidden', view !== 'preview');
    wizard?.classList.toggle('content-panel--hidden', view !== 'form');
  };

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      setView(tab.dataset.view);
    });
  });

  setView('form');
}
