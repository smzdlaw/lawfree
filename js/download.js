/**
 * PDF 下載（slawfree v1.2 品質最佳化 + v1.1 行動裝置相容）
 */
const Download = {
  pdfFilenames: {
    'payment-order': '支付命令.pdf',
    'promissory-note': '本票裁定.pdf',
    divorce: '離婚協議書.pdf'
  },

  /** A4 210mm − 15mm × 2 邊界 = 180mm 內容寬 */
  CONTENT_WIDTH_MM: 180,

  init() {
    const btn = document.getElementById('downloadPdfBtn');
    if (!btn) return;
    if (btn.dataset.bound === '1') return;
    btn.dataset.bound = '1';
    btn.addEventListener('click', () => {
      this.downloadPdf();
    });
  },

  getFilename(docType) {
    return this.pdfFilenames[docType] || '法律文件.pdf';
  },

  getPreviewElement() {
    const paper = document.getElementById('previewPaper');
    if (!paper) return null;
    return paper.querySelector('.preview-paper__inner');
  },

  isIOSDevice() {
    const ua = navigator.userAgent || '';
    return (
      /iPad|iPhone|iPod/.test(ua) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
    );
  },

  isAndroidDevice() {
    return /Android/i.test(navigator.userAgent || '');
  },

  isMobileDevice() {
    return this.isIOSDevice() || this.isAndroidDevice();
  },

  supportsBlobUrl() {
    return typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function';
  },

  supportsAnchorDownloadAttribute() {
    if (this.isIOSDevice()) return false;
    const anchor = document.createElement('a');
    return typeof anchor.download !== 'undefined';
  },

  shouldUseDirectDownload() {
    if (!this.isMobileDevice()) return true;
    if (this.isIOSDevice()) return false;
    return this.supportsAnchorDownloadAttribute() && this.supportsBlobUrl();
  },

  getCanvasScale() {
    return this.isMobileDevice() ? 2 : 3;
  },

  injectPdfExportStyles() {
    if (document.getElementById('pdf-export-style-v24')) return;

    const style = document.createElement('style');
    style.id = 'pdf-export-style-v24';
    style.textContent = `
      body.pdf-export .preview-paper,
      body.pdf-export .preview-paper__inner,
      body.pdf-export .doc-preview,
      body.pdf-export .doc-preview__block,
      body.pdf-export .doc-preview__footer {
        height: auto !important;
        min-height: 0 !important;
        max-height: none !important;
        overflow: visible !important;
      }
      body.pdf-export .preview-paper {
        width: ${this.CONTENT_WIDTH_MM}mm !important;
        max-width: ${this.CONTENT_WIDTH_MM}mm !important;
        box-sizing: border-box !important;
        margin: 0 auto !important;
        box-shadow: none !important;
        border-radius: 0 !important;
        transform: none !important;
      }
      body.pdf-export .preview-paper__inner {
        width: ${this.CONTENT_WIDTH_MM}mm !important;
        max-width: ${this.CONTENT_WIDTH_MM}mm !important;
        box-sizing: border-box !important;
        margin: 0 auto !important;
        padding: 0 !important;
        font-family: "DFKai-SB", "標楷體", KaiTi, serif !important;
        font-size: 20px !important;
        line-height: 1.8 !important;
        color: #000 !important;
        background: #fff !important;
      }
      body.pdf-export .doc-preview {
        width: 100% !important;
        box-sizing: border-box !important;
        font-family: "DFKai-SB", "標楷體", KaiTi, serif !important;
        word-break: normal !important;
        overflow-wrap: normal !important;
      }
      body.pdf-export .doc-preview__line,
      body.pdf-export .doc-preview__paragraph,
      body.pdf-export .doc-preview__block,
      body.pdf-export .doc-preview__footer {
        page-break-inside: auto !important;
        break-inside: auto !important;
        word-break: normal !important;
        overflow-wrap: normal !important;
      }
      body.pdf-export .doc-preview__title,
      body.pdf-export .doc-preview__heading,
      body.pdf-export .doc-preview__child-item,
      body.pdf-export .doc-preview__signature-party,
      body.pdf-export .doc-preview__witness-row,
      body.pdf-export .doc-preview__signature-date,
      body.pdf-export .agreement-date,
      body.pdf-export .doc-preview__date-line,
      body.pdf-export .doc-preview__date-row,
      body.pdf-export .doc-preview__signer-row,
      body.pdf-export .doc-preview__claim-item,
      body.pdf-export .doc-preview__court,
      body.pdf-export .doc-preview__attachments {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
      body.pdf-export .doc-preview__signature-date-line,
      body.pdf-export .doc-preview__signature-date-row,
      body.pdf-export .doc-preview__signature-name-row,
      body.pdf-export .doc-preview__witness-row,
      body.pdf-export .doc-preview__field-row,
      body.pdf-export .doc-preview * {
        transform: none !important;
      }
      body.pdf-export .doc-preview__signature-date {
        width: 100% !important;
        max-width: 100% !important;
        margin: 2em 0 0 !important;
        margin-left: -50px !important;
        box-sizing: border-box !important;
      }
      body.pdf-export .doc-preview__date-line {
        margin-left: -50px !important;
      }
      body.pdf-export .agreement-date,
      body.pdf-export .doc-preview__date-row.agreement-date {
        display: grid !important;
        grid-template-columns: 220px 100px 20px 100px 20px 104px 20px 1fr !important;
        align-items: center !important;
        width: 100% !important;
      }
      body.pdf-export .date-prefix {
        display: inline-grid !important;
        grid-auto-flow: column !important;
        gap: 18px !important;
        width: 220px !important;
        justify-content: end !important;
      }
      body.pdf-export .date-prefix span {
        display: flex !important;
        justify-content: center !important;
        align-items: center !important;
        width: 20px !important;
        margin: 0 !important;
        padding: 0 !important;
        transform: none !important;
        position: static !important;
        white-space: nowrap !important;
      }
      body.pdf-export .date-unit {
        justify-self: start !important;
        white-space: nowrap !important;
      }
      body.pdf-export .date-num {
        text-align: center !important;
        justify-self: center !important;
        width: 100% !important;
        white-space: nowrap !important;
      }
      body.pdf-export .doc-preview__reason {
        white-space: pre-wrap !important;
        overflow-wrap: anywhere !important;
        word-break: break-word !important;
      }
    `;
    document.head.appendChild(style);
  },

  applyExportCloneStyles(clonedDoc) {
    const paper = clonedDoc.getElementById('previewPaper');
    const inner = paper?.querySelector('.preview-paper__inner');
    const docPreview = clonedDoc.querySelector('.doc-preview');

    const resetLayout = (el) => {
      if (!el) return;
      el.style.boxSizing = 'border-box';
      el.style.background = '#ffffff';
      el.style.color = '#000000';
      el.style.overflow = 'visible';
      el.style.height = 'auto';
      el.style.minHeight = '0';
      el.style.maxHeight = 'none';
    };

    resetLayout(paper);
    resetLayout(inner);
    resetLayout(docPreview);

    clonedDoc.querySelectorAll('.doc-preview__block, .doc-preview__footer').forEach(resetLayout);

    if (paper) {
      paper.style.width = `${this.CONTENT_WIDTH_MM}mm`;
      paper.style.maxWidth = `${this.CONTENT_WIDTH_MM}mm`;
      paper.style.margin = '0 auto';
      paper.style.transform = 'none';
      paper.style.boxShadow = 'none';
      paper.style.borderRadius = '0';
    }

    if (inner) {
      inner.style.width = `${this.CONTENT_WIDTH_MM}mm`;
      inner.style.maxWidth = `${this.CONTENT_WIDTH_MM}mm`;
      inner.style.margin = '0 auto';
      inner.style.padding = '0';
      inner.style.fontFamily = '"DFKai-SB", "標楷體", KaiTi, serif';
      inner.style.fontSize = '20px';
      inner.style.lineHeight = '1.8';
    }

    clonedDoc.querySelectorAll('.doc-preview__signer-tip').forEach((el) => {
      el.style.display = 'none';
    });

    clonedDoc.querySelectorAll('.doc-preview__signature-date-line').forEach((el) => {
      el.style.transform = 'none';
    });
  },

  getPdfOptions(filename, element) {
    const scale = this.getCanvasScale();

    return {
      margin: [15, 15, 15, 15],
      filename,
      image: {
        type: 'jpeg',
        quality: 0.98
      },
      html2canvas: {
        scale,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#FFFFFF',
        logging: false,
        scrollX: 0,
        scrollY: 0,
        letterRendering: true,
        windowWidth: element ? element.scrollWidth : undefined,
        onclone: (clonedDoc) => this.applyExportCloneStyles(clonedDoc)
      },
      jsPDF: {
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait',
        compress: true
      },
      pagebreak: {
        mode: ['css', 'legacy'],
        avoid: [
          '.doc-preview__title',
          '.doc-preview__heading',
          '.doc-preview__child-item',
          '.doc-preview__signature-party',
          '.doc-preview__witness-row',
          '.doc-preview__signature-date',
          '.agreement-date',
          '.doc-preview__date-line',
          '.doc-preview__date-row',
          '.doc-preview__signer-row',
          '.doc-preview__court',
          '.doc-preview__claim-item',
          '.doc-preview__attachments'
        ]
      }
    };
  },

  waitForLayout() {
    return new Promise((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(resolve));
    });
  },

  async waitForResources() {
    await this.waitForLayout();
    if (document.fonts && document.fonts.ready) {
      try {
        await document.fonts.ready;
      } catch (_) {
        // ignore
      }
    }
  },


  getJsPdfConstructor() {
    if (window.jspdf?.jsPDF) return window.jspdf.jsPDF;
    if (window.jsPDF) return window.jsPDF;
    throw new Error('jsPDF 尚未載入');
  },

  createStableExportClone(sourceElement) {
    const wrapper = document.createElement('div');
    wrapper.id = 'pdf-stable-export-root';
    Object.assign(wrapper.style, {
      position: 'fixed',
      left: '-100000px',
      top: '0',
      width: `${this.CONTENT_WIDTH_MM}mm`,
      maxWidth: `${this.CONTENT_WIDTH_MM}mm`,
      margin: '0',
      padding: '0',
      background: '#fff',
      overflow: 'visible',
      pointerEvents: 'none',
      zIndex: '-1'
    });

    const clone = sourceElement.cloneNode(true);
    Object.assign(clone.style, {
      display: 'block',
      width: `${this.CONTENT_WIDTH_MM}mm`,
      maxWidth: `${this.CONTENT_WIDTH_MM}mm`,
      height: 'auto',
      minHeight: '0',
      maxHeight: 'none',
      margin: '0',
      padding: '0',
      overflow: 'visible',
      boxSizing: 'border-box',
      background: '#fff',
      color: '#000',
      fontFamily: '"DFKai-SB", "標楷體", KaiTi, serif',
      fontSize: '20px',
      lineHeight: '1.8',
      transform: 'none',
      boxShadow: 'none',
      borderRadius: '0'
    });

    clone.querySelectorAll('*').forEach((el) => {
      el.style.maxHeight = 'none';
      el.style.overflow = 'visible';
      el.style.transform = 'none';
      el.style.animation = 'none';
      el.style.transition = 'none';
    });

    clone.querySelectorAll('.doc-preview__signer-tip').forEach((el) => el.remove());

    wrapper.appendChild(clone);
    document.body.appendChild(wrapper);
    return { wrapper, clone };
  },

  async renderStableCanvas(element) {
    if (typeof html2canvas === 'undefined') {
      throw new Error('html2canvas 尚未載入');
    }

    return html2canvas(element, {
      scale: this.isMobileDevice() ? 2 : 2.5,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#FFFFFF',
      logging: false,
      scrollX: 0,
      scrollY: 0,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
      letterRendering: true
    });
  },

  findSafePageCut(canvas, startY, idealEndY) {
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return idealEndY;

    const searchRange = Math.min(220, Math.floor(canvas.width * 0.18));
    const searchStart = Math.max(startY + 400, idealEndY - searchRange);

    for (let y = idealEndY; y >= searchStart; y -= 3) {
      const row = ctx.getImageData(0, y, canvas.width, 1).data;
      let darkSamples = 0;
      let totalSamples = 0;

      for (let i = 0; i < row.length; i += 16) {
        totalSamples += 1;
        const r = row[i];
        const g = row[i + 1];
        const b = row[i + 2];
        const a = row[i + 3];

        if (a > 10 && (r < 247 || g < 247 || b < 247)) {
          darkSamples += 1;
        }
      }

      if (darkSamples / totalSamples < 0.008) {
        return y;
      }
    }

    return idealEndY;
  },

  canvasToStablePdf(canvas) {
    const JsPDF = this.getJsPdfConstructor();
    const pdf = new JsPDF({
      unit: 'mm',
      format: 'a4',
      orientation: 'portrait',
      compress: true
    });

    const usableHeightMm = 297 - 15 - 15;
    const pageHeightPx = Math.floor(
      canvas.width * (usableHeightMm / this.CONTENT_WIDTH_MM)
    );

    let startY = 0;
    let pageIndex = 0;

    while (startY < canvas.height) {
      const idealEndY = Math.min(startY + pageHeightPx, canvas.height);
      const endY =
        idealEndY < canvas.height
          ? this.findSafePageCut(canvas, startY, idealEndY)
          : idealEndY;

      const sliceHeight = Math.max(1, endY - startY);
      const pageCanvas = document.createElement('canvas');
      pageCanvas.width = canvas.width;
      pageCanvas.height = sliceHeight;

      const pageCtx = pageCanvas.getContext('2d');
      pageCtx.fillStyle = '#FFFFFF';
      pageCtx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
      pageCtx.drawImage(
        canvas,
        0, startY, canvas.width, sliceHeight,
        0, 0, canvas.width, sliceHeight
      );

      if (pageIndex > 0) pdf.addPage('a4', 'portrait');

      const renderedHeightMm =
        this.CONTENT_WIDTH_MM * (sliceHeight / canvas.width);

      pdf.addImage(
        pageCanvas.toDataURL('image/jpeg', 0.96),
        'JPEG',
        15,
        15,
        this.CONTENT_WIDTH_MM,
        renderedHeightMm,
        undefined,
        'FAST'
      );

      startY = endY;
      pageIndex += 1;
    }

    return pdf;
  },

  async generateStablePdf(element) {
    await this.waitForResources();
    const { wrapper, clone } = this.createStableExportClone(element);

    try {
      await this.waitForLayout();
      const canvas = await this.renderStableCanvas(clone);
      const pdf = this.canvasToStablePdf(canvas);
      return { pdf, blob: pdf.output('blob') };
    } finally {
      wrapper.remove();
    }
  },

  revokeBlobUrl(url) {
    if (!url || typeof url !== 'string' || !url.startsWith('blob:')) return;
    try {
      URL.revokeObjectURL(url);
    } catch (_) {
      // ignore
    }
  },

  scheduleRevokeBlobUrl(url, delayMs) {
    setTimeout(() => this.revokeBlobUrl(url), delayMs);
  },

  async generatePdfBlob(element, opt) {
    const result = await html2pdf().set(opt).from(element).output('blob');
    if (!(result instanceof Blob)) {
      throw new Error('Invalid PDF blob');
    }
    return result;
  },

  downloadBlobWithAnchor(blob, filename) {
    const url = URL.createObjectURL(blob);
    try {
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = filename;
      anchor.rel = 'noopener';
      anchor.style.display = 'none';
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
    } finally {
      this.scheduleRevokeBlobUrl(url, 2000);
    }
  },

  openPdfBlob(blob) {
    const url = URL.createObjectURL(blob);
    let opened = null;

    try {
      opened = window.open(url, '_blank');
    } catch (_) {
      opened = null;
    }

    if (!opened) {
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.target = '_blank';
      anchor.rel = 'noopener noreferrer';
      anchor.style.display = 'none';
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
    }

    this.scheduleRevokeBlobUrl(url, 120000);
  },

  async savePdfDesktop(element, opt) {
    await html2pdf().from(element).set(opt).save();
  },

  async savePdfMobile(element, opt, filename) {
    const blob = await this.generatePdfBlob(element, opt);

    if (this.shouldUseDirectDownload()) {
      this.downloadBlobWithAnchor(blob, filename);
      return;
    }

    this.openPdfBlob(blob);
  },

  async downloadPdf() {
    if (typeof html2canvas === 'undefined') {
      alert('html2canvas 尚未載入');
      return;
    }

    const element = this.getPreviewElement();
    if (!element) {
      alert('找不到預覽內容');
      return;
    }

    const docType =
      typeof Router !== 'undefined' && Router.currentDoc
        ? Router.currentDoc
        : 'payment-order';

    const filename = this.getFilename(docType);
    const button = document.getElementById('downloadPdfBtn');

    if (button) button.disabled = true;

    try {
      const { pdf, blob } = await this.generateStablePdf(element);

      if (!this.isMobileDevice()) {
        pdf.save(filename);
      } else if (this.shouldUseDirectDownload()) {
        this.downloadBlobWithAnchor(blob, filename);
      } else {
        this.openPdfBlob(blob);
      }
    } catch (error) {
      console.error('PDF 下載失敗：', error);
      alert('PDF 下載失敗，請重新整理後再試一次。');
    } finally {
      if (button) button.disabled = false;
    }
  }
};

window.Download = Download;

document.addEventListener('DOMContentLoaded', () => {
  Download.init();
});
