/**
 * 文件預覽
 */
const Preview = {
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
      return;
    }

    paper.innerHTML = `
      <div class="preview-paper__inner">
        ${template.render(formData)}
      </div>
    `;
  }
};

window.Preview = Preview;
