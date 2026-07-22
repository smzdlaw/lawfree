/**
 * 案件類型預設資料（僅供表單帶入，不顯示於正式書狀）
 */
const CaseTypePresets = {
  借款: {
    rate: 5,
    reason: '相對人{debtor}向聲請人{creditor}借貸金錢，雙方約定利率如聲請事項所示。相對人屆期未清償，經合法催告後仍不履行，爰依法聲請貴院對相對人核發支付命令，請求相對人給付如聲請事項所示之金額及利息。'
  },
  買賣貨款: {
    rate: 5,
    reason: '相對人{debtor}向聲請人{creditor}購買貨品，積欠價金未付，雙方約定給付期日已屆。相對人經催告後仍拒絕給付，爰依法聲請貴院對相對人核發支付命令，請求給付如聲請事項所示之價金及利息。'
  },
  租金: {
    rate: 5,
    reason: '相對人{debtor}使用聲請人{creditor}所有之標的物，積欠使用費用未付，給付期日已屆。相對人經催告後仍拒絕給付，爰依法聲請貴院對相對人核發支付命令，請求給付如聲請事項所示之金額及利息。'
  },
  工程款: {
    rate: 5,
    reason: '相對人{debtor}委託聲請人{creditor}承攬工程，積欠工程價金未付，給付期日已屆。相對人經催告後仍拒絕給付，爰依法聲請貴院對相對人核發支付命令，請求給付如聲請事項所示之金額及利息。'
  },
  薪資: {
    rate: 5,
    reason: '相對人{debtor}僱用聲請人{creditor}提供勞務，積欠報酬未付，給付期日已屆。相對人經催告後仍拒絕給付，爰依法聲請貴院對相對人核發支付命令，請求給付如聲請事項所示之金額及利息。'
  },
  和解金: {
    rate: 5,
    reason: '聲請人{creditor}與相對人{debtor}曾達成和解，相對人應給付聲請人一定金額，金額如聲請事項所示。相對人屆期未履行，爰依法聲請貴院對相對人核發支付命令，請求給付如聲請事項所示之金額及利息。'
  },
  損害賠償: {
    rate: 5,
    reason: '因相對人{debtor}之行為致聲請人{creditor}受有損害，雙方約定賠償金額如聲請事項所示。相對人屆期未給付，爰依法聲請貴院對相對人核發支付命令，請求給付如聲請事項所示之金額及利息。'
  },
  服務費: {
    rate: 5,
    reason: '相對人{debtor}委託聲請人{creditor}提供服務，積欠服務報酬未付，給付期日已屆。相對人經催告後仍拒絕給付，爰依法聲請貴院對相對人核發支付命令，請求給付如聲請事項所示之金額及利息。'
  },
  承攬報酬: {
    rate: 5,
    reason: '相對人{debtor}委託聲請人{creditor}承攬工作，積欠承攬報酬未付，給付期日已屆。相對人經催告後仍拒絕給付，爰依法聲請貴院對相對人核發支付命令，請求給付如聲請事項所示之金額及利息。'
  },
  其他: {
    rate: 5,
    reason: '相對人{debtor}積欠聲請人{creditor}債務，金額如聲請事項所示，給付期日已屆。相對人經催告後仍拒絕給付，爰依法聲請貴院對相對人核發支付命令，請求給付如聲請事項所示之金額及利息。'
  }
};

const CASE_TYPE_OPTIONS = [
  { value: '', label: '請選擇案件類型' },
  { value: '借款', label: '借款' },
  { value: '買賣貨款', label: '買賣貨款' },
  { value: '租金', label: '租金' },
  { value: '工程款', label: '工程款' },
  { value: '薪資', label: '薪資' },
  { value: '和解金', label: '和解金' },
  { value: '損害賠償', label: '損害賠償' },
  { value: '服務費', label: '服務費' },
  { value: '承攬報酬', label: '承攬報酬' },
  { value: '其他', label: '其他（自行輸入）' }
];

const ATTACHMENT_OPTIONS = [
  { id: 'iou', label: '借據', preview: '借據影本乙份' },
  { id: 'check', label: '支票', preview: '支票影本乙份' },
  { id: 'transfer', label: '匯款紀錄', preview: '匯款紀錄影本乙份' },
  { id: 'line', label: 'LINE 對話紀錄', preview: 'LINE對話紀錄影本乙份' },
  { id: 'messenger', label: 'Messenger 對話紀錄', preview: 'Messenger對話紀錄影本乙份' },
  { id: 'email', label: 'Email', preview: 'Email影本乙份' },
  { id: 'certified_mail', label: '存證信函', preview: '存證信函影本乙份' },
  { id: 'demand_letter', label: '催告函', preview: '催告函影本乙份' },
  { id: 'invoice', label: '發票', preview: '發票影本乙份' },
  { id: 'receipt', label: '收據', preview: '收據影本乙份' },
  { id: 'contract', label: '合約', preview: '合約影本乙份' },
  { id: 'quotation', label: '報價單', preview: '報價單影本乙份' },
  { id: 'other', label: '其他', preview: null }
];

const CN_NUMERALS = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二', '十三'];

/**
 * 正式法律文件共用排版（支付命令、本票裁定、離婚協議等）
 */
const LegalDocumentLayout = {
  escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  },

  renderSigner(name, fallback = '　　　　') {
    const display = name && String(name).trim()
      ? this.escapeHtml(String(name).trim())
      : fallback;

    return `
      <div class="doc-preview__signer-row">
        <div>
          <p class="doc-preview__line doc-preview__signer">
            具狀人　${display}
          </p>

          <p class="doc-preview__signer-tip">
            ⚠ 提醒您：列印後請於具狀人欄位親自簽名。
          </p>
        </div>
      </div>
    `;
  }
};

window.CaseTypePresets = CaseTypePresets;
window.CASE_TYPE_OPTIONS = CASE_TYPE_OPTIONS;
window.ATTACHMENT_OPTIONS = ATTACHMENT_OPTIONS;
window.CN_NUMERALS = CN_NUMERALS;
window.LegalDocumentLayout = LegalDocumentLayout;