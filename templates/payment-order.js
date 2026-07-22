/**
 * 民事聲請支付命令狀預覽模板
 * 格式依司法院支付命令狀
 */
const PaymentOrderTemplate = {
  escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  },

  val(text, fallback = '　　　　') {
    return text && String(text).trim()
      ? this.escapeHtml(String(text).trim())
      : fallback;
  },

  hasValue(text) {
    return Boolean(text && String(text).trim());
  },

  formatAmount(amount) {
    if (amount === '' || amount === null || amount === undefined) {
      return '　　　　';
    }

    const num = Number(amount);
    if (Number.isNaN(num)) {
      return '　　　　';
    }

    return num.toLocaleString('zh-TW');
  },

  getRocDateParts(dateStr) {
    if (dateStr === '') {
      return { year: '', month: '', day: '' };
    }

    const source = dateStr ? new Date(dateStr) : new Date();
    if (Number.isNaN(source.getTime())) {
      return { year: '', month: '', day: '' };
    }

    return {
      year: String(source.getFullYear() - 1911),
      month: String(source.getMonth() + 1),
      day: String(source.getDate())
    };
  },

  renderDocumentDate(dateStr) {
    const { year, month, day } = this.getRocDateParts(dateStr);
  
    return (
      '<div class="doc-preview__date-line">' +
        '<div class="doc-preview__date-row">' +
          '<span class="doc-preview__date-char">中</span>' +
          '<span class="doc-preview__date-char">華</span>' +
          '<span class="doc-preview__date-char">民</span>' +
          '<span class="doc-preview__date-char">國</span>' +
  
          this.renderDateNumber(year) +
          '<span class="doc-preview__date-unit">年</span>' +
  
          this.renderDateNumber(month) +
          '<span class="doc-preview__date-unit">月</span>' +
  
          this.renderDateNumber(day) +
          '<span class="doc-preview__date-unit">日</span>' +
        '</div>' +
      '</div>'
    );
  },

  formatRocDate(dateStr) {
    if (!dateStr) {
      return '　　年　　月　　日';
    }

    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) {
      return '　　年　　月　　日';
    }

    const rocYear = d.getFullYear() - 1911;
    return `${rocYear}年${d.getMonth() + 1}月${d.getDate()}日`;
  },

  formatTodayRoc() {
    const { year, month, day } = this.getRocDateParts();
    return `${year}年${month}月${day}日`;
  },

  renderPartySection(label, party) {
    const lines = [
      `<p class="doc-preview__line doc-preview__line--label">${label}</p>`,
      `<p class="doc-preview__line">${this.val(party.name)}</p>`
    ];

    if (this.hasValue(party.idNumber)) {
      lines.push(
        `<p class="doc-preview__line">身分證字號：${this.escapeHtml(String(party.idNumber).trim())}</p>`
      );
    }

    if (party.birthDate) {
      lines.push(
        `<p class="doc-preview__line">出生年月日：${this.formatRocDate(party.birthDate)}</p>`
      );
    }

    if (this.hasValue(party.address)) {
      lines.push(
        `<p class="doc-preview__line">住、居所：${this.escapeHtml(String(party.address).trim())}</p>`
      );
    }

    if (this.hasValue(party.phone)) {
      lines.push(
        `<p class="doc-preview__line">電　　話：${this.escapeHtml(String(party.phone).trim())}</p>`
      );
    }

    return `
      <div class="doc-preview__block">
        ${lines.join('')}
      </div>
    `;
  },

  renderClaimItem(claim) {
    const amount = this.formatAmount(claim.amount);
    const hasRate =
      claim.interestRate !== '' &&
      claim.interestRate !== null &&
      claim.interestRate !== undefined;
  
    const hasDate = Boolean(claim.interestStartDate);
  
    let firstItem = '';
  
    if (hasRate && hasDate) {
      firstItem = `相對人應給付聲請人新臺幣${amount}元，及自${this.formatRocDate(
        claim.interestStartDate
      )}起至清償日止，按年利率百分之${this.val(
        String(claim.interestRate),
        '　　'
      )}計算之利息。`;
    } else if (hasDate) {
      firstItem = `相對人應給付聲請人新臺幣${amount}元，及自${this.formatRocDate(
        claim.interestStartDate
      )}起至清償日止之利息。`;
    } else if (hasRate) {
      firstItem = `相對人應給付聲請人新臺幣${amount}元，及按年利率百分之${this.val(
        String(claim.interestRate),
        '　　'
      )}計算之利息。`;
    } else {
      firstItem = `相對人應給付聲請人新臺幣${amount}元。`;
    }
  
    return `
      <p class="doc-preview__claim-item">
        一、${firstItem}
      </p>
      <p class="doc-preview__claim-item">
        二、督促程序費用由相對人負擔。
      </p>
    `;
  },
  formatCourt(court) {
    if (!court || !String(court).trim()) {
      return '<span class="doc-preview__court-placeholder">＿＿＿＿＿＿地方法院</span>';
    }

    return this.escapeHtml(String(court).trim());
  },

  getAttachmentPreviewText(id, attachments) {
    if (id === 'other') {
      const text = attachments?.otherText?.trim();
      return text ? `${text}影本乙份` : '';
    }

    const opt = ATTACHMENT_OPTIONS.find((o) => o.id === id);
    return opt?.preview || '';
  },

  renderAttachments(attachments) {
    const order = attachments?.selectedOrder || [];
    const lines = [];

    order.forEach((id) => {
      const text = this.getAttachmentPreviewText(id, attachments);
      if (text) {
        lines.push(text);
      }
    });

    if (lines.length === 0) {
      return '';
    }

    const itemsHtml = lines.map((text, index) => {
      const num = CN_NUMERALS[index] || String(index + 1);
      return `<p class="doc-preview__line doc-preview__line--indent">${num}、${this.escapeHtml(text)}。</p>`;
    }).join('');

    return `
      <div class="doc-preview__block doc-preview__attachments">
        <p class="doc-preview__line doc-preview__line--label">附件：</p>
        ${itemsHtml}
      </div>
    `;
  },

  render(data) {
    const creditor = data.creditor || {};
    const debtor = data.debtor || {};
    const claim = data.claim || {};
    const reason =
    claim.reason && String(claim.reason).trim()
      ? this.escapeHtml(String(claim.reason).trim()).trim()
      : "（請敘述請求原因及事實）";

    return `
      <div class="doc-preview">
        <h1 class="doc-preview__title">民事聲請支付命令狀</h1>

        ${this.renderPartySection('聲請人（即債權人）', creditor)}
        ${this.renderPartySection('相對人（即債務人）', debtor)}

       <div class="doc-preview__block">
  <p class="doc-preview__line doc-preview__line--label">聲請事項：</p>

  <div class="doc-preview__claim">
    ${this.renderClaimItem(claim)}
  </div>
</div>

        <div class="doc-preview__block">
          <p class="doc-preview__line doc-preview__line--label">聲請理由：</p>
          <div class="doc-preview__reason">${reason}</div>
        </div>

        <div class="doc-preview__footer">
          <p class="doc-preview__line doc-preview__salutation">此　致</p>
          <p class="doc-preview__line doc-preview__court">${this.formatCourt(claim.court)}　公鑒</p>
          ${this.renderDocumentDate(claim.documentDate)}
          ${LegalDocumentLayout.renderSigner(creditor.name)}
        </div>

        ${this.renderAttachments(data.attachments)}
      </div>
    `;
  }
};
