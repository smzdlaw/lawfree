/**
 * 首頁 Landing Page
 */
const Home = {
  init() {
    this.initFaq();
    this.initReveal();
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
  }
};

document.addEventListener('DOMContentLoaded', () => {
  Home.init();
});
