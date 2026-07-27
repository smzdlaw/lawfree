/**
 * 本票預覽模板
 */
const PromissoryBillTemplate = {
  escapeHtml(str) {
    return String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  },

  hasValue(value) {
    return value !== '' && value !== null && value !== undefined && String(value).trim() !== '';
  },

  val(value) {
    return this.hasValue(value) ? this.escapeHtml(String(value).trim()) : '';
  },

  formatChineseDate(dateStr) {
    if (!dateStr) return '';

    const { year, month, day } = LegalDocumentLayout.getRocDateParts(dateStr);
    if (!year) return '';

    return `中華民國${this.escapeHtml(year)}年${this.escapeHtml(month)}月${this.escapeHtml(day)}日`;
  },

  formatAmountDisplay(amount) {
    if (!this.hasValue(amount)) return null;

    return {
      chinese: Utils.amountToChinese(amount),
      arabic: Utils.formatAmount(amount)
    };
  },

  hasInterestRate(rate) {
    if (!this.hasValue(rate)) return false;

    const num = Number(String(rate).trim().replace(/[%％]/g, ''));
    return Number.isFinite(num) && num !== 0;
  },

  formatInterestRate(rate) {
    return this.escapeHtml(String(rate).trim().replace(/[%％]/g, ''));
  },

  renderDetailRow(label, value) {
    if (!this.hasValue(value)) return '';

    return `
      <div class="bill-detail-row">
        <span class="bill-detail-label">${label}</span>
        <span class="bill-detail-value">${this.val(value)}</span>
      </div>
    `;
  },

  renderPaymentHeading(note) {
    const dueType = note.dueType || '';
    let text = '';

    if (dueType === 'fixed') {
      const dueDate = this.formatChineseDate(note.dueDate);
      text = dueDate
        ? `憑票於${dueDate}，<strong>無條件擔任支付</strong>。`
        : `憑票於本票所載到期日，<strong>無條件擔任支付</strong>。`;
    } else if (dueType === 'on_demand') {
      text = '憑票見票即付，<strong>無條件擔任支付</strong>。';
    }

    if (!text) return '';

    return `<p class="bill-payment-heading">${text}</p>`;
  },

  renderPayeeText(payee) {
    const payeeName = payee?.name ? String(payee.name).trim() : '';

    if (payeeName) {
      return `<p class="bill-payment-text">本票發票人<strong>無條件擔任支付</strong>受款人「${this.escapeHtml(payeeName)}」或其指定人。</p>`;
    }

    return '<p class="bill-payment-text">本票發票人<strong>無條件擔任支付</strong>執票人。</p>';
  },

  renderTerms(note) {
    const interestLine = this.hasInterestRate(note.interestRate)
      ? `本票據利息按年利率 ${this.formatInterestRate(note.interestRate)}% 計算。`
      : '利息未約定，依法定利率計算。';

    return `
      <div class="bill-terms">
        <p>${interestLine}</p>
        <p>本票據免除作成拒絕證書。</p>
      </div>
    `;
  },

  renderIssuerRow(label, value, options = {}) {
    const { raw = false } = options;
    if (!this.hasValue(value) && !raw) return '';

    const display = raw ? value : this.val(value);
    if (!display) return '';

    return `
      <div class="bill-issuer-row">
        <span class="bill-issuer-label">${label}</span>
        <span class="bill-issuer-value">${display}</span>
      </div>
    `;
  },

  renderIssuer(drawer, note) {
    const rows = [
      this.renderIssuerRow('發票人：', drawer.name),
      this.renderIssuerRow('身分證字號：', drawer.idNumber),
      this.renderIssuerRow('地址：', drawer.address)
    ].filter(Boolean);

    const issueDate = this.formatChineseDate(note.issueDate);
    if (issueDate) {
      rows.push(this.renderIssuerRow('發票日期：', issueDate, { raw: true }));
    }

    if (!rows.length) return '';

    return `<div class="bill-issuer">${rows.join('')}</div>`;
  },

  render(data = {}) {
    const payee = data.payee || {};
    const drawer = data.drawer || {};
    const note = data.note || {};

    const amount = this.formatAmountDisplay(note.amount);
    const amountBox = amount
      ? `
        <div class="bill-amount-box">
          <div class="bill-amount-chinese">新臺幣　${this.escapeHtml(amount.chinese)}</div>
          <div class="bill-amount-number">（NT$ ${this.escapeHtml(amount.arabic)}）</div>
        </div>
      `
      : '';

    const paymentPlaceRow = this.renderDetailRow('付款地：', note.paymentPlace);
    const detailsBlock = paymentPlaceRow
      ? `<div class="bill-details">${paymentPlaceRow}</div>`
      : '';

    const issuerBlock = this.renderIssuer(drawer, note);

    return `
      <div class="doc-preview doc-preview--promissory-bill promissory-bill-preview-wrapper">
        <div class="promissory-bill-paper">
          <div class="bill-security-strip">
            <h1 class="bill-title-panel">
              <span>本</span>
              <span>票</span>
            </h1>
          </div>

          <div class="bill-content">
            ${this.renderPaymentHeading(note)}

            ${this.renderPayeeText(payee)}

            ${amountBox}

            ${this.renderTerms(note)}

            ${detailsBlock}

            ${issuerBlock}

            <div class="bill-signature-space">
              <span class="bill-signature-label">簽名或蓋章：</span>
              <div class="signature-space" aria-hidden="true"></div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
};

window.PromissoryBillTemplate = PromissoryBillTemplate;
