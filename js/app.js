/**
 * 應用程式入口
 */
document.addEventListener('DOMContentLoaded', async () => {
  initSidebarToggle();
  initSidebarBrandHeightSync();
  initViewTabs();
  Preview.init();
  Router.init();
  Wizard.init(1);
  Download.init();

  const initialDoc = Router.getInitialDocType();
  const rawDoc = new URLSearchParams(window.location.search).get('doc');
  const needsUrlReplace = !rawDoc || !Router.isValidDocType(rawDoc);

  await Router.switchDoc(initialDoc, {
    updateHistory: needsUrlReplace ? 'replace' : false
  });
});

function initSidebarBrandHeightSync() {
  const rightHeader = document.querySelector('.main__header-bar');
  const sidebarBrand = document.querySelector('.sidebar__brand');

  if (!rightHeader || !sidebarBrand) return;

  const DESKTOP_MIN_WIDTH = 769;

  function syncSidebarBrandHeight() {
    if (window.innerWidth >= DESKTOP_MIN_WIDTH) {
      const height = Math.ceil(rightHeader.getBoundingClientRect().height);
      sidebarBrand.style.height = `${height}px`;
      sidebarBrand.style.minHeight = `${height}px`;
    } else {
      sidebarBrand.style.height = '';
      sidebarBrand.style.minHeight = '';
    }
  }

  syncSidebarBrandHeight();

  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(syncSidebarBrandHeight);
    observer.observe(rightHeader);
  }

  window.addEventListener('resize', syncSidebarBrandHeight);
  window.addEventListener('load', syncSidebarBrandHeight);
}

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

    if (view === 'preview') {
      Preview.scheduleResize();
    }
  };

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      setView(tab.dataset.view);
    });
  });

  setView('form');
};
