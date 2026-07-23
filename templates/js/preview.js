/**
 * 文件預覽
 */
const Preview = {
  MOBILE_BREAKPOINT: 768,

  getAvailableWrapperWidth(wrapper) {
    const styles = getComputedStyle(wrapper);
    const paddingX =
      (parseFloat(styles.paddingLeft) || 0) +
      (parseFloat(styles.paddingRight) || 0);
    return Math.max(0, wrapper.clientWidth - paddingX);
  },

  clearMobileScale(paper, stage) {
    if (paper) {
      paper.style.transform = '';
      paper.style.transformOrigin = '';
    }
    if (stage) {
      stage.style.width = '';
      stage.style.height = '';
      stage.style.overflow = '';
      stage.style.position = '';
    }
  },

  resizeMobilePreview() {
    const wrapper = document.querySelector('.preview-wrapper');
    const stage = document.querySelector('.preview-stage');
    const paper = document.getElementById('previewPaper');
    const previewArea = document.getElementById('previewArea');

    if (!wrapper || !stage || !paper) return;

    if (window.innerWidth > this.MOBILE_BREAKPOINT) {
      this.clearMobileScale(paper, stage);
      return;
    }

    if (previewArea?.classList.contains('content-panel--hidden')) return;

    this.clearMobileScale(paper, stage);

    const availableWidth = this.getAvailableWrapperWidth(wrapper);
    if (availableWidth <= 0) return;

    // 先清除縮放，再讀取 A4 原始尺寸，避免 Safari 取得縮放後寬度。
    const paperWidth = paper.offsetWidth || Math.round(210 * 96 / 25.4);
    const paperHeight = paper.offsetHeight || Math.round(297 * 96 / 25.4);
    if (!paperWidth || !paperHeight) return;

    const scale = Math.min(availableWidth / paperWidth, 1);
    const scaledWidth = Math.floor(paperWidth * scale);
    const scaledHeight = Math.ceil(paperHeight * scale);

    // stage 只負責保留縮放後空間；paper 固定從左上角縮放。
    // 這可避免 flex 置中依「未縮放寬度」計算，導致手機預覽被裁掉。
    stage.style.position = 'relative';
    stage.style.width = `${scaledWidth}px`;
    stage.style.height = `${scaledHeight}px`;
    stage.style.overflow = 'hidden';

    paper.style.transform = `scale(${scale})`;
    paper.style.transformOrigin = 'top left';
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

function updateMobilePreviewScale() {
  Preview.scheduleResize();
}

window.updateMobilePreviewScale = updateMobilePreviewScale;
