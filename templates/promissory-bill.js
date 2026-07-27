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

  renderPaymentHeading(note = {}) {
    const dueType = note.dueType || '';
    const dueDate = note.dueDate || '';

    let dateLineHtml;

    if (dueType === 'fixed' && this.hasValue(dueDate)) {
      const formattedDate = this.formatChineseDate(dueDate);
      dateLineHtml = `
        <div class="bill-payment-date-line bill-payment-date-line--filled">
          <span>憑票於${formattedDate}，</span><strong>無條件擔任支付</strong>
        </div>
      `;
    } else if (dueType === 'on_demand') {
      dateLineHtml = `
        <div class="bill-payment-date-line bill-payment-date-line--filled">
          <span>憑票見票即付，</span><strong>無條件擔任支付</strong>
        </div>
      `;
    } else {
      dateLineHtml = `
        <div class="bill-payment-date-line">
          <span>憑票於中華民國</span>
          <span class="bill-inline-date-space"></span>
          <span>年</span>
          <span class="bill-inline-date-space bill-inline-date-space--short"></span>
          <span>月</span>
          <span class="bill-inline-date-space bill-inline-date-space--short"></span>
          <span>日，</span>
          <strong>無條件擔任支付</strong>
        </div>
      `;
    }

    return `
      <div class="bill-payment-heading">
        ${dateLineHtml}
        <div class="bill-payment-recipient">執票人或其指定人</div>
      </div>
    `;
  },

  renderTerms(note) {
    const interestLine = this.hasInterestRate(note.interestRate)
      ? `本票據利息按年利率 ${this.formatInterestRate(note.interestRate)}% 計算。`
      : '利息未約定，依法定利率計算。';

    return `
      <div class="bill-terms">
        <p>${interestLine}</p>
        <div class="bill-term-row">本票據免除作成拒絕證書。</div>
      </div>
    `;
  },

  renderHandwritingSection() {
    return `
      <div class="bill-handwriting-section">
        <div class="bill-handwriting-row">
          <span class="bill-handwriting-label">發票人：</span>
          <span class="bill-handwriting-line"></span>
        </div>

        <div class="bill-handwriting-row">
          <span class="bill-handwriting-label">身分證字號：</span>
          <span class="bill-handwriting-line"></span>
        </div>

        <div class="bill-handwriting-row">
          <span class="bill-handwriting-label">地址：</span>
          <span class="bill-handwriting-line"></span>
        </div>

        <div class="bill-date-handwriting-row">
          <span class="bill-handwriting-label">發票日期：</span>
          <span>中華民國</span>
          <span class="bill-date-line bill-date-line--year"></span>
          <span>年</span>
          <span class="bill-date-line"></span>
          <span>月</span>
          <span class="bill-date-line"></span>
          <span>日</span>
        </div>
      </div>
    `;
  },

  render(data = {}) {
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

            ${amountBox}

            ${this.renderTerms(note)}

            ${detailsBlock}

            ${this.renderHandwritingSection()}
          </div>
        </div>
      </div>
    `;
  }
};

window.PromissoryBillTemplate = PromissoryBillTemplate;
