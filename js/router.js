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

    try {
      if (
        docType === 'payment-order' ||
        docType === 'promissory-note' ||
        docType === 'divorce'
      ) {
        await Forms.init(docType);
        Preview.update(this.currentDoc, Forms.formData || {});
      } else {
        Forms.currentDoc = docType;
        Forms.formConfig = null;
        Forms.currentStep = 1;

        const formArea = document.getElementById('formArea');
        if (formArea) formArea.innerHTML = Forms.renderPlaceholder();

        Preview.update(docType, {});
      }
    } catch (err) {
      console.error('文件切換失敗：', err);
    }

    this.closeSidebar();
  },

  closeSidebar() {
    document.getElementById('sidebar')?.classList.remove('open');
    document.getElementById('sidebarOverlay')?.classList.remove('visible');
  }
};

window.Router = Router;
