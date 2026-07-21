/**
 * 應用程式入口
 */
document.addEventListener('DOMContentLoaded', async () => {
  initSidebarToggle();

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
