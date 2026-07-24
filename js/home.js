/**
 * 首頁 Landing Page
 */
const Home = {
  pageMeta: {
    title: '免費法律文件快速產生器｜SLawFree',
    description: 'SLawFree 提供免費法律文件快速生成工具，支援支付命令、本票、本票裁定、借據及離婚協議書，即時預覽、免費下載 PDF。'
  },

  init() {
    this.bindEvents();
    this.initFaq();
    this.initReveal();
    this.showHome(false);
  },

  bindEvents() {
    document.getElementById('homeStartBtn')?.addEventListener('click', () => {
      this.openApp('payment-order');
    });

    document.querySelectorAll('[data-home-doc]').forEach((el) => {
      el.addEventListener('click', () => {
        const docType = el.dataset.homeDoc;
        if (docType) this.openApp(docType);
      });
    });

    const footerHomeLink = document.querySelector('.site-footer__nav a[href="index.html"]');
    footerHomeLink?.addEventListener('click', (event) => {
      const appView = document.getElementById('appView');
      if (appView && !appView.classList.contains('app-view--hidden')) {
        event.preventDefault();
        this.showHome(true);
      }
    });
  },

  initFaq() {
    document.querySelectorAll('.home-faq__question').forEach((button) => {
      button.addEventListener('click', () => {
        const item = button.closest('.home-faq__item');
        if (!item) return;

        const isOpen = item.classList.contains('is-open');
        document.querySelectorAll('.home-faq__item.is-open').forEach((openItem) => {
          openItem.classList.remove('is-open');
          openItem.querySelector('.home-faq__question')?.setAttribute('aria-expanded', 'false');
        });

        if (!isOpen) {
          item.classList.add('is-open');
          button.setAttribute('aria-expanded', 'true');
        }
      });
    });
  },

  initReveal() {
    const targets = document.querySelectorAll('.home-reveal');
    if (!targets.length) return;

    if (!('IntersectionObserver' in window)) {
      targets.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    targets.forEach((el) => observer.observe(el));
  },

  showHome(scrollTop = true) {
    document.getElementById('homeView')?.classList.remove('home-view--hidden');
    document.getElementById('appView')?.classList.add('app-view--hidden');
    this.updateHomeMeta();
    if (scrollTop) window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  async openApp(docType = 'payment-order') {
    document.getElementById('homeView')?.classList.add('home-view--hidden');
    document.getElementById('appView')?.classList.remove('app-view--hidden');

    if (typeof window.initApp === 'function') {
      await window.initApp();
    }

    if (typeof Router !== 'undefined' && typeof Router.switchDoc === 'function') {
      await Router.switchDoc(docType);
    }

    window.scrollTo({ top: 0, behavior: 'auto' });
  },

  updateHomeMeta() {
    document.title = this.pageMeta.title;

    const descriptionEl = document.querySelector('meta[name="description"]');
    if (descriptionEl) {
      descriptionEl.setAttribute('content', this.pageMeta.description);
    }

    const ogTitleEl = document.querySelector('meta[property="og:title"]');
    if (ogTitleEl) {
      ogTitleEl.setAttribute('content', this.pageMeta.title);
    }

    const ogDescriptionEl = document.querySelector('meta[property="og:description"]');
    if (ogDescriptionEl) {
      ogDescriptionEl.setAttribute('content', this.pageMeta.description);
    }

    const twitterTitleEl = document.querySelector('meta[name="twitter:title"]');
    if (twitterTitleEl) {
      twitterTitleEl.setAttribute('content', this.pageMeta.title);
    }

    const twitterDescriptionEl = document.querySelector('meta[name="twitter:description"]');
    if (twitterDescriptionEl) {
      twitterDescriptionEl.setAttribute('content', this.pageMeta.description);
    }
  }
};

window.Home = Home;
