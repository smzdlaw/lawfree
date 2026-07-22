/**
 * 文件類型路由
 */
const Router = {
  docTitles: {
    'payment-order': '支付命令聲請狀',
    'promissory-note': '本票裁定聲請狀',
    divorce: '離婚協議書'
  },

  currentDoc: 'payment-order',

  init() {
    this.bindSidebar();
  },

  bindSidebar() {
    const nav = document.getElementById('sidebarNav');
    if (!nav) return;

    nav.addEventListener('click', (e) => {
      const item = e.target.closest('.sidebar__item');
      if (!item) return;

      const docType = item.dataset.doc;
      this.switchDoc(docType);
    });
  },

  async switchDoc(docType) {
    this.currentDoc = docType;

    document.querySelectorAll('.sidebar__item').forEach((el) => {
      el.classList.toggle('active', el.dataset.doc === docType);
    });

    await Forms.init(docType);

    Wizard.goTo(Forms.currentStep);

    this.closeSidebar();
  },

  closeSidebar() {
    document.getElementById('sidebar')?.classList.remove('open');
    document.getElementById('sidebarOverlay')?.classList.remove('visible');
  }
};

window.Router = Router;