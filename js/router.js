/**
 * 文件類型路由
 */
const Router = {
  docTitles: {
    'payment-order': '支付命令聲請狀',
    'promissory-note': '本票裁定聲請狀',
    divorce: '離婚協議書',
    iou: '借據',
    'promissory-bill': '本票'
  },

  defaultPageMeta: {
    title: 'slawfree 免費法律文件快速產生器｜支付命令、本票裁定、離婚協議書',
    description: 'slawfree 免費法律文件快速產生器，支援支付命令、本票裁定、離婚協議書等法律文件，免註冊、免登入、免安裝，一鍵下載 PDF。'
  },

  docGuides: {
    'payment-order': {
      text: '第一次聲請支付命令，不確定適用條件或辦理流程？',
      linkText: '查看支付命令完整指南 →',
      url: '/guides/payment-order/'
    },
    'promissory-note': {
      text: '準備聲請本票裁定前，建議先了解聲請條件、法院程序及注意事項。',
      linkText: '查看本票裁定完整指南 →',
      url: '/guides/promissory-note-ruling/'
    },
    iou: {
      text: '第一次製作借據，不確定借款金額、還款期限或利息應怎麼寫？',
      linkText: '查看借據完整指南 →',
      url: '/guides/loan-agreement/'
    },
    'promissory-bill': {
      text: '簽本票前，建議先確認必要記載事項、發票日、金額及簽名方式。',
      linkText: '查看本票完整指南 →',
      url: '/guides/promissory-note/'
    },
    divorce: {
      text: '製作離婚協議書前，可先了解證人、未成年子女、扶養費及財產約定等注意事項。',
      linkText: '查看離婚協議書完整指南 →',
      url: '/guides/divorce-agreement/'
    }
  },

  docPageMeta: {
    iou: {
      title: '免費借據產生器｜線上製作借據與 PDF 下載｜SLawFree',
      description: '免費線上製作借據，填寫出借人、借款人、借款金額、利息、還款期限及交付方式，即時預覽並下載 PDF。'
    },
    'promissory-bill': {
      title: '免費本票產生器｜線上製作本票與 PDF 下載｜SLawFree',
      description: '免費線上製作本票，填寫本票金額、受款人、發票人、發票日、到期日及付款地，即時預覽並下載 A4 PDF。'
    }
  },

  validDocTypes: [
    'payment-order',
    'promissory-note',
    'divorce',
    'iou',
    'promissory-bill'
  ],

  currentDoc: 'payment-order',

  isValidDocType(docType) {
    return this.validDocTypes.includes(docType);
  },

  normalizeDocType(docType) {
    return this.isValidDocType(docType) ? docType : 'payment-order';
  },

  getDocFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return this.normalizeDocType(params.get('doc'));
  },

  getInitialDocType() {
    return this.getDocFromUrl();
  },

  buildDocUrl(docType) {
    const url = new URL(window.location.href);
    url.searchParams.set('doc', docType);
    return `${url.pathname}?${url.searchParams.toString()}`;
  },

  syncUrl(docType, mode) {
    const nextUrl = this.buildDocUrl(docType);
    const currentUrl = `${window.location.pathname}${window.location.search}`;

    if (nextUrl === currentUrl) return;

    const state = { doc: docType };

    if (mode === 'push') {
      history.pushState(state, '', nextUrl);
    } else if (mode === 'replace') {
      history.replaceState(state, '', nextUrl);
    }
  },

  init() {
    this.bindSidebar();
    this.bindPopState();
  },

  bindSidebar() {
    const nav = document.getElementById('sidebarNav');
    if (!nav) return;

    nav.addEventListener('click', (e) => {
      const item = e.target.closest('.sidebar__item');
      if (!item) return;

      const docType = item.dataset.doc;
      this.switchDoc(docType, { updateHistory: 'push' });
    });
  },

  bindPopState() {
    window.addEventListener('popstate', () => {
      this.switchDoc(this.getDocFromUrl(), { updateHistory: false });
    });
  },

  async switchDoc(docType, options = {}) {
    const updateHistory = options.updateHistory ?? 'push';
    const normalizedDoc = this.normalizeDocType(docType);

    this.currentDoc = normalizedDoc;

    document.querySelectorAll('.sidebar__item').forEach((el) => {
      el.classList.toggle('active', el.dataset.doc === normalizedDoc);
    });

    this.updatePageMeta(normalizedDoc);
    this.updateGuideLink(normalizedDoc);

    try {
      if (
        normalizedDoc === 'payment-order' ||
        normalizedDoc === 'promissory-note' ||
        normalizedDoc === 'divorce' ||
        normalizedDoc === 'iou' ||
        normalizedDoc === 'promissory-bill'
      ) {
        await Forms.init(normalizedDoc);
        Preview.update(this.currentDoc, Forms.formData || {});
      } else {
        Forms.currentDoc = normalizedDoc;
        Forms.formConfig = null;
        Forms.currentStep = 1;

        const formArea = document.getElementById('formArea');
        if (formArea) formArea.innerHTML = Forms.renderPlaceholder();

        Preview.update(normalizedDoc, {});
      }
    } catch (err) {
      console.error('文件切換失敗：', err);
    }

    if (updateHistory === 'push') {
      this.syncUrl(normalizedDoc, 'push');
    } else if (updateHistory === 'replace') {
      this.syncUrl(normalizedDoc, 'replace');
    }

    this.closeSidebar();
  },

  updateGuideLink(docType) {
    const guideLink = document.getElementById('toolGuideLink');
    if (!guideLink) return;

    const guide = this.docGuides[docType];
    if (!guide) {
      guideLink.hidden = true;
      guideLink.innerHTML = '';
      return;
    }

    guideLink.hidden = false;
    guideLink.innerHTML = `
      <p class="tool-guide-link-text">
        ${guide.text}
        <a class="tool-guide-link-anchor" href="${guide.url}">${guide.linkText}</a>
      </p>
    `;
  },

  updatePageMeta(docType) {
    const meta = this.docPageMeta[docType] || this.defaultPageMeta;

    document.title = meta.title;

    const descriptionEl = document.querySelector('meta[name="description"]');
    if (descriptionEl) {
      descriptionEl.setAttribute('content', meta.description);
    }

    const ogTitleEl = document.querySelector('meta[property="og:title"]');
    if (ogTitleEl) {
      ogTitleEl.setAttribute('content', meta.title);
    }

    const ogDescriptionEl = document.querySelector('meta[property="og:description"]');
    if (ogDescriptionEl) {
      ogDescriptionEl.setAttribute('content', meta.description);
    }

    const twitterTitleEl = document.querySelector('meta[name="twitter:title"]');
    if (twitterTitleEl) {
      twitterTitleEl.setAttribute('content', meta.title);
    }

    const twitterDescriptionEl = document.querySelector('meta[name="twitter:description"]');
    if (twitterDescriptionEl) {
      twitterDescriptionEl.setAttribute('content', meta.description);
    }
  },

  closeSidebar() {
    document.getElementById('sidebar')?.classList.remove('open');
    document.getElementById('sidebarOverlay')?.classList.remove('visible');
  }
};

window.Router = Router;
