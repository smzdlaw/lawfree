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

  renderRow(label, value, options = {}) {
    const { always = false, raw = false } = options;
    if (!always && !this.hasValue(value)) return '';

    const display = raw ? value : this.val(value);
    if (!always && !display) return '';

    return `
      <div class="bill-row">
        <span class="bill-label">${label}</span>
        <span class="bill-value">${display}</span>
      </div>
    `;
  },

  renderPaymentText(note, payee, amountChinese) {
    const dueType = note.dueType || '';
    let prefix;

    if (dueType === 'fixed') {
      prefix = '本票發票人於本票所載到期日，無條件擔任支付';
    } else if (dueType === 'on_demand') {
      prefix = '本票發票人於見票時，無條件擔任支付';
    } else {
      prefix = '本票發票人無條件擔任支付';
    }

    const payeeName = payee?.name ? String(payee.name).trim() : '';

    let text;
    if (payeeName) {
      const escapedName = this.escapeHtml(payeeName);
      text = `${prefix}受款人${escapedName}或其指定人新臺幣${amountChinese}。`;
    } else {
      text = `${prefix}執票人新臺幣${amountChinese}。`;
    }

    return `<p class="bill-main-text bill-text-emphasis">${text}</p>`;
  },

  renderDueSection(note) {
    const dueType = note.dueType || '';
    const parts = [];

    if (dueType === 'fixed') {
      parts.push(this.renderRow('到期方式：', '指定到期日', { always: true, raw: true }));

      const dueDate = this.formatChineseDate(note.dueDate);
      if (dueDate) {
        parts.push(this.renderRow('到期日：', dueDate, { always: true, raw: true }));
      }
    } else if (dueType === 'on_demand') {
      parts.push('<p class="bill-on-demand bill-text-emphasis">見票即付</p>');
    }

    return parts.filter(Boolean).join('');
  },

  renderInterestRow(note) {
    if (this.hasInterestRate(note.interestRate)) {
      const rateText = `${this.formatInterestRate(note.interestRate)}%`;
      return this.renderRow('約定年利率：', rateText, { always: true, raw: true });
    }

    return this.renderRow('利息：', '未約定（依法定利率計算）', { always: true, raw: true });
  },

  renderOptionalTerms(terms = {}, other = {}) {
    const parts = [];

    if (terms.waiveProtest === true || terms.waiveProtest === 'true') {
      parts.push(this.renderRow('', '免除作成拒絕證書', { always: true, raw: true }));
    }

    if (terms.nonNegotiable === true || terms.nonNegotiable === 'true') {
      parts.push(this.renderRow('', '禁止背書轉讓', { always: true, raw: true }));
    }

    if (this.hasValue(other.remark)) {
      parts.push(this.renderRow('備註：', this.val(other.remark), { always: true, raw: true }));
    }

    return parts.join('');
  },

  render(data = {}) {
    const payee = data.payee || {};
    const drawer = data.drawer || {};
    const note = data.note || {};
    const terms = data.terms || {};
    const other = data.other || {};

    const amount = this.formatAmountDisplay(note.amount);
    const amountBlock = amount
      ? `
        <div class="bill-row bill-text-emphasis">
          <span class="bill-label">本票金額：</span>
          <span class="bill-value">新臺幣${this.escapeHtml(amount.chinese)}</span>
        </div>
        <div class="bill-row bill-text-emphasis">
          <span class="bill-label">金額：</span>
          <span class="bill-value">（NT$ ${this.escapeHtml(amount.arabic)}）</span>
        </div>
      `
      : '';

    const paymentText = amount
      ? this.renderPaymentText(note, payee, this.escapeHtml(amount.chinese))
      : '';

    const issueDate = this.formatChineseDate(note.issueDate);
    const drawerRows = [
      this.renderRow('發票人：', drawer.name, { always: true }),
      this.renderRow('身分證字號：', drawer.idNumber),
      this.renderRow('地址：', drawer.address)
    ].filter(Boolean).join('');

    return `
      <div class="doc-preview doc-preview--promissory-bill promissory-bill-preview">
        <h1 class="doc-preview__title bill-title">本　票</h1>

        ${amountBlock}

        ${paymentText}

        <div class="bill-section">
          ${this.renderDueSection(note)}
          ${this.renderRow('付款地：', note.paymentPlace)}
          ${this.renderRow('發票地：', note.issuePlace)}
          ${this.renderInterestRow(note)}
          ${this.renderOptionalTerms(terms, other)}
        </div>

        ${issueDate ? this.renderRow('發票日期：', issueDate, { always: true, raw: true }) : ''}

        <div class="bill-section bill-drawer">
          ${drawerRows}
        </div>

        <div class="bill-signature">
          <p class="bill-signature-label">簽名或蓋章：</p>
          <div class="signature-space" aria-hidden="true"></div>
        </div>
      </div>
    `;
  }
};

window.PromissoryBillTemplate = PromissoryBillTemplate;
