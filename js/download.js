/**
 * PDF 下載
 * Part 1 / 3
 */

const Download = {

  pdfFilenames: {
      "payment-order": "支付命令.pdf",
      "promissory-note": "本票裁定.pdf",
      "divorce": "離婚協議書.pdf"
  },

  init() {

      const btn = document.getElementById("downloadPdfBtn");

      if (!btn) return;

      if (btn.dataset.bound === "1") return;

      btn.dataset.bound = "1";

      btn.addEventListener("click", () => {

          this.downloadPdf();

      });

  },

  getFilename(docType) {

      return this.pdfFilenames[docType] || "法律文件.pdf";

  },

  getPreviewElement() {

      const paper = document.getElementById("previewPaper");

      if (!paper) return null;

      return paper.querySelector(".preview-paper__inner");

  },

  async downloadPdf() {

      if (typeof html2pdf === "undefined") {

          alert("html2pdf 尚未載入");

          return;

      }

      const element = this.getPreviewElement();

      if (!element) {

          alert("找不到預覽內容");

          return;

      }

      const docType =
          (typeof Router !== "undefined" && Router.currentDoc)
              ? Router.currentDoc
              : "payment-order";

      const filename = this.getFilename(docType);

      const button = document.getElementById("downloadPdfBtn");

      if (button) {

          button.disabled = true;

      }

      await new Promise(resolve => {

          requestAnimationFrame(() => {

              requestAnimationFrame(resolve);

          });

      });

      const opt = {

          margin: 10,

          filename,

          image: {
              type: "jpeg",
              quality: 1
          },

          html2canvas: {

              scale: 2,

              useCORS: true,

              allowTaint: true,

              backgroundColor: "#ffffff",

              logging: false,

              scrollX: 0,

              scrollY: 0
          },

          jsPDF: {

              unit: "mm",

              format: "a4",

              orientation: "portrait"

          },

          pagebreak: {

              mode: [
                  "css",
                  "legacy"
              ]

          }

      };        try {

        await html2pdf()
            .from(element)
            .set(opt)
            .save();

    } catch (err) {

        console.error(err);

        alert("PDF 下載失敗");

    } finally {

        if (button) {

            button.disabled = false;

        }

    }

}

};

window.Download = Download;

document.addEventListener("DOMContentLoaded", () => {

Download.init();

});