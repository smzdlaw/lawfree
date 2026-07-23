/**
 * 表單渲染與資料管理
 */
const FALLBACK_FORM_CONFIG = {
  'payment-order': {
    title: '支付命令聲請狀',
    steps: [
      {
        id: 1,
        label: '填寫資料',
        sections: [
          {
            title: '債權人',
            prefix: 'creditor',
            fields: [
              { name: 'name', label: '姓名', type: 'text', required: true, placeholder: '例如：王小明' },
              { name: 'idNumber', label: '身分證字號', type: 'text', required: false, placeholder: '例如：A123456789' },
              { name: 'birthDate', label: '出生年月日', type: 'date', required: false, placeholder: '例如：1980-01-01' },
              { name: 'phone', label: '電話', type: 'tel', required: true, placeholder: '例如：0912-345-678' },
              { name: 'address', label: '地址', type: 'text', required: true, placeholder: '例如：臺中市西區XX路XX號' }
            ]
          },
          {
            title: '債務人',
            prefix: 'debtor',
            fields: [
              { name: 'name', label: '姓名', type: 'text', required: true, placeholder: '例如：陳大明' },
              { name: 'idNumber', label: '身分證字號', type: 'text', required: false, placeholder: '例如：B223456789' },
              { name: 'birthDate', label: '出生年月日', type: 'date', required: false, placeholder: '例如：1985-06-15' },
              { name: 'phone', label: '電話', type: 'tel', required: false, placeholder: '例如：0922-123-456' },
              { name: 'address', label: '地址', type: 'text', required: false, placeholder: '例如：臺中市西區XX路XX號' }
            ]
          },
          {
            title: '請求內容',
            prefix: 'claim',
            fields: [
              {
                name: 'caseType',
                label: '案件類型',
                type: 'select',
                required: true,
                options: CASE_TYPE_OPTIONS
              },
              { name: 'amount', label: '請求金額', type: 'number', required: true, placeholder: '例如：100000' },
              { name: 'interestRate', label: '利率（%）', type: 'number', required: false, placeholder: '例如：5' },
              { name: 'interestStartDate', label: '利息起算日', type: 'date', required: true, placeholder: '例如：2024-01-01' },
              { name: 'reason', label: '聲請理由', type: 'textarea', required: true, placeholder: '依案件類型自動帶入正式範本。' },
              {
                name: 'court',
                label: '法院',
                type: 'text',
                required: true,
                placeholder: '例如：臺灣臺中地方法院'
              }
            ]
          }
        ]
      }
    ]
  }
};

