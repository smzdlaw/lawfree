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
    this.formData = saved?.formData || { creditor: {}, debtor: {}, claim: {}, attachments: { selectedOrder: [], otherText: '' } };
    if (!this.formData.attachments) {
      this.formData.attachments = { selectedOrder: [], otherText: '' };
    }
    if (!Array.isArray(this.formData.attachments.selectedOrder)) {
      this.formData.attachments.selectedOrder = [];
    }
    this.currentStep = 1;
    this.lastCaseType = this.formData.claim?.caseType || '';
    this.render();
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
        </form>
      </div>
    `;

    this.bindEvents();
    Preview.update(this.currentDoc, this.formData);
  },

  renderSection(section) {
    return `
      <fieldset class="form-section">
        <legend class="form-section__title">${section.title}</legend>
        <div class="form-section__fields">
          ${section.fields.map((field) => this.renderField(section.prefix, field)).join('')}
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

    if (field.type === 'textarea') {
      inputHtml = `<textarea class="form-field__input form-field__textarea" id="${id}" name="${key}" rows="5" placeholder="${this.escapeHtml(placeholder)}">${this.escapeHtml(value)}</textarea>`;
    } else if (field.type === 'select') {
      const options = (field.options || [])
        .map((opt) => `<option value="${this.escapeHtml(opt.value)}" ${opt.value === value ? 'selected' : ''}>${this.escapeHtml(opt.label)}</option>`)
        .join('');
      inputHtml = `<select class="form-field__input form-field__select" id="${id}" name="${key}">${options}</select>`;
    } else if (field.type === 'number') {
      inputHtml = `<input class="form-field__input" type="number" id="${id}" name="${key}" value="${this.escapeHtml(value)}" min="0" step="any" inputmode="decimal" placeholder="${this.escapeHtml(placeholder)}">`;
    } else {
      inputHtml = `<input class="form-field__input" type="${field.type}" id="${id}" name="${key}" value="${this.escapeHtml(value)}" placeholder="${this.escapeHtml(placeholder)}">`;
    }

    const otherHtml = field.name === 'caseType' ? this.renderCaseTypeOther(prefix, value) : '';

    return `
      <div class="form-field" data-field="${key}">
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
      this.handleInput(target.name, target.value, false);
    });

    form.addEventListener('change', (e) => {
      const target = e.target;
      if (target.dataset?.attachment) {
        this.handleAttachmentToggle(target.dataset.attachment, target.checked);
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
    }

    this.updateAttachmentOtherUI();
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

  handleInput(key, value, applyPreset = false) {
    const { prefix, name } = Utils.parseFieldKey(key);
    Utils.setNestedValue(this.formData, prefix, name, value);

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