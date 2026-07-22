/**
 * 文件預覽
 */
const Preview = {
  update(docType, formData = {}) {
    const paper = document.getElementById('previewPaper');

    if (!paper) return;

    let documentHtml = '';

    if (docType === 'payment-order') {
      documentHtml = PaymentOrderTemplate.render(formData);

    } else if (docType === 'promissory-note') {
      documentHtml = PromissoryNoteTemplate.render(formData);

    } else if (docType === 'divorce') {
      documentHtml = DivorceTemplate.render(formData);

    } else {
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
        ${documentHtml}
      </div>
    `;
  }
};

window.Preview = Preview;