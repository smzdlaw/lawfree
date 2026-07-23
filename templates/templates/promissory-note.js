/**
 * 本票裁定聲請狀預覽模板
 */
const PromissoryNoteTemplate = {
    escapeHtml(str) {
      return String(str ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    },
  
    val(value, fallback = '　　　　') {
      return value && String(value).trim()
        ? this.escapeHtml(String(value).trim())
        : fallback;
    },
  
    formatAmount(amount) {
      if (amount === '' || amount === null || amount === undefined) {
        return '　　　　';
      }
  
      const number = Number(amount);
  
      if (Number.isNaN(number)) {
        return '　　　　';
      }
  
      return number.toLocaleString('zh-TW');
    },
  
    formatRocDate(dateStr) {
      if (!dateStr) {
        return '　　年　　月　　日';
      }
  
      const date = new Date(`${dateStr}T00:00:00`);
  
      if (Number.isNaN(date.getTime())) {
        return '　　年　　月　　日';
      }
  
      return `${date.getFullYear() - 1911}年${date.getMonth() + 1}月${date.getDate()}日`;
    },
  
    renderPartySection(label, party = {}) {
      return `
        <div class="doc-preview__block">
          <p class="doc-preview__line doc-preview__line--label">${label}</p>
          <p class="doc-preview__line">${this.val(party.name)}</p>
          <p class="doc-preview__line">身分證字號：${this.val(party.idNumber)}</p>
          <p class="doc-preview__line">住、居所：${this.val(party.address)}</p>
          <p class="doc-preview__line">電　　話：${this.val(party.phone)}</p>
        </div>
      `;
    },

    parseOtherMaterials(text) {
      if (!text || !String(text).trim()) {
        return [];
      }

      return String(text)
        .split(/[,，、\n\r]+/)
        .map((item) => item.trim())
        .filter(Boolean);
    },

    renderAttachments(attachments = {}) {
      const lines = ['本票正本及影本各乙份（正本請確認後擲回）'];
      const selected = attachments.selectedOrder || [];

      if (selected.includes('other_materials')) {
        const items = this.parseOtherMaterials(attachments.otherMaterialsText);

        if (items.length === 0) {
          lines.push('其他相關資料乙份');
        } else {
          items.forEach((item) => {
            lines.push(`${this.escapeHtml(item)}乙份`);
          });
        }
      }

      const itemsHtml = lines.map((text, index) => {
        const num = CN_NUMERALS[index] || String(index + 1);
        return `<p class="doc-preview__line doc-preview__line--indent">${num}、${text}。</p>`;
      }).join('');

      return `
        <div class="doc-preview__block doc-preview__attachments">
          <p class="doc-preview__line doc-preview__line--label">附件：</p>
          ${itemsHtml}
        </div>
      `;
    },
  
    render(data = {}) {
      const creditor = data.creditor || {};
      const debtor = data.debtor || {};
      const claim = data.claim || {};
      const attachments = data.attachments || {};
  
      const amount = this.formatAmount(claim.amount);
      const issueDate = this.formatRocDate(claim.issueDate);
      const interestStartDate = this.formatRocDate(claim.interestStartDate);
      const interestRate = this.val(claim.interestRate, '6');
      const court = this.val(claim.court);
  
      return `
        <div class="doc-preview">
          <h1 class="doc-preview__title">本票裁定聲請狀</h1>
  
          ${this.renderPartySection('聲請人（執票人）', creditor)}
          ${this.renderPartySection('相對人（發票人）', debtor)}
  
          <div class="doc-preview__block">
  <p class="doc-preview__heading"> <strong>聲請事項：</strong></p>

  <p class="doc-preview__line doc-preview__claim-item">
    一、相對人於民國${issueDate}簽發本票乙紙，票面金額新臺幣${amount}元整。自${interestStartDate}起至清償日止，按週年利率百分之${interestRate}計算之利息，准予強制執行。
  </p>

  <p class="doc-preview__line doc-preview__claim-item">
    二、程序費用由相對人負擔。
  </p>
</div>
  
          <div class="doc-preview__block">
            <p class="doc-preview__heading"> <strong>聲請理由：</strong></p>
  
            <p class="doc-preview__line doc-preview__paragraph">
              相對人簽發上開本票交付聲請人，詎屆期提示未獲付款，爰依票據法第123條規定，聲請鈞院裁定准予強制執行。
            </p>
          </div>
  
                  <div class="doc-preview__footer">
  <p class="doc-preview__line doc-preview__salutation">此　致</p>
  <p class="doc-preview__line doc-preview__court">${court}　公鑒</p>

  ${LegalDocumentLayout.renderDocumentDate(claim.documentDate, { wrapper: 'line' })}
  ${LegalDocumentLayout.renderSigner(creditor.name)}
</div>

        ${this.renderAttachments(attachments)}
      </div>
    `;
  }
};

window.PromissoryNoteTemplate = PromissoryNoteTemplate;