/**
 * LocalStorage 資料持久化
 */
const Storage = {
  PREFIX: 'simaLawyer_',

  getKey(docType) {
    return `${this.PREFIX}${docType}`;
  },

  load(docType) {
    try {
      const raw = localStorage.getItem(this.getKey(docType));
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  save(docType, data) {
    try {
      const payload = {
        ...data,
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem(this.getKey(docType), JSON.stringify(payload));
    } catch (err) {
      console.warn('無法儲存至 LocalStorage', err);
    }
  },

  loadWizardStep(docType) {
    const data = this.load(docType);
    return data?.wizardStep ?? 1;
  },

  saveWizardStep(docType, step) {
    const existing = this.load(docType) || {};
    this.save(docType, { ...existing, wizardStep: step });
  }
};
