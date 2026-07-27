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

  renderDetailRow(label, value, options = {}) {
    const { always = false, raw = false } = options;
    if (!always && !this.hasValue(value)) return '';

    const display = raw ? value : this.val(value);
    if (!always && !display) return '';

    return `
      <div class="bill-detail-row">
        <span class="bill-detail-label">${label}</span>
        <span class="bill-detail-value">${display}</span>
      </div>
    `;
  },

  renderPaymentText(note, payee) {
    const dueType = note.dueType || '';
    let lead;

    if (dueType === 'fixed') {
      lead = '本票發票人於本票所載到期日，';
    } else if (dueType === 'on_demand') {
      lead = '本票發票人於見票時，';
    } else {
      lead = '本票發票人';
    }

    const payeeName = payee?.name ? String(payee.name).trim() : '';
    const tail = payeeName
      ? `受款人「${this.escapeHtml(payeeName)}」或其指定人。`
      : '執票人。';

    return `<p class="bill-payment-text">${lead}<strong class="bill-pay-emphasis">無條件擔任支付</strong>${tail}</p>`;
  },

  renderMeta(note) {
    const rows = [];
    const issueDate = this.formatChineseDate(note.issueDate);

    if (issueDate) {
      rows.push(this.renderDetailRow('發票日期：', issueDate, { always: true, raw: true }));
    }

    const dueType = note.dueType || '';
    if (dueType === 'fixed') {
      rows.push(this.renderDetailRow('到期方式：', '指定到期日', { always: true, raw: true }));

      const dueDate = this.formatChineseDate(note.dueDate);
      if (dueDate) {
        rows.push(this.renderDetailRow('到期日：', dueDate, { always: true, raw: true }));
      }
    } else if (dueType === 'on_demand') {
      rows.push(this.renderDetailRow('到期方式：', '見票即付', { always: true, raw: true }));
    }

    if (!rows.length) return '';

    return `<div class="bill-meta">${rows.join('')}</div>`;
  },

  renderInterestRow(note) {
    if (this.hasInterestRate(note.interestRate)) {
      const rateText = `${this.formatInterestRate(note.interestRate)}%`;
      return this.renderDetailRow('約定年利率：', rateText, { always: true, raw: true });
    }

    return this.renderDetailRow('利息：', '未約定（依法定利率計算）', { always: true, raw: true });
  },

  renderOptionalTerms(terms = {}, other = {}) {
    const parts = [];

    if (terms.waiveProtest === true || terms.waiveProtest === 'true') {
      parts.push(this.renderDetailRow('', '免除作成拒絕證書', { always: true, raw: true }));
    }

    if (terms.nonNegotiable === true || terms.nonNegotiable === 'true') {
      parts.push(this.renderDetailRow('', '禁止背書轉讓', { always: true, raw: true }));
    }

    if (this.hasValue(other.remark)) {
      parts.push(this.renderDetailRow('備註：', this.val(other.remark), { always: true, raw: true }));
    }

    return parts.join('');
  },

  renderIssuer(drawer) {
    const rows = [
      this.renderDetailRow('發票人：', drawer.name, { always: true }),
      this.renderDetailRow('身分證字號：', drawer.idNumber),
      this.renderDetailRow('地址：', drawer.address)
    ].filter(Boolean);

    if (!rows.length) return '';

    return `<div class="bill-issuer">${rows.join('')}</div>`;
  },

  render(data = {}) {
    const payee = data.payee || {};
    const drawer = data.drawer || {};
    const note = data.note || {};
    const terms = data.terms || {};
    const other = data.other || {};

    const amount = this.formatAmountDisplay(note.amount);
    const amountBox = amount
      ? `
        <div class="bill-amount-box">
          <div class="bill-amount-chinese">新臺幣　${this.escapeHtml(amount.chinese)}</div>
          <div class="bill-amount-number">（NT$ ${this.escapeHtml(amount.arabic)}）</div>
        </div>
      `
      : '';

    const detailsRows = [
      this.renderDetailRow('付款地：', note.paymentPlace),
      this.renderDetailRow('發票地：', note.issuePlace),
      this.renderInterestRow(note),
      this.renderOptionalTerms(terms, other)
    ].filter(Boolean).join('');

    const detailsBlock = detailsRows
      ? `<div class="bill-details">${detailsRows}</div>`
      : '';

    const issuerBlock = this.renderIssuer(drawer);

    return `
      <div class="doc-preview doc-preview--promissory-bill promissory-bill-preview-wrapper">
        <div class="promissory-bill-paper">
          <div class="bill-security-strip" aria-hidden="true">
            <span class="bill-strip-mark">SLF</span>
          </div>

          <div class="bill-content">
            <div class="bill-number">票據編號：SLF-PREVIEW</div>

            <h1 class="bill-title">本　票</h1>

            ${this.renderMeta(note)}

            ${this.renderPaymentText(note, payee)}

            ${amountBox}

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