const Forms = {
  formConfig: null,
  formData: {},
  currentDoc: 'payment-order',
  currentStep: 1,
  lastCaseType: '',

  async init(docType) {
    this.currentDoc = docType;
    await this.loadConfig();
    const saved = Storage.load(docType);

    if (docType === 'divorce') {
      this.formData = saved?.formData || { husband: {}, wife: {}, agreement: {} };
      this.ensureDivorcePartyDefaults();
      this.ensureDivorceAgreementDefaults();
    } else if (docType === 'iou') {
      this.formData = saved?.formData || {
        lender: {},
        borrower: {},
        loan: {},
        delivery: { delivered: false },
        other: {}
      };
      if (!this.formData.delivery) {
        this.formData.delivery = { delivered: false };
      }
      if (this.formData.delivery.delivered === undefined) {
        this.formData.delivery.delivered = false;
      }
    } else {
      this.formData = saved?.formData || { creditor: {}, debtor: {}, claim: {}, attachments: { selectedOrder: [], otherText: '', otherMaterialsText: '' } };
      if (!this.formData.attachments) {
        this.formData.attachments = { selectedOrder: [], otherText: '', otherMaterialsText: '' };
      }
      if (!Array.isArray(this.formData.attachments.selectedOrder)) {
        this.formData.attachments.selectedOrder = [];
      }
      if (this.formData.attachments.otherMaterialsText === undefined) {
        this.formData.attachments.otherMaterialsText = '';
      }
    }

    this.currentStep = 1;
    this.lastCaseType = this.formData.claim?.caseType || '';
    this.render();
  },

  ensureDivorcePartyDefaults() {
    ['husband', 'wife'].forEach((prefix) => {
      if (!this.formData[prefix]) {
        this.formData[prefix] = {};
      }
      if (this.formData[prefix].phone === undefined) {
        this.formData[prefix].phone = '';
      }
    });
  },

  ensureDivorceAgreementDefaults() {
    const defaults = {
      hasMinorChildren: '',
      minorChildrenCount: '1',
      children: [],
      supportStatus: 'no',
      supportAmount: '',
      supportPayDay: '',
      supportPayDayOther: '',
      supportPayUntil: '',
      supportPayUntilOther: '',
      supportPayMethod: '',
      supportPayMethodOther: '',
      supportBankName: '',
      supportBankBranch: '',
      supportAccountName: '',
      supportAccountNumber: '',
      visitationMethod: '',
      visitationWeekday: '',
      visitationStartTime: '',
      visitationEndTime: '',
      visitationPickup: '',
      visitationPickupOther: '',
      visitationCustomText: '',
      custodyType: '',
      custodyOtherText: '',
      propertyType: '',
      propertyOtherText: '',
      jointDebtType: '',
      jointDebtOtherText: '',
      propertyAgreement: '',
      otherAgreement: '',
      documentDate: ''
    };

    this.formData.agreement = {
      ...defaults,
      ...(this.formData.agreement || {})
    };

    if (!Array.isArray(this.formData.agreement.children)) {
      this.formData.agreement.children = [];
    }

    if (this.formData.agreement.hasMinorChildren === 'yes') {
      const count = Number(this.formData.agreement.minorChildrenCount) || 1;
      this.formData.agreement.minorChildrenCount = String(count);
      this.syncChildrenArray(count);
    }
  },

  syncChildrenArray(count) {
    const n = Math.max(0, Math.min(5, Number(count) || 0));
    if (!this.formData.agreement) this.formData.agreement = {};
    if (!Array.isArray(this.formData.agreement.children)) {
      this.formData.agreement.children = [];
    }

    while (this.formData.agreement.children.length < n) {
      this.formData.agreement.children.push({ name: '', birthDate: '', idNumber: '' });
    }

    if (this.formData.agreement.children.length > n) {
      this.formData.agreement.children = this.formData.agreement.children.slice(0, n);
    }
  },

  getChildLabel(index) {
    return ['一', '二', '三', '四', '五'][index] || String(index + 1);
  },

  async loadConfig() {
    try {
      const res = await fetch(`data/forms.json?v=${Date.now()}`, {
        cache: 'no-store'
      });
  
      if (!res.ok) {
        throw new Error(`fetch failed: ${res.status}`);
      }
  
      const config = await res.json();
  
      this.formConfig = config[this.currentDoc] || null;
  
      if (!this.formConfig) {
        console.error(`找不到表單設定：${this.currentDoc}`);
      }
    } catch (err) {
      console.error('表單設定載入失敗：', err);
      this.formConfig = FALLBACK_FORM_CONFIG[this.currentDoc] || null;
    }
  },
  saveFormData() {
    Storage.save(this.currentDoc, {
      formData: this.formData,
      wizardStep: 1
    });
  },

  getStepConfig(stepId) {
    return this.formConfig?.steps?.find((s) => s.id === stepId);
  },

  render() {
    const container = document.getElementById('formArea');
    if (!container || !this.formConfig) return;

    const stepConfig = this.getStepConfig(1);
    if (!stepConfig) {
      container.innerHTML = this.renderPlaceholder();
      return;
    }

    container.innerHTML = `
      <div class="form-panel">
        <h2 class="form-panel__title">${stepConfig.label}</h2>
        <form class="form" id="docForm" novalidate>
          ${stepConfig.sections.map((section) => this.renderSection(section)).join('')}
          ${this.currentDoc === 'payment-order' ? this.renderAttachmentsSection() : ''}
          ${this.currentDoc === 'promissory-note' ? this.renderPromissoryAttachmentsSection() : ''}
        </form>
      </div>
    `;

    this.bindEvents();
    if (this.currentDoc === 'divorce') {
      this.updateDivorceSupportUI();
      this.updateDivorceVisitationUI();
      this.updateDivorceCustodyUI();
      this.updateDivorcePropertyUI();
      this.updateDivorceJointDebtUI();
      this.updateDivorceChildrenUI();
      this.updateDivorceSignaturePreview();
    }
    if (this.currentDoc === 'iou') {
      this.updateIouDeliveryUI();
    }
    Preview.update(this.currentDoc, this.formData);
  },

  renderSection(section) {
    if (this.currentDoc === 'divorce' && section.prefix === 'agreement') {
      return this.renderDivorceAgreementSection(section);
    }

    if (this.currentDoc === 'divorce' && (section.prefix === 'husband' || section.prefix === 'wife')) {
      return this.renderDivorcePartySection(section);
    }

    return `
      <fieldset class="form-section">
        <legend class="form-section__title">${section.title}</legend>
        <div class="form-section__fields">
          ${section.fields.map((field) => this.renderField(section.prefix, field)).join('')}
        </div>
      </fieldset>
    `;
  },

  renderDivorcePartySection(section) {
    const fieldsHtml = section.fields.map((field) => this.renderField(section.prefix, field)).join('');
    const phoneHtml = this.renderField(section.prefix, {
      name: 'phone',
      label: '聯絡電話',
      type: 'tel',
      required: false,
      placeholder: '例如：0912-345-678'
    });

    return `
      <fieldset class="form-section">
        <legend class="form-section__title">${section.title}</legend>
        <div class="form-section__fields">
          ${fieldsHtml}
          ${phoneHtml}
        </div>
      </fieldset>
    `;
  },

  renderField(prefix, field) {
    const key = Utils.getFieldKey(prefix, field.name);
    const value = Utils.getNestedValue(this.formData, prefix, field.name);
    const id = `field-${prefix}-${field.name}`;

    let inputHtml = '';
    const hint = field.name === 'caseType'
      ? '<p class="form-field__hint">僅供系統帶入聲請理由及利率範本，不會顯示於正式書狀</p>'
      : '';

    const placeholder = field.placeholder || '';

    if (field.type === 'checkbox') {
      const checked = value === true || value === 'true';
      return `
        <div class="form-field" data-field="${key}">
          <label class="form-checkbox">
            <input type="checkbox" class="form-checkbox__input" id="${id}" name="${key}" ${checked ? 'checked' : ''}>
            <span class="form-checkbox__label">${this.escapeHtml(field.checkboxLabel || field.label)}</span>
          </label>
          <p class="form-field__error" id="error-${key}"></p>
        </div>
      `;
    }

    if (field.type === 'textarea') {
      inputHtml = `<textarea class="form-field__input form-field__textarea" id="${id}" name="${key}" rows="5" placeholder="${this.escapeHtml(placeholder)}">${this.escapeHtml(value)}</textarea>`;
    } else if (field.type === 'select') {
      const options = (field.options || [])
        .map((opt) => `<option value="${this.escapeHtml(opt.value)}" ${opt.value === value ? 'selected' : ''}>${this.escapeHtml(opt.label)}</option>`)
        .join('');
      inputHtml = `<select class="form-field__input form-field__select" id="${id}" name="${key}">${options}</select>`;
    } else if (field.type === 'number') {
      const isIouAmount = this.currentDoc === 'iou' && field.name === 'amount';
      const step = isIouAmount ? '1' : 'any';
      const inputMode = isIouAmount ? 'numeric' : 'decimal';
      inputHtml = `<input class="form-field__input" type="number" id="${id}" name="${key}" value="${this.escapeHtml(value)}" min="0" step="${step}" inputmode="${inputMode}" placeholder="${this.escapeHtml(placeholder)}">`;
    } else {
      inputHtml = `<input class="form-field__input" type="${field.type}" id="${id}" name="${key}" value="${this.escapeHtml(value)}" placeholder="${this.escapeHtml(placeholder)}">`;
    }

    const otherHtml = field.name === 'caseType' ? this.renderCaseTypeOther(prefix, value) : '';
    const hiddenClass = field.name === 'methodOther' ? ' form-field--iou-method-other' : '';
    const hiddenStyle = field.name === 'methodOther' && Utils.getNestedValue(this.formData, prefix, 'method') !== 'other'
      ? ' style="display:none"'
      : '';

    return `
      <div class="form-field${hiddenClass}" data-field="${key}"${hiddenStyle}>
        <label class="form-field__label" for="${id}">
          ${field.label}
          ${field.required ? '<span class="form-field__required">*</span>' : ''}
        </label>
        ${inputHtml}
        ${hint}
        ${otherHtml}
        <p class="form-field__error" id="error-${key}"></p>
      </div>
    `;
  },

  renderDivorceAgreementSection(section) {
    const fieldsHtml = section.fields.map((field) => {
      if (field.name === 'hasMinorChildren') {
        return this.renderDivorceMinorChildrenSection();
      }
      if (field.name === 'supportAgreement') {
        return this.renderDivorceSupportSection();
      }
      if (field.name === 'childrenAgreement') {
        return this.renderDivorceCustodySection();
      }
      if (field.name === 'propertyAgreement') {
        return this.renderDivorceVisitationSection() + this.renderDivorcePropertySection();
      }
      if (field.name === 'otherAgreement') {
        return this.renderDivorceJointDebtSection() + this.renderDivorceOtherSection();
      }
      if (field.name === 'documentDate') {
        return this.renderDivorceSignatureSection() + this.renderField(section.prefix, field);
      }
      return this.renderField(section.prefix, field);
    }).join('');

    return `
      <fieldset class="form-section">
        <legend class="form-section__title">${section.title}</legend>
        <div class="form-section__fields">
          ${fieldsHtml}
        </div>
      </fieldset>
    `;
  },

  renderDivorceRadioGroup(prefix, name, legend, options) {
    const key = Utils.getFieldKey(prefix, name);
    const value = Utils.getNestedValue(this.formData, prefix, name) || '';

    const radios = options.map((opt) => `
      <label class="form-checkbox">
        <input
          type="radio"
          class="form-checkbox__input"
          name="${key}"
          value="${this.escapeHtml(opt.value)}"
          ${value === opt.value ? 'checked' : ''}
        >
        <span class="form-checkbox__label">${this.escapeHtml(opt.label)}</span>
      </label>
    `).join('');

    return `
      <div class="form-field" data-field="${key}">
        <span class="form-field__label">${legend}</span>
        <div class="form-checkbox-group">
          ${radios}
        </div>
      </div>
    `;
  },

  renderDivorceMinorChildrenSection() {
    const prefix = 'agreement';
    const a = this.formData.agreement || {};
    const hasYes = a.hasMinorChildren === 'yes';
    const count = a.minorChildrenCount || '1';
    const countOptions = [1, 2, 3, 4, 5].map((n) => `
      <option value="${n}" ${String(n) === String(count) ? 'selected' : ''}>${n}</option>
    `).join('');

    return `
      <div class="form-section form-section--nested" id="divorce-minor-children-section">
        ${this.renderDivorceRadioGroup(prefix, 'hasMinorChildren', '是否有未成年子女', [
          { value: 'no', label: '無' },
          { value: 'yes', label: '有' }
        ])}

        <div id="divorce-children-count" style="${hasYes ? '' : 'display:none'}">
          <div class="form-field" data-field="agreement.minorChildrenCount">
            <label class="form-field__label" for="field-agreement-minorChildrenCount">未成年子女人數</label>
            <select class="form-field__input form-field__select" id="field-agreement-minorChildrenCount" name="agreement.minorChildrenCount">
              ${countOptions}
            </select>
            <p class="form-field__error" id="error-agreement.minorChildrenCount"></p>
          </div>
        </div>

        <div id="divorce-children-list-wrap" style="${hasYes ? '' : 'display:none'}">
          <div id="divorce-children-list">
            ${this.renderDivorceChildrenFieldsHtml()}
          </div>
        </div>
      </div>
    `;
  },

  renderDivorceChildrenFieldsHtml() {
    const a = this.formData.agreement || {};
    const children = Array.isArray(a.children) ? a.children : [];
    const count = Number(a.minorChildrenCount) || children.length || 1;

    return Array.from({ length: count }, (_, index) => this.renderDivorceChildFields(index)).join('');
  },

  renderDivorceChildFields(index) {
    const prefix = 'agreement';
    const child = this.formData.agreement?.children?.[index] || { name: '', birthDate: '', idNumber: '' };
    const label = this.getChildLabel(index);
    const nameKey = `${prefix}.children.${index}.name`;
    const birthKey = `${prefix}.children.${index}.birthDate`;
    const idKey = `${prefix}.children.${index}.idNumber`;

    return `
      <div class="form-section form-section--child" data-child-index="${index}">
        <span class="form-field__label">子女${label}</span>

        <div class="form-field" data-field="${nameKey}">
          <label class="form-field__label" for="field-agreement-children-${index}-name">姓名</label>
          <input
            class="form-field__input"
            type="text"
            id="field-agreement-children-${index}-name"
            name="${nameKey}"
            value="${this.escapeHtml(child.name || '')}"
            placeholder="例如：王小明"
          >
          <p class="form-field__error" id="error-${nameKey}"></p>
        </div>

        <div class="form-field" data-field="${birthKey}">
          <label class="form-field__label" for="field-agreement-children-${index}-birthDate">出生日期</label>
          <input
            class="form-field__input"
            type="date"
            id="field-agreement-children-${index}-birthDate"
            name="${birthKey}"
            value="${this.escapeHtml(child.birthDate || '')}"
          >
          <p class="form-field__error" id="error-${birthKey}"></p>
        </div>

        <div class="form-field" data-field="${idKey}">
          <label class="form-field__label" for="field-agreement-children-${index}-idNumber">身分證字號</label>
          <input
            class="form-field__input"
            type="text"
            id="field-agreement-children-${index}-idNumber"
            name="${idKey}"
            value="${this.escapeHtml(child.idNumber || '')}"
            placeholder="例如：A123456789"
          >
          <p class="form-field__error" id="error-${idKey}"></p>
        </div>
      </div>
    `;
  },

  rerenderChildrenList() {
    const container = document.getElementById('divorce-children-list');
    if (container) {
      container.innerHTML = this.renderDivorceChildrenFieldsHtml();
    }
  },

  clearDivorceChildrenFields() {
    Utils.setNestedValue(this.formData, 'agreement', 'minorChildrenCount', '');
    this.formData.agreement.children = [];
  },

  renderDivorceSupportSection() {
    const prefix = 'agreement';
    const a = this.formData.agreement || {};
    const status = a.supportStatus || 'no';

    return `
      <div class="form-section form-section--nested" id="divorce-support-section">
        ${this.renderDivorceRadioGroup(prefix, 'supportStatus', '扶養費', [
          { value: 'no', label: '無' },
          { value: 'yes', label: '有' }
        ])}

        <div id="divorce-support-details" style="${status === 'yes' ? '' : 'display:none'}">
          <div class="form-field" data-field="agreement.supportAmount">
            <label class="form-field__label" for="field-agreement-supportAmount">【每月扶養費】</label>
            <div class="form-field__prefix-row">
              <span class="form-field__prefix">NT$</span>
              <input
                class="form-field__input"
                type="number"
                id="field-agreement-supportAmount"
                name="agreement.supportAmount"
                value="${this.escapeHtml(a.supportAmount || '')}"
                min="0"
                step="1"
                inputmode="numeric"
                placeholder=""
              >
              <span class="form-field__suffix">元</span>
            </div>
            <p class="form-field__error" id="error-agreement.supportAmount"></p>
          </div>

          ${this.renderDivorceRadioGroup(prefix, 'supportPayDay', '【給付日期】', [
            { value: 'day5', label: '每月5日' },
            { value: 'day10', label: '每月10日' },
            { value: 'day15', label: '每月15日' },
            { value: 'day20', label: '每月20日' },
            { value: 'day25', label: '每月25日' },
            { value: 'month_end', label: '每月底' },
            { value: 'other', label: '其他（請填寫）' }
          ])}

          <div class="form-field form-field--nested" id="divorce-support-payday-other" data-field="agreement.supportPayDayOther" style="${a.supportPayDay === 'other' ? '' : 'display:none'}">
            <label class="form-field__label" for="field-agreement-supportPayDayOther">其他給付日期</label>
            <input class="form-field__input" type="text" id="field-agreement-supportPayDayOther" name="agreement.supportPayDayOther" value="${this.escapeHtml(a.supportPayDayOther || '')}" placeholder="請填寫給付日期">
            <p class="form-field__error" id="error-agreement.supportPayDayOther"></p>
          </div>

          ${this.renderDivorceRadioGroup(prefix, 'supportPayUntil', '【給付至】', [
            { value: 'age18', label: '滿18歲' },
            { value: 'age20', label: '滿20歲' },
            { value: 'college', label: '大學畢業' },
            { value: 'other', label: '其他（請填寫）' }
          ])}

          <div class="form-field form-field--nested" id="divorce-support-until-other" data-field="agreement.supportPayUntilOther" style="${a.supportPayUntil === 'other' ? '' : 'display:none'}">
            <label class="form-field__label" for="field-agreement-supportPayUntilOther">其他給付期限</label>
            <input class="form-field__input" type="text" id="field-agreement-supportPayUntilOther" name="agreement.supportPayUntilOther" value="${this.escapeHtml(a.supportPayUntilOther || '')}" placeholder="請填寫給付期限">
            <p class="form-field__error" id="error-agreement.supportPayUntilOther"></p>
          </div>

          ${this.renderDivorceRadioGroup(prefix, 'supportPayMethod', '【給付方式】', [
            { value: 'cash', label: '現金' },
            { value: 'transfer', label: '匯款' },
            { value: 'other', label: '其他（請填寫）' }
          ])}

          <div class="form-field form-field--nested" id="divorce-support-method-other" data-field="agreement.supportPayMethodOther" style="${a.supportPayMethod === 'other' ? '' : 'display:none'}">
            <label class="form-field__label" for="field-agreement-supportPayMethodOther">其他給付方式</label>
            <input class="form-field__input" type="text" id="field-agreement-supportPayMethodOther" name="agreement.supportPayMethodOther" value="${this.escapeHtml(a.supportPayMethodOther || '')}" placeholder="請填寫給付方式">
            <p class="form-field__error" id="error-agreement.supportPayMethodOther"></p>
          </div>

          <div id="divorce-support-bank-fields" style="${a.supportPayMethod === 'transfer' ? '' : 'display:none'}">
            <div class="form-field" data-field="agreement.supportBankName">
              <label class="form-field__label" for="field-agreement-supportBankName">銀行名稱</label>
              <input class="form-field__input" type="text" id="field-agreement-supportBankName" name="agreement.supportBankName" value="${this.escapeHtml(a.supportBankName || '')}" placeholder="例如：臺灣銀行">
              <p class="form-field__error" id="error-agreement.supportBankName"></p>
            </div>
            <div class="form-field" data-field="agreement.supportBankBranch">
              <label class="form-field__label" for="field-agreement-supportBankBranch">分行</label>
              <input class="form-field__input" type="text" id="field-agreement-supportBankBranch" name="agreement.supportBankBranch" value="${this.escapeHtml(a.supportBankBranch || '')}" placeholder="例如：台中分行">
              <p class="form-field__error" id="error-agreement.supportBankBranch"></p>
            </div>
            <div class="form-field" data-field="agreement.supportAccountName">
              <label class="form-field__label" for="field-agreement-supportAccountName">戶名</label>
              <input class="form-field__input" type="text" id="field-agreement-supportAccountName" name="agreement.supportAccountName" value="${this.escapeHtml(a.supportAccountName || '')}" placeholder="例如：王小明">
              <p class="form-field__error" id="error-agreement.supportAccountName"></p>
            </div>
            <div class="form-field" data-field="agreement.supportAccountNumber">
              <label class="form-field__label" for="field-agreement-supportAccountNumber">帳號</label>
              <input class="form-field__input" type="text" id="field-agreement-supportAccountNumber" name="agreement.supportAccountNumber" value="${this.escapeHtml(a.supportAccountNumber || '')}" placeholder="請填寫完整帳號">
              <p class="form-field__hint form-field__hint--muted">※ 建議填寫完整銀行、分行、戶名及帳號，以避免日後付款爭議。</p>
              <p class="form-field__error" id="error-agreement.supportAccountNumber"></p>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  updateDivorceSupportUI() {
    if (this.currentDoc !== 'divorce') return;

    const a = this.formData.agreement || {};
    const details = document.getElementById('divorce-support-details');
    const payDayOther = document.getElementById('divorce-support-payday-other');
    const untilOther = document.getElementById('divorce-support-until-other');
    const methodOther = document.getElementById('divorce-support-method-other');
    const bankFields = document.getElementById('divorce-support-bank-fields');

    if (details) {
      details.style.display = a.supportStatus === 'yes' ? '' : 'none';
    }
    if (payDayOther) {
      payDayOther.style.display = a.supportPayDay === 'other' ? '' : 'none';
    }
    if (untilOther) {
      untilOther.style.display = a.supportPayUntil === 'other' ? '' : 'none';
    }
    if (methodOther) {
      methodOther.style.display = a.supportPayMethod === 'other' ? '' : 'none';
    }
    if (bankFields) {
      bankFields.style.display = a.supportPayMethod === 'transfer' ? '' : 'none';
    }
  },

  clearDivorceSupportFields() {
    const fields = [
      'supportAmount',
      'supportPayDay',
      'supportPayDayOther',
      'supportPayUntil',
      'supportPayUntilOther',
      'supportPayMethod',
      'supportPayMethodOther',
      'supportBankName',
      'supportBankBranch',
      'supportAccountName',
      'supportAccountNumber'
    ];

    fields.forEach((name) => {
      Utils.setNestedValue(this.formData, 'agreement', name, '');
    });
  },

  isDivorceFixedVisitation(method) {
    return method === 'weekly' || method === 'biweekly' || method === 'monthly';
  },

  renderDivorceVisitationSection() {
    const prefix = 'agreement';
    const a = this.formData.agreement || {};
    const method = a.visitationMethod || '';
    const isFixed = this.isDivorceFixedVisitation(method);
    const weekdayOptions = [
      { value: '', label: '請選擇' },
      { value: 'mon', label: '星期一' },
      { value: 'tue', label: '星期二' },
      { value: 'wed', label: '星期三' },
      { value: 'thu', label: '星期四' },
      { value: 'fri', label: '星期五' },
      { value: 'sat', label: '星期六' },
      { value: 'sun', label: '星期日' }
    ];
    const weekdaySelect = weekdayOptions.map((opt) => `
      <option value="${this.escapeHtml(opt.value)}" ${opt.value === (a.visitationWeekday || '') ? 'selected' : ''}>${this.escapeHtml(opt.label)}</option>
    `).join('');

    return `
      <div class="form-section form-section--nested" id="divorce-visitation-section">
        ${this.renderDivorceRadioGroup(prefix, 'visitationMethod', '探視方式', [
          { value: 'mutual', label: '雙方自行協議，不另約定' },
          { value: 'weekly', label: '每週固定探視' },
          { value: 'biweekly', label: '隔週固定探視' },
          { value: 'monthly', label: '每月固定探視' },
          { value: 'custom', label: '自行約定（請填寫）' }
        ])}

        <div id="divorce-visitation-fixed" style="${isFixed ? '' : 'display:none'}">
          <div class="form-field" data-field="agreement.visitationWeekday">
            <label class="form-field__label" for="field-agreement-visitationWeekday">【探視星期】</label>
            <select class="form-field__input form-field__select" id="field-agreement-visitationWeekday" name="agreement.visitationWeekday">
              ${weekdaySelect}
            </select>
            <p class="form-field__error" id="error-agreement.visitationWeekday"></p>
          </div>

          <div class="form-field" data-field="agreement.visitationTime">
            <span class="form-field__label">【探視時間】</span>
            <div class="form-field__time-row">
              <div class="form-field__time-col">
                <label class="form-field__sub-label" for="field-agreement-visitationStartTime">開始時間</label>
                <input
                  class="form-field__input"
                  type="time"
                  id="field-agreement-visitationStartTime"
                  name="agreement.visitationStartTime"
                  value="${this.escapeHtml(a.visitationStartTime || '')}"
                >
              </div>
              <div class="form-field__time-col">
                <label class="form-field__sub-label" for="field-agreement-visitationEndTime">結束時間</label>
                <input
                  class="form-field__input"
                  type="time"
                  id="field-agreement-visitationEndTime"
                  name="agreement.visitationEndTime"
                  value="${this.escapeHtml(a.visitationEndTime || '')}"
                >
              </div>
            </div>
            <p class="form-field__error" id="error-agreement.visitationTime"></p>
          </div>

          ${this.renderDivorceRadioGroup(prefix, 'visitationPickup', '【接送方式】', [
            { value: 'husband', label: '男方接送' },
            { value: 'wife', label: '女方接送' },
            { value: 'mutual', label: '雙方自行約定' },
            { value: 'other', label: '其他（請填寫）' }
          ])}

          <div class="form-field form-field--nested" id="divorce-visitation-pickup-other" data-field="agreement.visitationPickupOther" style="${a.visitationPickup === 'other' ? '' : 'display:none'}">
            <label class="form-field__label" for="field-agreement-visitationPickupOther">其他接送方式</label>
            <input class="form-field__input" type="text" id="field-agreement-visitationPickupOther" name="agreement.visitationPickupOther" value="${this.escapeHtml(a.visitationPickupOther || '')}" placeholder="請填寫接送方式">
            <p class="form-field__error" id="error-agreement.visitationPickupOther"></p>
          </div>
        </div>

        <div class="form-field" id="divorce-visitation-custom" data-field="agreement.visitationCustomText" style="${method === 'custom' ? '' : 'display:none'}">
          <label class="form-field__label" for="field-agreement-visitationCustomText">探視及會面交往約定</label>
          <textarea class="form-field__input form-field__textarea" id="field-agreement-visitationCustomText" name="agreement.visitationCustomText" rows="5" placeholder="請填寫探視及會面交往之約定內容">${this.escapeHtml(a.visitationCustomText || '')}</textarea>
          <p class="form-field__error" id="error-agreement.visitationCustomText"></p>
        </div>
      </div>
    `;
  },

  updateDivorceVisitationUI() {
    if (this.currentDoc !== 'divorce') return;

    const a = this.formData.agreement || {};
    const method = a.visitationMethod || '';
    const fixed = document.getElementById('divorce-visitation-fixed');
    const custom = document.getElementById('divorce-visitation-custom');
    const pickupOther = document.getElementById('divorce-visitation-pickup-other');

    if (fixed) {
      fixed.style.display = this.isDivorceFixedVisitation(method) ? '' : 'none';
    }
    if (custom) {
      custom.style.display = method === 'custom' ? '' : 'none';
    }
    if (pickupOther) {
      pickupOther.style.display = a.visitationPickup === 'other' ? '' : 'none';
    }
  },

  clearDivorceVisitationFixedFields() {
    const fields = [
      'visitationWeekday',
      'visitationStartTime',
      'visitationEndTime',
      'visitationPickup',
      'visitationPickupOther'
    ];

    fields.forEach((name) => {
      Utils.setNestedValue(this.formData, 'agreement', name, '');
    });
  },

  clearDivorceVisitationCustomField() {
    Utils.setNestedValue(this.formData, 'agreement', 'visitationCustomText', '');
  },

  renderDivorceConditionalTextarea(prefix, fieldName, containerId, label, placeholder, visible) {
    const a = this.formData.agreement || {};
    const key = Utils.getFieldKey(prefix, fieldName);
    const value = a[fieldName] || '';

    return `
      <div class="form-field form-field--nested" id="${containerId}" data-field="${key}" style="${visible ? '' : 'display:none'}">
        <label class="form-field__label" for="field-${prefix}-${fieldName}">${label}</label>
        <textarea class="form-field__input form-field__textarea" id="field-${prefix}-${fieldName}" name="${key}" rows="5" placeholder="${this.escapeHtml(placeholder)}">${this.escapeHtml(value)}</textarea>
        <p class="form-field__error" id="error-${key}"></p>
      </div>
    `;
  },

  renderDivorceCustodySection() {
    const prefix = 'agreement';
    const a = this.formData.agreement || {};

    return `
      <div class="form-section form-section--nested" id="divorce-custody-section">
        ${this.renderDivorceRadioGroup(prefix, 'custodyType', '親權', [
          { value: 'husband', label: '由男方單獨行使負擔' },
          { value: 'wife', label: '由女方單獨行使負擔' },
          { value: 'joint', label: '雙方共同行使負擔' },
          { value: 'other', label: '雙方另有約定如下' }
        ])}
        ${this.renderDivorceConditionalTextarea(
          prefix,
          'custodyOtherText',
          'divorce-custody-other',
          '親權約定內容',
          '請填寫親權行使及負擔之約定內容',
          a.custodyType === 'other'
        )}
      </div>
    `;
  },

  renderDivorcePropertySection() {
    const prefix = 'agreement';
    const a = this.formData.agreement || {};

    return `
      <div class="form-section form-section--nested" id="divorce-property-section">
        ${this.renderDivorceRadioGroup(prefix, 'propertyType', '夫妻財產及剩餘財產分配', [
          { value: 'separate', label: '雙方名下財產各自所有，互不請求剩餘財產分配。' },
          { value: 'settled', label: '雙方已自行完成財產分配，日後互不爭執。' },
          { value: 'other', label: '雙方另有約定如下' }
        ])}
        ${this.renderDivorceConditionalTextarea(
          prefix,
          'propertyOtherText',
          'divorce-property-other',
          '財產分配約定內容',
          '請填寫夫妻財產及剩餘財產分配之約定內容',
          a.propertyType === 'other'
        )}
      </div>
    `;
  },

  renderDivorceJointDebtSection() {
    const prefix = 'agreement';
    const a = this.formData.agreement || {};

    return `
      <div class="form-section form-section--nested" id="divorce-joint-debt-section">
        ${this.renderDivorceRadioGroup(prefix, 'jointDebtType', '共同債務', [
          { value: 'none', label: '無共同債務。' },
          { value: 'settled', label: '雙方已協議共同債務清償方式。' },
          { value: 'other', label: '雙方另有約定如下' }
        ])}
        ${this.renderDivorceConditionalTextarea(
          prefix,
          'jointDebtOtherText',
          'divorce-joint-debt-other',
          '共同債務約定內容',
          '請填寫共同債務之約定內容',
          a.jointDebtType === 'other'
        )}
      </div>
    `;
  },

  renderDivorceOtherSection() {
    const prefix = 'agreement';
    const a = this.formData.agreement || {};
    const key = Utils.getFieldKey(prefix, 'otherAgreement');

    return `
      <div class="form-section form-section--nested" id="divorce-other-section">
        <div class="form-field" data-field="${key}">
          <label class="form-field__label" for="field-agreement-otherAgreement">其他約定事項</label>
          <textarea class="form-field__input form-field__textarea" id="field-agreement-otherAgreement" name="${key}" rows="5" placeholder="請輸入其他約定事項。">${this.escapeHtml(a.otherAgreement || '')}</textarea>
          <p class="form-field__error" id="error-${key}"></p>
        </div>
      </div>
    `;
  },

  renderDivorceSignatureSection() {
    const husband = this.formData.husband || {};
    const wife = this.formData.wife || {};

    return `
      <div class="form-section form-section--nested" id="divorce-signature-section">
        ${this.renderDivorceClosingText()}
        ${this.renderDivorceSigningDateStatic()}
        ${this.renderDivorcePartyStatic('甲方', 'a', husband)}
        ${this.renderDivorcePartyStatic('乙方', 'b', wife)}
        ${this.renderDivorceWitnessInlineStatic()}
      </div>
    `;
  },

  renderDivorceClosingText() {
    return `
      <div class="form-closing-static">
        <p class="form-closing-static__paragraph">本協議書經雙方詳閱後，確認內容無誤，並同意遵守本協議書所載各項約定。</p>
        <p class="form-closing-static__paragraph">本協議書一式三份，由甲、乙雙方各執一份，另一份供辦理離婚登記之戶政事務所留存，各份均具有同等法律效力。</p>
      </div>
    `;
  },

  renderDivorcePartyStatic(title, roleKey, party = {}) {
    return `
      <div class="form-signature-divider"></div>
      <div class="form-signature-party">
        <p class="form-signer-static__row form-signature-party-title">${title}：</p>
        <div class="form-signature-field-row form-signature-name-row">
          <span class="form-signature-label">姓名：</span>
          <span class="form-signature-value" id="divorce-signer-${roleKey}-name">${this.escapeHtml(party.name || '')}</span>
          <span class="form-signature-mark">（簽名或蓋章）</span>
        </div>
        <div class="form-signature-field-row">
          <span class="form-signature-label">身分證字號：</span>
          <span class="form-signature-value" id="divorce-signer-${roleKey}-id">${this.escapeHtml(party.idNumber || '')}</span>
        </div>
        <div class="form-signature-field-row">
          <span class="form-signature-label">聯絡電話：</span>
          <span class="form-signature-value" id="divorce-signer-${roleKey}-phone">${this.escapeHtml(party.phone || '')}</span>
        </div>
        <div class="form-signature-field-row">
          <span class="form-signature-label">戶籍地址：</span>
          <span class="form-signature-value" id="divorce-signer-${roleKey}-address">${this.escapeHtml(party.address || '')}</span>
        </div>
      </div>
    `;
  },

  renderDivorceWitnessInlineStatic() {
    return `
      <div class="form-signature-divider"></div>
      <div class="form-witness-row">
        <span class="form-witness-row-label">證人一：</span>
        <span class="form-signature-mark">（簽名或蓋章）</span>
      </div>
      <div class="form-witness-gap"></div>
      <div class="form-witness-row">
        <span class="form-witness-row-label">證人二：</span>
        <span class="form-signature-mark">（簽名或蓋章）</span>
      </div>
    `;
  },

  parseDivorceSigningDateParts(dateStr) {
    if (!dateStr || !String(dateStr).trim()) {
      return null;
    }

    const text = String(dateStr).trim();
    const match = text.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);

    if (match) {
      return {
        year: Number(match[1]) - 1911,
        month: Number(match[2]),
        day: Number(match[3])
      };
    }

    const d = new Date(text);
    if (!Number.isNaN(d.getTime())) {
      return {
        year: d.getFullYear() - 1911,
        month: d.getMonth() + 1,
        day: d.getDate()
      };
    }

    return null;
  },

  formatDivorceSigningDate(dateStr) {
    const spacedCountry = '中　華　民　國';
    const parts = this.parseDivorceSigningDateParts(dateStr);

    if (!parts) {
      return `${spacedCountry}　　　年　　　月　　　日`;
    }

    return `　　　　${spacedCountry}　${parts.year}　年　${parts.month}　月　${parts.day}　日`;
  },

  renderDivorceSigningDateStatic() {
    const dateText = this.formatDivorceSigningDate(this.formData.agreement?.documentDate);

    return `
      <div class="form-signature-date">
        <p class="form-signer-static__row form-signature-date-line" id="divorce-signing-date">${this.escapeHtml(dateText)}</p>
      </div>
    `;
  },

  updateDivorceSignaturePreview() {
    if (this.currentDoc !== 'divorce') return;

    const husband = this.formData.husband || {};
    const wife = this.formData.wife || {};
    const updates = [
      ['divorce-signer-a-name', husband.name],
      ['divorce-signer-a-id', husband.idNumber],
      ['divorce-signer-a-phone', husband.phone],
      ['divorce-signer-a-address', husband.address],
      ['divorce-signer-b-name', wife.name],
      ['divorce-signer-b-id', wife.idNumber],
      ['divorce-signer-b-phone', wife.phone],
      ['divorce-signer-b-address', wife.address]
    ];

    updates.forEach(([id, value]) => {
      const el = document.getElementById(id);
      if (el) {
        el.textContent = value || '';
      }
    });

    const dateEl = document.getElementById('divorce-signing-date');
    if (dateEl) {
      dateEl.textContent = this.formatDivorceSigningDate(this.formData.agreement?.documentDate);
    }
  },

  updateDivorceCustodyUI() {
    if (this.currentDoc !== 'divorce') return;

    const other = document.getElementById('divorce-custody-other');
    if (other) {
      other.style.display = this.formData.agreement?.custodyType === 'other' ? '' : 'none';
    }
  },

  updateDivorcePropertyUI() {
    if (this.currentDoc !== 'divorce') return;

    const other = document.getElementById('divorce-property-other');
    if (other) {
      other.style.display = this.formData.agreement?.propertyType === 'other' ? '' : 'none';
    }
  },

  updateDivorceJointDebtUI() {
    if (this.currentDoc !== 'divorce') return;

    const other = document.getElementById('divorce-joint-debt-other');
    if (other) {
      other.style.display = this.formData.agreement?.jointDebtType === 'other' ? '' : 'none';
    }
  },

  updateDivorceChildrenUI() {
    if (this.currentDoc !== 'divorce') return;

    const hasYes = this.formData.agreement?.hasMinorChildren === 'yes';
    const countWrap = document.getElementById('divorce-children-count');
    const listWrap = document.getElementById('divorce-children-list-wrap');
    const custodySection = document.getElementById('divorce-custody-section');

    if (countWrap) {
      countWrap.style.display = hasYes ? '' : 'none';
    }
    if (listWrap) {
      listWrap.style.display = hasYes ? '' : 'none';
    }
    if (custodySection) {
      custodySection.style.display = hasYes ? '' : 'none';
    }
  },

  clearDivorceOtherTextField(fieldName) {
    Utils.setNestedValue(this.formData, 'agreement', fieldName, '');
    const el = document.getElementById(`field-agreement-${fieldName}`);
    if (el) el.value = '';
  },

  renderCaseTypeOther(prefix, caseTypeValue) {
    if (caseTypeValue !== '其他') return '';
    const otherValue = Utils.getNestedValue(this.formData, prefix, 'caseTypeOther') || '';
    const key = Utils.getFieldKey(prefix, 'caseTypeOther');
    return `
      <div class="form-field form-field--nested" data-field="${key}">
        <label class="form-field__label" for="field-${prefix}-caseTypeOther">
          自行輸入說明
          <span class="form-field__required">*</span>
        </label>
        <input class="form-field__input" type="text" id="field-${prefix}-caseTypeOther" name="${key}" value="${this.escapeHtml(otherValue)}" placeholder="例如：裝潢設計費（不顯示於正式書狀）">
        <p class="form-field__error" id="error-${key}"></p>
      </div>
    `;
  },

  renderAttachmentsSection() {
    const attachments = this.formData.attachments || { selectedOrder: [], otherText: '' };
    const selected = attachments.selectedOrder || [];
    const otherChecked = selected.includes('other');

    const checkboxes = ATTACHMENT_OPTIONS.map((opt) => {
      const checked = selected.includes(opt.id) ? 'checked' : '';
      return `
        <label class="form-checkbox">
          <input type="checkbox" class="form-checkbox__input" data-attachment="${opt.id}" ${checked}>
          <span class="form-checkbox__label">${opt.label}</span>
        </label>
      `;
    }).join('');

    return `
      <fieldset class="form-section">
        <legend class="form-section__title">附件（可複選）</legend>
        <div class="form-checkbox-group">
          ${checkboxes}
        </div>
        <div class="form-field form-field--nested form-field--attachment-other" data-field="attachments.otherText" style="${otherChecked ? '' : 'display:none'}">
          <label class="form-field__label" for="field-attachments-otherText">其他附件說明</label>
          <input class="form-field__input" type="text" id="field-attachments-otherText" name="attachments.otherText" value="${this.escapeHtml(attachments.otherText || '')}" placeholder="例如：聊天截圖影本乙份">
        </div>
      </fieldset>
    `;
  },

  renderPromissoryAttachmentsSection() {
    const attachments = this.formData.attachments || { selectedOrder: [], otherMaterialsText: '' };
    const selected = attachments.selectedOrder || [];
    const otherChecked = selected.includes('other_materials');

    return `
      <fieldset class="form-section">
        <legend class="form-section__title">附件</legend>
        <div class="form-checkbox-group">
          <label class="form-checkbox">
            <input type="checkbox" class="form-checkbox__input" data-attachment="other_materials" ${otherChecked ? 'checked' : ''}>
            <span class="form-checkbox__label">其他相關資料</span>
          </label>
        </div>
        <div class="form-field form-field--nested form-field--promissory-attachment-other" data-field="attachments.otherMaterialsText" style="${otherChecked ? '' : 'display:none'}">
          <label class="form-field__label" for="field-attachments-otherMaterialsText">其他附件名稱</label>
          <input class="form-field__input" type="text" id="field-attachments-otherMaterialsText" name="attachments.otherMaterialsText" value="${this.escapeHtml(attachments.otherMaterialsText || '')}" placeholder="例如：匯款紀錄、對話紀錄、存證信函、借款證明或其他相關資料">
        </div>
      </fieldset>
    `;
  },

  renderPlaceholder() {
    return `
      <div class="form-panel">
        <h2 class="form-panel__title">表單填寫</h2>
        <div class="form-panel__placeholder">
          <div class="form-panel__placeholder-icon">📝</div>
          <p class="form-panel__placeholder-text">此文件類型尚未開放</p>
          <p class="form-panel__placeholder-hint">請選擇「支付命令聲請狀」</p>
        </div>
      </div>
    `;
  },

  escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  },

  bindEvents() {
    const form = document.getElementById('docForm');
    if (!form) return;

    form.addEventListener('input', (e) => {
      const target = e.target;
      if (!target.name) return;
      if (target.name === 'attachments.otherText') {
        this.handleAttachmentOtherInput(target.value);
        return;
      }
      if (target.name === 'attachments.otherMaterialsText') {
        this.handlePromissoryAttachmentOtherInput(target.value);
        return;
      }
      this.handleInput(target.name, target.value, false);
    });

    form.addEventListener('change', (e) => {
      const target = e.target;
      if (target.dataset?.attachment) {
        this.handleAttachmentToggle(target.dataset.attachment, target.checked);
        return;
      }
      if (target.type === 'checkbox' && target.name) {
        this.handleInput(target.name, target.checked, false);
        return;
      }
      if (!target.name) return;
      const isCaseType = target.name === 'claim.caseType';
      this.handleInput(target.name, target.value, isCaseType);
    });

    form.addEventListener('blur', (e) => {
      const target = e.target;
      if (!target.name) return;
      this.validateSingleField(target.name);
    }, true);
  },

  handleAttachmentToggle(attachmentId, checked) {
    if (!this.formData.attachments) {
      this.formData.attachments = { selectedOrder: [], otherText: '' };
    }

    const order = this.formData.attachments.selectedOrder;

    if (checked) {
      if (!order.includes(attachmentId)) order.push(attachmentId);
    } else {
      this.formData.attachments.selectedOrder = order.filter((id) => id !== attachmentId);
      if (attachmentId === 'other') {
        this.formData.attachments.otherText = '';
      }
      if (attachmentId === 'other_materials') {
        this.formData.attachments.otherMaterialsText = '';
      }
    }

    if (this.currentDoc === 'promissory-note') {
      this.updatePromissoryAttachmentOtherUI();
    } else {
      this.updateAttachmentOtherUI();
    }
    this.saveFormData();
    Preview.update(this.currentDoc, this.formData);
  },

  handleAttachmentOtherInput(value) {
    if (!this.formData.attachments) {
      this.formData.attachments = { selectedOrder: [], otherText: '' };
    }
    this.formData.attachments.otherText = value;
    this.saveFormData();
    Preview.update(this.currentDoc, this.formData);
  },

  handlePromissoryAttachmentOtherInput(value) {
    if (!this.formData.attachments) {
      this.formData.attachments = { selectedOrder: [], otherText: '', otherMaterialsText: '' };
    }
    this.formData.attachments.otherMaterialsText = value;
    this.saveFormData();
    Preview.update(this.currentDoc, this.formData);
  },

  updateAttachmentOtherUI() {
    const otherField = document.querySelector('.form-field--attachment-other');
    const otherInput = document.getElementById('field-attachments-otherText');
    const isOtherChecked = this.formData.attachments?.selectedOrder?.includes('other');

    if (otherField) {
      otherField.style.display = isOtherChecked ? '' : 'none';
    }
    if (!isOtherChecked && otherInput) {
      otherInput.value = '';
      if (this.formData.attachments) this.formData.attachments.otherText = '';
    }
  },

  updatePromissoryAttachmentOtherUI() {
    const otherField = document.querySelector('.form-field--promissory-attachment-other');
    const otherInput = document.getElementById('field-attachments-otherMaterialsText');
    const isOtherChecked = this.formData.attachments?.selectedOrder?.includes('other_materials');

    if (otherField) {
      otherField.style.display = isOtherChecked ? '' : 'none';
    }
    if (!isOtherChecked && otherInput) {
      otherInput.value = '';
      if (this.formData.attachments) {
        this.formData.attachments.otherMaterialsText = '';
      }
    }
  },

  updateIouDeliveryUI() {
    const otherField = document.querySelector('.form-field--iou-method-other');
    const otherInput = document.getElementById('field-delivery-methodOther');
    const isOther = this.formData.delivery?.method === 'other';

    if (otherField) {
      otherField.style.display = isOther ? '' : 'none';
    }
    if (!isOther && otherInput) {
      otherInput.value = '';
      if (this.formData.delivery) {
        this.formData.delivery.methodOther = '';
      }
    }
  },

  handleInput(key, value, applyPreset = false) {
    const childMatch = key.match(/^agreement\.children\.(\d+)\.(name|birthDate|idNumber)$/);
    if (childMatch) {
      const index = Number(childMatch[1]);
      const field = childMatch[2];
      if (!this.formData.agreement) this.formData.agreement = {};
      if (!Array.isArray(this.formData.agreement.children)) {
        this.formData.agreement.children = [];
      }
      while (this.formData.agreement.children.length <= index) {
        this.formData.agreement.children.push({ name: '', birthDate: '', idNumber: '' });
      }
      this.formData.agreement.children[index][field] = value;
      this.saveFormData();
      Preview.update(this.currentDoc, this.formData);
      this.clearFieldError(key);
      return;
    }

    const { prefix, name } = Utils.parseFieldKey(key);
    Utils.setNestedValue(this.formData, prefix, name, value);

    if (this.currentDoc === 'divorce' && (prefix === 'husband' || prefix === 'wife')) {
      this.updateDivorceSignaturePreview();
    }

    if (this.currentDoc === 'divorce' && prefix === 'agreement' && name === 'documentDate') {
      this.updateDivorceSignaturePreview();
    }

    if (name === 'caseType') {
      if (value !== '其他') {
        Utils.setNestedValue(this.formData, prefix, 'caseTypeOther', '');
      }
      if (applyPreset && value && value !== this.lastCaseType) {
        this.applyCaseTypePreset(value);
        this.lastCaseType = value;
      }
      this.updateCaseTypeOtherUI(prefix, value);
    }

    if (prefix === 'delivery' && name === 'method') {
      if (value !== 'other') {
        Utils.setNestedValue(this.formData, 'delivery', 'methodOther', '');
        const methodOtherEl = document.getElementById('field-delivery-methodOther');
        if (methodOtherEl) methodOtherEl.value = '';
      }
      this.updateIouDeliveryUI();
    }

    if (prefix === 'agreement' && name === 'supportStatus' && value === 'no') {
      this.clearDivorceSupportFields();
      document.querySelectorAll('#divorce-support-details input').forEach((el) => {
        el.value = '';
      });
    }

    if (prefix === 'agreement' && name === 'supportPayDay' && value !== 'other') {
      Utils.setNestedValue(this.formData, 'agreement', 'supportPayDayOther', '');
      const el = document.getElementById('field-agreement-supportPayDayOther');
      if (el) el.value = '';
    }

    if (prefix === 'agreement' && name === 'supportPayUntil' && value !== 'other') {
      Utils.setNestedValue(this.formData, 'agreement', 'supportPayUntilOther', '');
      const el = document.getElementById('field-agreement-supportPayUntilOther');
      if (el) el.value = '';
    }

    if (prefix === 'agreement' && name === 'supportPayMethod' && value !== 'other') {
      Utils.setNestedValue(this.formData, 'agreement', 'supportPayMethodOther', '');
      const el = document.getElementById('field-agreement-supportPayMethodOther');
      if (el) el.value = '';
    }

    if (prefix === 'agreement' && name.startsWith('support')) {
      this.updateDivorceSupportUI();
    }

    if (prefix === 'agreement' && name === 'visitationMethod') {
      if (!this.isDivorceFixedVisitation(value)) {
        this.clearDivorceVisitationFixedFields();
        document.querySelectorAll('#divorce-visitation-fixed input[type="text"], #divorce-visitation-fixed input[type="time"], #divorce-visitation-fixed select').forEach((el) => {
          el.value = '';
        });
        document.querySelectorAll('#divorce-visitation-fixed input[type="radio"]').forEach((el) => {
          el.checked = false;
        });
      }
      if (value !== 'custom') {
        this.clearDivorceVisitationCustomField();
        const customEl = document.getElementById('field-agreement-visitationCustomText');
        if (customEl) customEl.value = '';
      }
    }

    if (prefix === 'agreement' && name === 'visitationPickup' && value !== 'other') {
      Utils.setNestedValue(this.formData, 'agreement', 'visitationPickupOther', '');
      const el = document.getElementById('field-agreement-visitationPickupOther');
      if (el) el.value = '';
    }

    if (prefix === 'agreement' && name.startsWith('visitation')) {
      this.updateDivorceVisitationUI();
    }

    if (prefix === 'agreement' && name === 'hasMinorChildren' && value !== 'yes') {
      this.clearDivorceChildrenFields();
      Utils.setNestedValue(this.formData, 'agreement', 'custodyType', '');
      this.clearDivorceOtherTextField('custodyOtherText');
      document.querySelectorAll('#divorce-custody-section input[type="radio"]').forEach((el) => {
        el.checked = false;
      });
      this.updateDivorceChildrenUI();
      this.updateDivorceCustodyUI();
    }

    if (prefix === 'agreement' && name === 'hasMinorChildren' && value === 'yes') {
      if (!this.formData.agreement.minorChildrenCount) {
        Utils.setNestedValue(this.formData, 'agreement', 'minorChildrenCount', '1');
      }
      this.syncChildrenArray(Number(this.formData.agreement.minorChildrenCount) || 1);
      this.rerenderChildrenList();
    }

    if (prefix === 'agreement' && name === 'minorChildrenCount') {
      this.syncChildrenArray(Number(value));
      this.rerenderChildrenList();
    }

    if (prefix === 'agreement' && name === 'hasMinorChildren') {
      this.updateDivorceChildrenUI();
    }

    if (prefix === 'agreement' && name === 'custodyType' && value !== 'other') {
      this.clearDivorceOtherTextField('custodyOtherText');
    }

    if (prefix === 'agreement' && name === 'propertyType' && value !== 'other') {
      this.clearDivorceOtherTextField('propertyOtherText');
    }

    if (prefix === 'agreement' && name === 'jointDebtType' && value !== 'other') {
      this.clearDivorceOtherTextField('jointDebtOtherText');
    }

    if (prefix === 'agreement' && name === 'custodyType') {
      this.updateDivorceCustodyUI();
    }

    if (prefix === 'agreement' && name === 'propertyType') {
      this.updateDivorcePropertyUI();
    }

    if (prefix === 'agreement' && name === 'jointDebtType') {
      this.updateDivorceJointDebtUI();
    }

    this.saveFormData();
    Preview.update(this.currentDoc, this.formData);
    this.clearFieldError(key);
  },

  updateCaseTypeOtherUI(prefix, caseType) {
    const container = document.querySelector(`[data-field="${prefix}.caseType"]`);
    if (!container) return;

    const existing = container.querySelector(`[data-field="${prefix}.caseTypeOther"]`);
    if (caseType === '其他') {
      if (!existing) {
        const wrapper = document.createElement('div');
        wrapper.innerHTML = this.renderCaseTypeOther(prefix, '其他');
        const otherField = wrapper.firstElementChild;
        const errorEl = container.querySelector('.form-field__error');
        if (errorEl) container.insertBefore(otherField, errorEl);
        else container.appendChild(otherField);
      }
    } else if (existing) {
      existing.remove();
    }
  },

  applyCaseTypePreset(caseType) {
    const preset = CaseTypePresets[caseType];
    if (!preset) return;

    this.formData.claim.interestRate = String(preset.rate);
    this.formData.claim.reason = this.buildReasonFromTemplate(preset.reason);

    const rateEl = document.getElementById('field-claim-interestRate');
    const reasonEl = document.getElementById('field-claim-reason');
    if (rateEl) rateEl.value = this.formData.claim.interestRate;
    if (reasonEl) reasonEl.value = this.formData.claim.reason;
  },

  buildReasonFromTemplate(template) {
    const creditor = this.formData.creditor?.name?.trim() || '○○○';
    const debtor = this.formData.debtor?.name?.trim() || '○○○';
    return template
      .replace(/\{creditor\}/g, creditor)
      .replace(/\{debtor\}/g, debtor);
  },

  getFieldConfig(prefix, name) {
    const step = this.getStepConfig(1);
    if (!step) return null;
    for (const section of step.sections) {
      if (section.prefix === prefix) {
        const field = section.fields.find((f) => f.name === name);
        if (field) return field;
      }
    }
    return null;
  },

  validateSingleField(key) {
    const { prefix, name } = Utils.parseFieldKey(key);
    const value = Utils.getNestedValue(this.formData, prefix, name);

    if (name === 'caseTypeOther') {
      if (this.formData.claim?.caseType !== '其他') return;
      const error = Validator.rules.caseTypeOther(value);
      if (error) this.showErrors({ [key]: error });
      else this.clearFieldError(key);
      return;
    }

    if (name === 'methodOther') {
      if (this.formData.delivery?.method !== 'other') return;
      const error = Validator.rules.methodOther(value);
      if (error) this.showErrors({ [key]: error });
      else this.clearFieldError(key);
      return;
    }

    const field = this.getFieldConfig(prefix, name);
    if (!field) return;

    const error = Validator.validateFieldConfig(field, value);
    if (error) {
      this.showErrors({ [key]: error });
    } else {
      this.clearFieldError(key);
    }
  },

  showErrors(errors) {
    Object.entries(errors).forEach(([key, message]) => {
      const fieldEl = document.querySelector(`[data-field="${key}"]`);
      const errorEl = document.getElementById(`error-${key}`);
      if (fieldEl) fieldEl.classList.add('form-field--error');
      if (errorEl) errorEl.textContent = message;
    });
  },

  clearFieldError(key) {
    const fieldEl = document.querySelector(`[data-field="${key}"]`);
    const errorEl = document.getElementById(`error-${key}`);
    if (fieldEl) fieldEl.classList.remove('form-field--error');
    if (errorEl) errorEl.textContent = '';
  }
};
window.Forms = Forms;