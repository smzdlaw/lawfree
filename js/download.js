/**
 * PDF 下載（html2pdf.bundle.min.js）
 * 只輸出 #previewPaper 內的 .preview-paper__inner
 */
const Download = {
  pdfFilenames: {
    'payment-order': '支付命令.pdf',
    'promissory-note': '本票裁定.pdf',
    divorce: '離婚協議書.pdf'
  },

  init() {
    const pdfBtn = document.getElementById('downloadPdfBtn');
    if (!pdfBtn) return;

    // 避免 DOMContentLoaded 與 app.js 重複綁定
    if (pdfBtn.dataset.pdfBound === '1') return;
    pdfBtn.dataset.pdfBound = '1';

    pdfBtn.addEventListener('click', () => {
      this.downloadPdf();
    });
  },

  getFilename(docType) {
    return this.pdfFilenames[docType] || '法律文件.pdf';
  },

  /**
   * 建立暫時 clone：來源為 #previewPaper .preview-paper__inner
   * 放在畫面左上角、z-index:-1，讓 html2canvas 能正確截到內容（避免空白／左側裁切）
   */
  createClone() {
    const paper = document.getElementById('previewPaper');
    if (!paper) return null;

    const inner = paper.querySelector('.preview-paper__inner');
    if (!inner) return null;

    const clone = inner.cloneNode(true);
    clone.id = 'pdf-export-clone';

    clone.style.position = 'absolute';
    clone.style.left = '0';
    clone.style.top = '0';
    clone.style.width = '794px';
    clone.style.maxWidth = '794px';
    clone.style.height = 'auto';
    clone.style.minHeight = '0';
    clone.style.margin = '0';
    clone.style.padding = '25mm';
    clone.style.boxSizing = 'border-box';
    clone.style.background = '#ffffff';
    clone.style.color = '#000000';
    clone.style.overflow = 'visible';
    clone.style.boxShadow = 'none';
    clone.style.border = 'none';
    clone.style.borderRadius = '0';
    clone.style.zIndex = '-1';
    clone.style.fontFamily = '"DFKai-SB", "標楷體", KaiTi, serif';
    clone.style.fontSize = '20px';
    clone.style.lineHeight = '1.8';
    clone.style.textAlign = 'justify';
    clone.style.pointerEvents = 'none';

    // 確保內部文件區塊完整展開，不被裁切
    const doc = clone.querySelector('.doc-preview');
    if (doc) {
      doc.style.width = '100%';
      doc.style.maxWidth = '100%';
      doc.style.height = 'auto';
      doc.style.overflow = 'visible';
    }

    document.body.appendChild(clone);
    return clone;
  },

  removeClone(clone) {
    if (clone && clone.parentNode) {
      clone.parentNode.removeChild(clone);
    }
  },

  async downloadPdf() {
    if (typeof html2pdf === 'undefined') {
      alert('PDF 套件尚未載入，請重新整理頁面後再試。');
      return;
    }

    const btn = document.getElementById('downloadPdfBtn');
    const docType = (typeof Router !== 'undefined' && Router.currentDoc)
      ? Router.currentDoc
      : 'payment-order';
    const filename = this.getFilename(docType);
    let clone = null;

    try {
      if (btn) {
        btn.disabled = true;
        btn.classList.add('btn--disabled');
      }

      clone = this.createClone();
      if (!clone) {
        alert('找不到可匯出的預覽內容。');
        return;
      }

      // 等待瀏覽器完成 clone 排版後再截圖
      await new Promise((resolve) => {
        requestAnimationFrame(() => {
          requestAnimationFrame(resolve);
        });
      });

      const opt = {
        margin: 10,
        filename: filename,
        image: {
          type: 'jpeg',
          quality: 0.98
        },
        html2canvas: {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
          logging: false
        },
        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: 'portrait'
        },
        pagebreak: {
          mode: ['css', 'legacy']
        }
      };

      await html2pdf().set(opt).from(clone).save();
    } catch (err) {
      console.error('PDF 下載失敗:', err);
      alert('PDF 下載失敗，請稍後再試。');
    } finally {
      this.removeClone(clone);
      if (btn) {
        btn.disabled = false;
        btn.classList.remove('btn--disabled');
      }
    }
  }
};

window.Download = Download;

document.addEventListener('DOMContentLoaded', () => {
  Download.init();
});
