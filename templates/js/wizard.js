/**
 * Wizard 步驟控制
 */
const Wizard = {
  currentStep: 1,

  init(step) {
    this.currentStep = step || 1;
    this.updateUI();
    this.bindEvents();
  },

  goTo(step) {
    this.currentStep = step;
    this.updateUI();
  },

  updateUI() {
    const steps = document.querySelectorAll('.wizard__step');
    const connectors = document.querySelectorAll('.wizard__connector');

    steps.forEach((el) => {
      const stepNum = Number(el.dataset.step);
      el.classList.remove('active', 'completed');

      if (stepNum === this.currentStep) {
        el.classList.add('active');
      } else if (stepNum < this.currentStep) {
        el.classList.add('completed');
      }
    });

    connectors.forEach((el, index) => {
      el.classList.toggle('completed', index < this.currentStep - 1);
    });
  },

  bindEvents() {
    document.querySelectorAll('.wizard__step').forEach((el) => {
      el.addEventListener('click', () => {
        const step = Number(el.dataset.step);
        if (step === 1) {
          Wizard.goTo(1);
          Forms.currentStep = 1;
          Forms.render();
        }
      });
    });
  }
};
