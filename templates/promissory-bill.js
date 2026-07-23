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

  val(value, fallback = '＿＿＿＿＿＿＿＿＿＿') {
    return value && String(value).trim()
      ? this.escapeHtml(String(value).trim())
      : fallback;
  },

  hasValue(value) {
    return value !== '' && value !== null && value !== undefined && String(value).trim() !== '';
  },

  formatChineseDate(dateStr) {
    if (!dateStr) return '中華民國　　年　　月　　日';

    const { year, month, day } = LegalDocumentLayout.getRocDateParts(dateStr);
    if (!year) return '中華民國　　年　　月　　日';

    return `中華民國${this.escapeHtml(year)}年${this.escapeHtml(month)}月${this.escapeHtml(day)}日`;
  },

  formatAmountDisplay(amount) {
    if (!this.hasValue(amount)) {
      return {
        chinese: '＿＿＿＿＿＿＿＿＿＿',
        arabic: '＿＿＿＿＿＿＿＿＿＿'
      };
    }

    return {
      chinese: Utils.amountToChinese(amount),
      arabic: Utils.formatAmount(amount)
    };
  },

  renderPartyBlock(title, party = {}) {
    return `
      <div class="doc-preview__block">
        <p class="doc-preview__line doc-preview__line--label">${title}</p>
        <p class="doc-preview__line">${this.val(party.name)}</p>
        <p class="doc-preview__line">身分證字號：${this.val(party.idNumber)}</p>
        <p class="doc-preview__line">地址：${this.val(party.address)}</p>
      </div>
    `;
  },

  render(data = {}) {
    const payee = data.payee || {};
    const drawer = data.drawer || {};
    const note = data.note || {};
    const terms = data.terms || {};
    const other = data.other || {};

    const amount = this.formatAmountDisplay(note.amount);
    const dueType = note.dueType || '';
    const interestStart = note.interestStartDate || note.issueDate || '';

    const dueBlock = dueType === 'on_demand'
      ? '<p class="doc-preview__line doc-preview__line--emphasis">見票即付</p>'
      : `<p class="doc-preview__line">到期日：${this.formatChineseDate(note.dueDate)}</p>`;

    const interestBlock = this.hasValue(note.interestRate)
      ? `<p class="doc-preview__line">本票金額自${this.formatChineseDate(interestStart)}起，按年利率百分之${this.escapeHtml(String(note.interestRate).trim())}計付利息。</p>`
      : '';

    const waiveBlock = terms.waiveProtest === true || terms.waiveProtest === 'true'
      ? '<p class="doc-preview__line">免除作成拒絕證書</p>'
      : '';

    const nonNegotiableBlock = terms.nonNegotiable === true || terms.nonNegotiable === 'true'
      ? '<p class="doc-preview__line">禁止背書轉讓</p>'
      : '';

    const remarkBlock = this.hasValue(other.remark)
      ? `<p class="doc-preview__line">備註：${this.val(other.remark, '')}</p>`
      : '';

    const drawerName = this.hasValue(drawer.name)
      ? `${this.escapeHtml(String(drawer.name).trim())}　　　　　`
      : '＿＿＿＿＿＿＿＿＿＿';

    return `
      <div class="doc-preview doc-preview--promissory-bill">
        <h1 class="doc-preview__title">本　　票</h1>

        ${this.renderPartyBlock('受款人：', payee)}

        <div class="doc-preview__block">
          <p class="doc-preview__line">
            憑票於本票所載到期日，無條件支付受款人${this.val(payee.name)}或其指定人：
          </p>
          <p class="doc-preview__line doc-preview__line--amount">新臺幣${amount.chinese}</p>
          <p class="doc-preview__line doc-preview__line--amount-sub">（NT$${amount.arabic}）</p>
          ${dueBlock}
          <p class="doc-preview__line">付款地：${this.val(note.paymentPlace)}</p>
          <p class="doc-preview__line">發票地：${this.val(note.issuePlace)}</p>
          ${interestBlock}
          ${waiveBlock}
          ${nonNegotiableBlock}
          ${remarkBlock}
        </div>

        <div class="doc-preview__block doc-preview__signature-block">
          <p class="doc-preview__line doc-preview__line--signature">發票人：${drawerName}（簽名或蓋章）</p>
          <p class="doc-preview__line">身分證字號：${this.val(drawer.idNumber)}</p>
          <p class="doc-preview__line">地址：${this.val(drawer.address)}</p>
          <p class="doc-preview__line">&nbsp;</p>
          <p class="doc-preview__line">&nbsp;</p>
          <p class="doc-preview__line">&nbsp;</p>
        </div>

        <div class="doc-preview__block">
          <p class="doc-preview__line">發票日：${this.formatChineseDate(note.issueDate)}</p>
        </div>
      </div>
    `;
  }
};

window.PromissoryBillTemplate = PromissoryBillTemplate;
