/**
 * 文件預覽
 */
const Preview = {
  update(docType, formData) {
    const paper = document.getElementById('previewPaper');

    if (!paper) return;

    if (docType === 'payment-order') {
      paper.innerHTML = `
        <div class="preview-paper__inner">
          ${PaymentOrderTemplate.render(formData)}
        </div>
      `;
    } else if (docType === 'promissory-note') {
      paper.innerHTML = `
        <div class="preview-paper__inner">
          ${PromissoryNoteTemplate.render(formData)}
        </div>
      `;
    } else {
      paper.innerHTML = `
        <div class="preview-paper__inner">
          <p class="preview-paper__placeholder">
            文件預覽將在此顯示
          </p>
        </div>
      `;
    }
  }
};

window.Preview = Preview;