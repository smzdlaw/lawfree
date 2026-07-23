/**
 * 借據預覽模板
 */
const IouTemplate = {
  DELIVERY_LABELS: {
    cash: '現金交付',
    transfer: '銀行轉帳',
    remittance: '匯款',
    check: '支票',
    other: '其他'
  },

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

  hasValue(value) {
    return value !== '' && value !== null && value !== undefined && String(value).trim() !== '';
  },

  formatAmountDisplay(amount) {
    if (!this.hasValue(amount)) {
      return {
        chinese: '　　　　',
        arabic: '　　　　',
        combined: '　　　　'
      };
    }

    const chinese = Utils.amountToChinese(amount);
    const arabic = Utils.formatAmount(amount);

    return {
      chinese,
      arabic,
      combined: `新臺幣${chinese}（NT$${arabic}）`
    };
  },

  getDeliveryText(delivery = {}) {
    const method = delivery.method || '';

    if (method === 'other') {
      return this.val(delivery.methodOther);
    }

    const label = this.DELIVERY_LABELS[method];
    return label ? this.escapeHtml(label) : '　　　　';
  },

  renderPartyBlock(title, party = {}) {
    return `
      <div class="doc-preview__block">
        <p class="doc-preview__line">${title}${this.val(party.name)}</p>
        <p class="doc-preview__line">身分證字號：${this.val(party.idNumber)}</p>
        <p class="doc-preview__line">地址：${this.val(party.address)}</p>
      </div>
    `;
  },

  render(data = {}) {
    const lender = data.lender || {};
    const borrower = data.borrower || {};
    const loan = data.loan || {};
    const delivery = data.delivery || {};
    const other = data.other || {};

    const amount = this.formatAmountDisplay(loan.amount);
    const loanDate = Utils.formatRocDate(loan.loanDate);
    const dueDate = Utils.formatRocDate(loan.dueDate);
    const deliveryText = this.getDeliveryText(delivery);

    const interestBlock = this.hasValue(loan.interestRate)
      ? `<p class="doc-preview__line">雙方約定借款利息按年利率百分之${this.escapeHtml(String(loan.interestRate).trim())}計算。</p>`
      : '';

    const defaultInterestBlock = this.hasValue(loan.defaultInterestRate)
      ? `<p class="doc-preview__line">借款人逾期未清償時，應按年利率百分之${this.escapeHtml(String(loan.defaultInterestRate).trim())}計付違約利息。</p>`
      : '';

    const deliveredBlock = delivery.delivered === true || delivery.delivered === 'true'
      ? '<p class="doc-preview__line">借款人確認已收受上述借款，雙方確認借款已交付完成，並同意本借據內容。</p>'
      : '';

    const remarkBlock = this.hasValue(other.remark)
      ? `<p class="doc-preview__line">其他約定：${this.val(other.remark)}。</p>`
      : '';

    return `
      <div class="doc-preview">
        <h1 class="doc-preview__title">借　　據</h1>

        <div class="doc-preview__block">
          <p class="doc-preview__line">
            立借據人${this.val(borrower.name)}（以下稱借款人），向${this.val(lender.name)}（以下稱出借人）借得${amount.combined}。
          </p>
          <p class="doc-preview__line">
            借款期間自${loanDate}起，至${dueDate}止。
          </p>
          <p class="doc-preview__line">借款交付方式：${deliveryText}。</p>
          ${interestBlock}
          ${defaultInterestBlock}
          ${deliveredBlock}
          ${remarkBlock}
        </div>

        ${this.renderPartyBlock('出借人：', lender)}
        ${this.renderPartyBlock('借款人：', borrower)}

        ${LegalDocumentLayout.renderDocumentDate(other.signDate, { wrapper: 'signature' })}
      </div>
    `;
  }
};

window.IouTemplate = IouTemplate;
