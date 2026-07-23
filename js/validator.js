/**
 * 表單欄位驗證
 */
const Validator = {
  rules: {
    name(value) {
      if (!value || !String(value).trim()) return '請輸入姓名';
      if (String(value).trim().length < 2) return '姓名至少 2 個字';
      return '';
    },

    idNumber(value) {
      if (!value || !String(value).trim()) return '';
      const pattern = /^[A-Za-z][12]\d{8}$/;
      if (!pattern.test(String(value).trim().toUpperCase())) {
        return '身分證格式不正確';
      }
      return '';
    },

    address(value) {
      if (!value || !String(value).trim()) return '請輸入地址';
      if (String(value).trim().length < 5) return '地址至少 5 個字';
      return '';
    },

    phone(value) {
      if (!value || !String(value).trim()) return '請輸入電話';
      const cleaned = String(value).replace(/[\s-]/g, '');
      const pattern = /^(\+886|0)?9\d{8}$|^0\d{1,2}\d{6,8}$/;
      if (!pattern.test(cleaned)) return '電話格式不正確';
      return '';
    },

    caseType(value) {
      if (!value) return '請選擇案件類型';
      return '';
    },

    amount(value) {
      if (value === '' || value === null || value === undefined) return '請輸入請求金額';
      if (!/^\d+(\.\d+)?$/.test(String(value))) return '金額只能輸入數字';
      const num = Number(value);
      if (Number.isNaN(num) || num <= 0) return '金額須為大於 0 的數字';
      return '';
    },

    interestRate(value) {
      if (value === '' || value === null || value === undefined) return '';
      if (!/^\d+(\.\d+)?$/.test(String(value))) return '利率只能輸入數字';
      const num = Number(value);
      if (Number.isNaN(num) || num < 0 || num > 100) return '利率須為 0–100 之間的數字';
      return '';
    },

    interestStartDate(value) {
      if (!value) return '請選擇利息起算日';
      const d = new Date(value);
      if (Number.isNaN(d.getTime())) return '日期格式不正確';
      return '';
    },

    reason(value) {
      if (!value || !String(value).trim()) return '請輸入聲請理由';
      if (String(value).trim().length < 10) return '聲請理由至少 10 個字';
      return '';
    },

    court(value) {
      if (!value || !String(value).trim()) return '請輸入法院';
      return '';
    },

    caseTypeOther(value) {
      if (!value || !String(value).trim()) return '請輸入案件類型說明';
      if (String(value).trim().length < 2) return '說明至少 2 個字';
      return '';
    },

    loanDate(value) {
      if (!value) return '請選擇借款日期';
      const d = new Date(`${value}T00:00:00`);
      if (Number.isNaN(d.getTime())) return '日期格式不正確';
      return '';
    },

    dueDate(value) {
      if (!value) return '請選擇還款期限';
      const d = new Date(`${value}T00:00:00`);
      if (Number.isNaN(d.getTime())) return '日期格式不正確';
      return '';
    },

    signDate(value) {
      if (!value) return '請選擇簽署日期';
      const d = new Date(`${value}T00:00:00`);
      if (Number.isNaN(d.getTime())) return '日期格式不正確';
      return '';
    },

    method(value) {
      if (!value) return '請選擇交付方式';
      return '';
    },

    methodOther(value) {
      if (!value || !String(value).trim()) return '請輸入其他交付方式';
      if (String(value).trim().length < 2) return '說明至少 2 個字';
      return '';
    },

    defaultInterestRate(value) {
      if (value === '' || value === null || value === undefined) return '';
      if (!/^\d+(\.\d+)?$/.test(String(value))) return '違約利息只能輸入數字';
      const num = Number(value);
      if (Number.isNaN(num) || num < 0 || num > 100) return '違約利息須為 0–100 之間的數字';
      return '';
    }
  },

  validateField(name, value) {
    if (name === 'birthDate') return '';
    const rule = this.rules[name];
    if (!rule) return '';
    return rule(value);
  },

  validateFieldConfig(field, value) {
    if (field.name === 'birthDate') return '';
    if (field.required) return this.validateField(field.name, value);

    const empty = value === '' || value === null || value === undefined
      || (typeof value === 'string' && !value.trim());
    if (empty) return '';

    return this.validateField(field.name, value);
  },

  validateStep(formConfig, stepId, formData) {
    const step = formConfig.steps.find((s) => s.id === stepId);
    if (!step) return { valid: true, errors: {} };

    const errors = {};

    step.sections.forEach((section) => {
      section.fields.forEach((field) => {
        const value = Utils.getNestedValue(formData, section.prefix, field.name);
        const error = this.validateFieldConfig(field, value);
        if (error) {
          errors[Utils.getFieldKey(section.prefix, field.name)] = error;
        }
      });
    });

    const claim = formData.claim || {};
    if (claim.caseType === '其他') {
      const otherError = this.rules.caseTypeOther(claim.caseTypeOther);
      if (otherError) errors['claim.caseTypeOther'] = otherError;
    }

    const delivery = formData.delivery || {};
    if (delivery.method === 'other') {
      const methodOtherError = this.rules.methodOther(delivery.methodOther);
      if (methodOtherError) errors['delivery.methodOther'] = methodOtherError;
    }

    return {
      valid: Object.keys(errors).length === 0,
      errors
    };
  }
};
