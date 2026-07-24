/**
 * PDF 下載（slawfree v1.3 行動裝置修正）
 */
const Download = {
  pdfFilenames: {
    'payment-order': '支付命令.pdf',
    'promissory-note': '本票裁定.pdf',
    divorce: '離婚協議書.pdf',
    iou: '借據.pdf',
    'promissory-bill': '本票.pdf'
  },

  /** A4 210mm − 15mm × 2 邊界 = 180mm 內容寬 */
  CONTENT_WIDTH_MM: 180,

  init() {
    if (document.documentElement.dataset.pdfDownloadDelegated === '1') return;
    document.documentElement.dataset.pdfDownloadDelegated = '1';

    document.addEventListener('click', async (event) => {
      const button = event.target.closest(
        '#downloadPdfBtn, #downloadPdfBtnMobile, [data-action="download-pdf"]'
      );

      if (!button || button.disabled) return;

      event.preventDefault();
      event.stopPropagation();

      console.log('[PDF] click captured');

      try {
        await handlePdfDownload(button);
      } catch (error) {
        console.error('[PDF] failed');
        console.error(error);
        alert('PDF 產生失敗，請重新整理後再試一次。');
        Download.setDownloadButtonsLoading(Download.getDownloadButtons(), false);
      }
    }, true);
  },

  pdfModalState: null,

  hidePdfReadyModal(revokeNow = true) {
    const state = this.pdfModalState;
    if (!state) return;

    if (state.revokeTimer) {
      clearTimeout(state.revokeTimer);
    }

    if (revokeNow && state.blobUrl) {
      this.revokeBlobUrl(state.blobUrl);
    }

    state.overlay?.remove();
    this.pdfModalState = null;
  },

  showPdfReadyModal(blob, filename, options = {}) {
    const { showShare = false, shareFile = null } = options;

    this.hidePdfReadyModal(true);

    const blobUrl = URL.createObjectURL(blob);
    const overlay = document.createElement('div');
    overlay.id = 'pdf-ready-modal';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'PDF 已產生完成');
    Object.assign(overlay.style, {
      position: 'fixed',
      inset: '0',
      zIndex: '99999',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      background: 'rgba(15, 23, 42, 0.55)',
      boxSizing: 'border-box'
    });

    const panel = document.createElement('div');
    Object.assign(panel.style, {
      width: '100%',
      maxWidth: '420px',
      padding: '24px',
      borderRadius: '16px',
      background: '#ffffff',
      boxShadow: '0 20px 40px rgba(15, 23, 42, 0.18)',
      boxSizing: 'border-box',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    });

    const title = document.createElement('h2');
    title.textContent = 'PDF 已產生完成';
    Object.assign(title.style, {
      margin: '0 0 16px',
      fontSize: '20px',
      fontWeight: '700',
      color: '#0f172a',
      textAlign: 'center'
    });

    const actions = document.createElement('div');
    Object.assign(actions.style, {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    });

    const openLink = document.createElement('a');
    openLink.href = blobUrl;
    openLink.target = '_blank';
    openLink.rel = 'noopener';
    openLink.textContent = '開啟 PDF';
    Object.assign(openLink.style, {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '48px',
      padding: '12px 16px',
      borderRadius: '12px',
      background: '#2563eb',
      color: '#ffffff',
      fontSize: '16px',
      fontWeight: '600',
      textDecoration: 'none'
    });

    actions.appendChild(openLink);

    if (showShare && shareFile) {
      const shareButton = document.createElement('button');
      shareButton.type = 'button';
      shareButton.textContent = '分享或儲存 PDF';
      Object.assign(shareButton.style, {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '48px',
        padding: '12px 16px',
        borderRadius: '12px',
        border: '1px solid #cbd5e1',
        background: '#ffffff',
        color: '#0f172a',
        fontSize: '16px',
        fontWeight: '600',
        cursor: 'pointer'
      });

      shareButton.addEventListener('click', async () => {
        try {
          await navigator.share({
            files: [shareFile],
            title: filename
          });
        } catch (error) {
          if (error?.name !== 'AbortError') {
            console.error('[PDF] failed');
            console.error(error);
          }
        }
      });

      actions.appendChild(shareButton);
    }

    const closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.textContent = '關閉';
    Object.assign(closeButton.style, {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '44px',
      padding: '10px 16px',
      border: '0',
      borderRadius: '12px',
      background: 'transparent',
      color: '#64748b',
      fontSize: '15px',
      cursor: 'pointer'
    });

    closeButton.addEventListener('click', () => {
      this.hidePdfReadyModal(true);
    });

    overlay.addEventListener('click', (event) => {
      if (event.target === overlay) {
        this.hidePdfReadyModal(true);
      }
    });

    actions.appendChild(closeButton);
    panel.appendChild(title);
    panel.appendChild(actions);
    overlay.appendChild(panel);
    document.body.appendChild(overlay);

    const revokeTimer = setTimeout(() => {
      this.revokeBlobUrl(blobUrl);
    }, 10 * 60 * 1000);

    this.pdfModalState = {
      blobUrl,
      revokeTimer,
      shareFile,
      overlay
    };
  },

  async handlePdfDownload(button) {
    if (button?.disabled) return;
    await this.downloadPdf({ triggerButton: button });
  },

  getFilename(docType) {
    return this.pdfFilenames[docType] || '法律文件.pdf';
  },

  getPreviewPaper() {
    return document.getElementById('previewPaper');
  },

  getDownloadButtons() {
    return ['downloadPdfBtn', 'downloadPdfBtnMobile']
      .map((id) => document.getElementById(id))
      .filter(Boolean);
  },

  setDownloadButtonsLoading(buttons, isLoading) {
    buttons.forEach((btn) => {
      if (isLoading) {
        if (!btn.dataset.originalHtml) {
          btn.dataset.originalHtml = btn.innerHTML;
        }
        btn.disabled = true;
        btn.innerHTML = '產生中…';
        return;
      }

      btn.disabled = false;
      if (btn.dataset.originalHtml) {
        btn.innerHTML = btn.dataset.originalHtml;
        delete btn.dataset.originalHtml;
      }
    });
  },

  preparePaperForExport() {
    const paper = this.getPreviewPaper();
    const stage = document.querySelector('.preview-stage');
    if (!paper) return null;

    const state = {
      paper,
      stage,
      transform: paper.style.transform,
      transformOrigin: paper.style.transformOrigin,
      stageWidth: stage?.style.width || '',
      stageHeight: stage?.style.height || '',
      stageOverflow: stage?.style.overflow || '',
      stagePosition: stage?.style.position || ''
    };

    paper.style.transform = 'none';
    paper.style.transformOrigin = 'top left';

    if (stage) {
      stage.style.width = '';
      stage.style.height = '';
      stage.style.overflow = '';
      stage.style.position = '';
    }

    return state;
  },

  restorePaperAfterExport(state) {
    if (!state?.paper) return;

    state.paper.style.transform = state.transform;
    state.paper.style.transformOrigin = state.transformOrigin;

    if (state.stage) {
      state.stage.style.width = state.stageWidth;
      state.stage.style.height = state.stageHeight;
      state.stage.style.overflow = state.stageOverflow;
      state.stage.style.position = state.stagePosition;
    }

    if (typeof Preview !== 'undefined' && typeof Preview.scheduleResize === 'function') {
      Preview.scheduleResize();
    } else if (typeof updateMobilePreviewScale === 'function') {
      requestAnimationFrame(updateMobilePreviewScale);
    }
  },

  getPreviewElement() {
    const paper = document.getElementById('previewPaper');
    if (!paper) return null;

    const inner = paper.querySelector('.preview-paper__inner');
    if (!inner) return null;

    if (inner.querySelector('.preview-paper__placeholder')) {
      return null;
    }

    return inner;
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

  getCanvasScale() {
    return this.isMobileDevice() ? 1.25 : 2.5;
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
      left: '-10000px',
      top: '0',
      width: `${this.CONTENT_WIDTH_MM}mm`,
      maxWidth: `${this.CONTENT_WIDTH_MM}mm`,
      margin: '0',
      padding: '0',
      background: '#fff',
      overflow: 'visible',
      pointerEvents: 'none',
      zIndex: '0',
      opacity: '1'
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
      borderRadius: '0',
      visibility: 'visible'
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
      scale: this.getCanvasScale(),
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#FFFFFF',
      logging: false,
      scrollX: 0,
      scrollY: 0,
      windowWidth: element.scrollWidth || element.offsetWidth,
      windowHeight: element.scrollHeight || element.offsetHeight,
      width: element.scrollWidth || element.offsetWidth,
      height: element.scrollHeight || element.offsetHeight,
      letterRendering: true
    });
  },

  assertCanvasHasContent(canvas) {
    if (!canvas || canvas.width < 8 || canvas.height < 8) {
      throw new Error('PDF canvas is empty');
    }
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
        idealEndY < canvas.height && !this.isMobileDevice()
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

  async generateMobilePdfBlob(element, filename) {

    this.injectPdfExportStyles();
    document.body.classList.add('pdf-export');

    const { wrapper, clone } = this.createStableExportClone(element);

    try {
      await this.waitForLayout();
      const opt = {
        margin: [15, 15, 15, 15],
        filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 1.25,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#FFFFFF',
          logging: false,
          scrollX: 0,
          scrollY: 0,
          windowWidth: clone.scrollWidth || clone.offsetWidth,
          windowHeight: clone.scrollHeight || clone.offsetHeight,
          width: clone.scrollWidth || clone.offsetWidth,
          height: clone.scrollHeight || clone.offsetHeight
        },
        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: 'portrait',
          compress: true
        }
      };

      const blob = await html2pdf().set(opt).from(clone).output('blob');
      if (!(blob instanceof Blob) || blob.size === 0) {
        throw new Error('產生的 PDF 為空白檔案');
      }
      return blob;
    } finally {
      wrapper.remove();
      document.body.classList.remove('pdf-export');
    }
  },

  async generateStablePdf(element) {
    await this.waitForResources();
    const { wrapper, clone } = this.createStableExportClone(element);

    try {
      await this.waitForLayout();
      const canvas = await this.renderStableCanvas(clone);
      this.assertCanvasHasContent(canvas);
      const pdf = this.canvasToStablePdf(canvas);
      return { pdf, blob: pdf.output('blob') };
    } finally {
      wrapper.remove();
    }
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
      this.scheduleRevokeBlobUrl(url, 60000);
    }
  },

  canSharePdfFile(file) {
    try {
      return Boolean(navigator.share && navigator.canShare && navigator.canShare({ files: [file] }));
    } catch (_) {
      return false;
    }
  },

  openPdfBlobUrl(blobUrl) {
    try {
      const anchor = document.createElement('a');
      anchor.href = blobUrl;
      anchor.target = '_blank';
      anchor.rel = 'noopener';
      anchor.style.display = 'none';
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      return true;
    } catch (error) {
      console.warn('[Download] 無法開啟 PDF Blob URL：', error);
      return false;
    }
  },

  createSharePdfFile(blob, filename) {
    try {
      return new File([blob], filename, { type: 'application/pdf' });
    } catch (error) {
      console.warn('[Download] 無法建立 PDF File 物件：', error);
      return null;
    }
  },

  deliverIosPdf(blob, filename) {
    const shareFile = this.createSharePdfFile(blob, filename);
    const showShare = Boolean(shareFile && this.canSharePdfFile(shareFile));

    this.showPdfReadyModal(blob, filename, {
      showShare,
      shareFile: showShare ? shareFile : null
    });
  },

  deliverAndroidPdf(blob, filename) {
    try {
      this.downloadBlobWithAnchor(blob, filename);
    } catch (error) {
      console.warn('[Download] Android anchor download failed, showing open link modal:', error);
      this.showPdfReadyModal(blob, filename, { showShare: false });
    }
  },

  async deliverMobilePdf(blob, filename) {
    if (this.isIOSDevice()) {
      this.deliverIosPdf(blob, filename);
      return;
    }

    if (this.isAndroidDevice()) {
      this.deliverAndroidPdf(blob, filename);
      return;
    }

    this.downloadBlobWithAnchor(blob, filename);
  },

  async downloadPdf(options = {}) {
    if (typeof html2canvas === 'undefined') {
      throw new Error('html2canvas 尚未載入');
    }


    if (
      typeof Forms !== 'undefined'
      && typeof Forms.validateBeforeDownload === 'function'
      && typeof Router !== 'undefined'
      && Router.currentDoc === 'promissory-bill'
    ) {
      const validation = Forms.validateBeforeDownload();
      if (!validation.valid) {
        Forms.focusFirstError(validation.errors);
        return;
      }
    }

    const paper = this.getPreviewPaper();
    const element = this.getPreviewElement();

    if (!paper || !element) {
      throw new Error('找不到文件預覽內容');
    }

    console.log('[PDF] preview found');

    const docType =
      typeof Router !== 'undefined' && Router.currentDoc
        ? Router.currentDoc
        : 'payment-order';

    const filename = this.getFilename(docType);
    const buttons = this.getDownloadButtons();
    const paperState = this.preparePaperForExport();

    this.setDownloadButtonsLoading(buttons, true);

    try {
      await this.waitForLayout();
      console.log('[PDF] rendering started');

      let pdf = null;
      let blob = null;

      if (this.isMobileDevice()) {
        try {
          const result = await this.generateStablePdf(element);
          pdf = result.pdf;
          blob = result.blob;
        } catch (stableError) {
          console.warn('[Download] Mobile stable PDF failed, using html2pdf fallback:', stableError);
          if (typeof html2pdf === 'undefined') throw stableError;
          blob = await this.generateMobilePdfBlob(element, filename);
        }
      } else {
        const result = await this.generateStablePdf(element);
        pdf = result.pdf;
        blob = result.blob;
      }

      if (!blob || blob.size === 0) {
        throw new Error('產生的 PDF 為空白檔案');
      }

      console.log('[PDF] blob created');

      if (!this.isMobileDevice()) {
        if (pdf) {
          pdf.save(filename);
        } else {
          this.downloadBlobWithAnchor(blob, filename);
        }
      } else {
        await this.deliverMobilePdf(blob, filename);
      }

      console.log('[PDF] ready');
    } catch (error) {
      console.error('[PDF] failed');
      console.error(error);
      throw error;
    } finally {
      this.restorePaperAfterExport(paperState);
      this.setDownloadButtonsLoading(buttons, false);
    }
  }
};

window.Download = Download;

async function handlePdfDownload(button) {
  return Download.handlePdfDownload(button);
}

window.handlePdfDownload = handlePdfDownload;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => Download.init());
} else {
  Download.init();
}
