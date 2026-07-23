/**
 * 文件預覽
 */
const Preview = {
  MOBILE_BREAKPOINT: 768,
  HORIZONTAL_PADDING: 24,

  resizeMobilePreview() {
    const wrapper = document.querySelector('.preview-wrapper');
    const stage = document.querySelector('.preview-stage');
    const paper = document.getElementById('previewPaper');
    const previewArea = document.getElementById('previewArea');

    if (!wrapper || !stage || !paper) return;

    if (window.innerWidth > this.MOBILE_BREAKPOINT) {
      paper.style.transform = '';
      paper.style.transformOrigin = '';
      stage.style.width = '';
      stage.style.height = '';
      stage.style.overflow = '';
      return;
    }

    if (previewArea?.classList.contains('content-panel--hidden')) return;

    paper.style.transform = '';
    paper.style.transformOrigin = '';
    stage.style.width = '';
    stage.style.height = '';
    stage.style.overflow = '';

    const availableWidth = wrapper.clientWidth - this.HORIZONTAL_PADDING;
    if (availableWidth <= 0) return;

    const paperWidth = paper.offsetWidth;
    const paperHeight = paper.offsetHeight;
    if (!paperWidth || !paperHeight) return;

    const scale = Math.min(availableWidth / paperWidth, 1);
    const scaledWidth = paperWidth * scale;
    const scaledHeight = paperHeight * scale;

    paper.style.transform = `scale(${scale})`;
    paper.style.transformOrigin = 'top left';
    stage.style.width = `${scaledWidth}px`;
    stage.style.height = `${scaledHeight}px`;
    stage.style.overflow = 'hidden';
  },

  scheduleResize() {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => this.resizeMobilePreview());
    });
  },

  init() {
    this.resizeMobilePreview();
    window.addEventListener('resize', () => this.scheduleResize());
  },

  update(docType, formData = {}) {
    const paper = document.getElementById('previewPaper');

    if (!paper) return;

    const normalizedDocType = String(docType || '').trim();
    const template = typeof resolveDocumentTemplate === 'function'
      ? resolveDocumentTemplate(normalizedDocType)
      : null;

    if (!template || typeof template.render !== 'function') {
      console.error('[Preview] 找不到對應模板：', normalizedDocType);
      paper.innerHTML = `
        <div class="preview-paper__inner">
          <p class="preview-paper__placeholder">
            文件預覽將在此顯示
          </p>
        </div>
      `;
      this.scheduleResize();
      return;
    }

    paper.innerHTML = `
      <div class="preview-paper__inner">
        ${template.render(formData)}
      </div>
    `;

    this.scheduleResize();
  }
};

window.Preview = Preview;
