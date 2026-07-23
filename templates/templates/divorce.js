/**
 * 離婚協議書預覽模板
 */
const DivorceTemplate = {
    PREVIEW_LABELS: {
      name: '姓\u3000\u3000名',
      idNumber: '身分證字號',
      phone: '聯絡電話',
      address: '聯繫地址',
      birthDate: '出生日期',
      witness1: '證\u3000人\u3000一',
      witness2: '證\u3000人\u3000二'
    },

    escapeHtml(value) {
      return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    },
  
    val(value, fallback = '________________') {
      return value && String(value).trim()
        ? this.escapeHtml(String(value).trim())
        : fallback;
    },

    formatAmount(amount) {
      if (amount === '' || amount === null || amount === undefined) {
        return '________________';
      }
      const num = Number(amount);
      if (Number.isNaN(num)) {
        return this.escapeHtml(String(amount).trim());
      }
      return num.toLocaleString('zh-TW');
    },

    getSupportPayDayLabel(agreement) {
      const map = {
        day5: '每月5日',
        day10: '每月10日',
        day15: '每月15日',
        day20: '每月20日',
        day25: '每月25日',
        month_end: '每月底'
      };

      if (agreement.supportPayDay === 'other') {
        return agreement.supportPayDayOther?.trim()
          ? this.escapeHtml(agreement.supportPayDayOther.trim())
          : '________';
      }

      return map[agreement.supportPayDay] || '________';
    },

    getSupportPayUntilLabel(agreement) {
      const map = {
        age18: '子女滿18歲',
        age20: '子女滿20歲',
        college: '子女大學畢業'
      };

      if (agreement.supportPayUntil === 'other') {
        return agreement.supportPayUntilOther?.trim()
          ? this.escapeHtml(agreement.supportPayUntilOther.trim())
          : '________';
      }

      return map[agreement.supportPayUntil] || '________';
    },

    getSupportPayMethodLabel(agreement) {
      const map = {
        cash: '現金',
        transfer: '匯款'
      };

      if (agreement.supportPayMethod === 'other') {
        return agreement.supportPayMethodOther?.trim()
          ? this.escapeHtml(agreement.supportPayMethodOther.trim())
          : '________';
      }

      return map[agreement.supportPayMethod] || '________';
    },

    renderSupportAgreement(agreement = {}) {
      const status = agreement.supportStatus || 'no';

      if (status !== 'yes') {
        return '雙方確認無扶養費約定。';
      }

      const amount = this.formatAmount(agreement.supportAmount);
      const payDay = this.getSupportPayDayLabel(agreement);
      const payUntil = this.getSupportPayUntilLabel(agreement);
      const payMethod = this.getSupportPayMethodLabel(agreement);

      let text = `雙方約定，扶養義務人應給付未成年子女扶養費每月新臺幣${amount}元，於${payDay}給付，給付至${payUntil}為止，以${payMethod}方式給付。`;

      if (agreement.supportPayMethod === 'transfer') {
        const bank = agreement.supportBankName?.trim()
          ? this.escapeHtml(agreement.supportBankName.trim())
          : '________';
        const branch = agreement.supportBankBranch?.trim()
          ? this.escapeHtml(agreement.supportBankBranch.trim())
          : '________';
        const accountName = agreement.supportAccountName?.trim()
          ? this.escapeHtml(agreement.supportAccountName.trim())
          : '________';
        const accountNumber = agreement.supportAccountNumber?.trim()
          ? this.escapeHtml(agreement.supportAccountNumber.trim())
          : '________';

        text += `匯款資訊如下：${bank}${branch}，戶名${accountName}，帳號${accountNumber}。`;
      }

      return text;
    },

    getVisitationWeekdayLabel(weekday) {
      const map = {
        mon: '星期一',
        tue: '星期二',
        wed: '星期三',
        thu: '星期四',
        fri: '星期五',
        sat: '星期六',
        sun: '星期日'
      };

      return map[weekday] || '________';
    },

    formatVisitationTime(time) {
      if (!time || !String(time).trim()) {
        return '________';
      }
      return this.escapeHtml(String(time).trim());
    },

    getVisitationPickupLabel(agreement) {
      const map = {
        husband: '由男方負責接送',
        wife: '由女方負責接送',
        mutual: '由雙方自行約定接送'
      };

      if (agreement.visitationPickup === 'other') {
        return agreement.visitationPickupOther?.trim()
          ? this.escapeHtml(agreement.visitationPickupOther.trim())
          : '________';
      }

      return map[agreement.visitationPickup] || '________';
    },

    renderVisitationAgreement(agreement = {}) {
      const method = agreement.visitationMethod || '';

      if (method === 'mutual') {
        return '雙方就未成年子女之探視及會面交往，同意自行協議，不另為約定。';
      }

      if (method === 'custom') {
        return agreement.visitationCustomText?.trim()
          ? this.escapeHtml(agreement.visitationCustomText.trim())
          : '請填寫探視及會面交往約定內容。';
      }

      if (method === 'weekly' || method === 'biweekly' || method === 'monthly') {
        const frequencyMap = {
          weekly: '每週',
          biweekly: '隔週',
          monthly: '每月'
        };
        const weekday = this.getVisitationWeekdayLabel(agreement.visitationWeekday);
        const startTime = this.formatVisitationTime(agreement.visitationStartTime);
        const endTime = this.formatVisitationTime(agreement.visitationEndTime);
        const pickup = this.getVisitationPickupLabel(agreement);

        return `雙方約定，非行使親權之一方${frequencyMap[method]}於${weekday}${startTime}至${endTime}探視未成年子女，${pickup}。`;
      }

      return '請選擇探視及會面交往之約定方式。';
    },

    renderCustodyAgreement(agreement = {}) {
      const type = agreement.custodyType || '';

      if (type === 'husband') {
        return '雙方約定，未成年子女之親權由男方單獨行使、負擔。';
      }

      if (type === 'wife') {
        return '雙方約定，未成年子女之親權由女方單獨行使、負擔。';
      }

      if (type === 'joint') {
        return '雙方約定，未成年子女之親權由雙方共同行使、負擔。';
      }

      if (type === 'other') {
        return agreement.custodyOtherText?.trim()
          ? this.escapeHtml(agreement.custodyOtherText.trim())
          : '請填寫親權行使及負擔之約定內容。';
      }

      return '請選擇親權行使及負擔方式。';
    },

    renderFieldLabel(text) {
      return `<span class="doc-preview__field-label">${text}：</span>`;
    },

    renderFieldValue(value = '') {
      const displayValue = value && String(value).trim()
        ? this.escapeHtml(String(value).trim())
        : '';
      return `<span class="doc-preview__field-value">${displayValue}</span>`;
    },

    renderChildFieldRow(label, value = '') {
      return `
        <div class="doc-preview__field-row">
          ${this.renderFieldLabel(label)}
          ${this.renderFieldValue(value)}
        </div>
      `;
    },

    renderMinorChildrenList(agreement = {}) {
      const children = Array.isArray(agreement.children) ? agreement.children : [];
      const count = Number(agreement.minorChildrenCount) || children.length;

      if (!count) {
        return `
          <div class="doc-preview__children-block">
            <p class="doc-preview__line">未成年子女：請填寫子女資料。</p>
          </div>
        `;
      }

      const items = Array.from({ length: count }, (_, index) => {
        const child = children[index] || {};
        const label = ['一', '二', '三', '四', '五'][index] || String(index + 1);

        return `
          <div class="doc-preview__child-item">
            <p class="doc-preview__line doc-preview__child-index">${label}、</p>
            ${this.renderChildFieldRow(this.PREVIEW_LABELS.name, child.name)}
            <div class="doc-preview__field-row">
              ${this.renderFieldLabel(this.PREVIEW_LABELS.birthDate)}
              <span class="doc-preview__field-value">${this.formatChildBirthDate(child.birthDate)}</span>
            </div>
            ${this.renderChildFieldRow(this.PREVIEW_LABELS.idNumber, child.idNumber)}
          </div>
        `;
      }).join('');

      return `
        <div class="doc-preview__children-block">
          <p class="doc-preview__line">未成年子女：</p>
          ${items}
        </div>
      `;
    },

    formatChildBirthDate(value) {
      if (!value || !String(value).trim()) {
        return '';
      }

      const text = String(value).trim();
      const match = text.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);

      if (match) {
        const rocYear = Number(match[1]) - 1911;
        const month = Number(match[2]);
        const day = Number(match[3]);
        return this.escapeHtml(`${rocYear}年${month}月${day}日`);
      }

      return this.escapeHtml(text);
    },

    renderMinorChildrenArticle(agreement = {}) {
      if (agreement.hasMinorChildren === 'no') {
        return '雙方確認無未成年子女，故無親權、扶養、探視等相關約定。';
      }

      if (agreement.hasMinorChildren !== 'yes') {
        return '請選擇是否有未成年子女。';
      }

      return `
        ${this.renderMinorChildrenList(agreement)}
        <p class="doc-preview__line doc-preview__custody-line">${this.renderCustodyAgreement(agreement)}</p>
      `;
    },

    renderPropertyAgreement(agreement = {}) {
      const type = agreement.propertyType || '';

      if (type === 'separate') {
        return '雙方約定，雙方名下財產各自所有，互不請求剩餘財產分配。';
      }

      if (type === 'settled') {
        return '雙方約定，雙方已自行完成財產分配，日後互不爭執。';
      }

      if (type === 'other') {
        return agreement.propertyOtherText?.trim()
          ? this.escapeHtml(agreement.propertyOtherText.trim())
          : '請填寫夫妻財產及剩餘財產分配之約定內容。';
      }

      if (agreement.propertyAgreement?.trim()) {
        return this.escapeHtml(agreement.propertyAgreement.trim());
      }

      return '請選擇夫妻財產及剩餘財產分配方式。';
    },

    renderJointDebtAgreement(agreement = {}) {
      const type = agreement.jointDebtType || '';

      if (type === 'none') {
        return '雙方確認無共同債務。';
      }

      if (type === 'settled') {
        return '雙方約定，雙方已協議共同債務清償方式。';
      }

      if (type === 'other') {
        return agreement.jointDebtOtherText?.trim()
          ? this.escapeHtml(agreement.jointDebtOtherText.trim())
          : '請填寫共同債務之約定內容。';
      }

      return '請選擇共同債務約定方式。';
    },

    renderArticle7OtherAgreement() {
      return `
        <div class="doc-preview__block">
          <p class="doc-preview__heading">
            第七條　其他約定事項
          </p>
          <p class="doc-preview__paragraph">
            本協議書經雙方詳閱後，確認內容無誤，並同意遵守本協議書所載各項約定。
          </p>
        </div>
      `;
    },

    renderArticle8Witness() {
      return `
        <div class="doc-preview__block">
          <p class="doc-preview__heading">
            第八條　證人
          </p>
          <p class="doc-preview__paragraph">
            雙方應依民法規定，由二位證人在本協議書上簽名，以完成離婚程序。
          </p>
        </div>
      `;
    },

    renderArticle9CopiesEffectiveness() {
      return `
        <div class="doc-preview__block">
          <p class="doc-preview__heading">
            第九條　協議書份數及效力
          </p>
          <p class="doc-preview__paragraph">
            本協議書一式三份，由甲、乙雙方各執一份，另一份供辦理離婚登記之戶政事務所留存，各份均具有同等法律效力。
          </p>
        </div>
      `;
    },

    renderPartySignatureBlock(title, party = {}) {
      const L = this.PREVIEW_LABELS;

      return `
        <div class="doc-preview__signature-divider"></div>
        <div class="doc-preview__signature-party">
          <p class="doc-preview__line doc-preview__signature-party-title">${title}：</p>
          <div class="doc-preview__field-row doc-preview__signature-name-row">
            ${this.renderFieldLabel(L.name)}
            ${this.renderFieldValue(party.name)}
            <span class="doc-preview__signature-mark">（簽名或蓋章）</span>
          </div>
          <div class="doc-preview__field-row">
            ${this.renderFieldLabel(L.idNumber)}
            ${this.renderFieldValue(party.idNumber)}
          </div>
          <div class="doc-preview__field-row">
            ${this.renderFieldLabel(L.phone)}
            ${this.renderFieldValue(party.phone)}
          </div>
          <div class="doc-preview__field-row">
            ${this.renderFieldLabel(L.address)}
            ${this.renderFieldValue(party.address)}
          </div>
        </div>
      `;
    },

    renderWitnessInline(label) {
      return `
        <div class="doc-preview__witness-row">
          ${this.renderFieldLabel(label)}
          <span class="doc-preview__signature-mark">（簽名或蓋章）</span>
        </div>
      `;
    },

    renderSignatureSection(agreement = {}, husband = {}, wife = {}) {
      return `
        ${this.renderPartySignatureBlock('甲方', husband)}
        ${this.renderPartySignatureBlock('乙方', wife)}
        <div class="doc-preview__signature-divider"></div>
        <div class="doc-preview__witness-block">
          ${this.renderWitnessInline(this.PREVIEW_LABELS.witness1)}
          ${this.renderWitnessInline(this.PREVIEW_LABELS.witness2)}
        </div>
        ${LegalDocumentLayout.renderDocumentDate(agreement.documentDate, { wrapper: 'signature' })}
      `;
    },

    render(data = {}) {
      const husband = data.husband || {};
      const wife = data.wife || {};
      const agreement = data.agreement || {};
  
      return `
        <div class="doc-preview">
  
          <h1 class="doc-preview__title">
            離婚協議書
          </h1>
  
          <div class="doc-preview__block">
            <p class="doc-preview__line">
              立協議書人：
            </p>
  
            <p class="doc-preview__line">
              男方：${this.val(husband.name)}
            </p>
  
            ${
              husband.idNumber
                ? `
                  <p class="doc-preview__line">
                    身分證字號：${this.escapeHtml(husband.idNumber)}
                  </p>
                `
                : ''
            }
  
            ${
              husband.address
                ? `
                  <p class="doc-preview__line">
                    地址：${this.escapeHtml(husband.address)}
                  </p>
                `
                : ''
            }
  
            <p class="doc-preview__line">
              女方：${this.val(wife.name)}
            </p>
  
            ${
              wife.idNumber
                ? `
                  <p class="doc-preview__line">
                    身分證字號：${this.escapeHtml(wife.idNumber)}
                  </p>
                `
                : ''
            }
  
            ${
              wife.address
                ? `
                  <p class="doc-preview__line">
                    地址：${this.escapeHtml(wife.address)}
                  </p>
                `
                : ''
            }
  
            <p class="doc-preview__paragraph">
              雙方因婚姻關係無法繼續維持，經充分協議後，合意離婚，並就相關權利義務約定如下：
            </p>
          </div>
  
          <div class="doc-preview__block">
            <p class="doc-preview__heading">
              第一條　離婚合意
            </p>
  
            <p class="doc-preview__paragraph">
              雙方同意終止婚姻關係，並依民法相關規定共同辦理離婚登記。
            </p>
          </div>
  
          <div class="doc-preview__block">
            <p class="doc-preview__heading">
              第二條　未成年子女
            </p>
  
            <div class="doc-preview__paragraph doc-preview__minor-children-article">
              ${this.renderMinorChildrenArticle(agreement)}
            </div>
          </div>
  
          <div class="doc-preview__block">
            <p class="doc-preview__heading">
              第三條　扶養費
            </p>

            <p class="doc-preview__paragraph">
              ${this.renderSupportAgreement(agreement)}
            </p>
          </div>
  
          <div class="doc-preview__block">
            <p class="doc-preview__heading">
              第四條　探視及會面交往
            </p>

            <p class="doc-preview__paragraph">
              ${this.renderVisitationAgreement(agreement)}
            </p>
          </div>

          <div class="doc-preview__block">
            <p class="doc-preview__heading">
              第五條　夫妻財產及剩餘財產分配
            </p>
  
            <p class="doc-preview__paragraph">
              ${this.renderPropertyAgreement(agreement)}
            </p>
          </div>
  
          <div class="doc-preview__block">
            <p class="doc-preview__heading">
              第六條　共同債務
            </p>
  
            <p class="doc-preview__paragraph">
              ${this.renderJointDebtAgreement(agreement)}
            </p>
          </div>
  
          ${this.renderArticle7OtherAgreement()}
          ${this.renderArticle8Witness()}
          ${this.renderArticle9CopiesEffectiveness()}

          <div class="doc-preview__footer">
            ${this.renderSignatureSection(agreement, husband, wife)}
          </div>
  
        </div>
      `;
    }
  };
  
  window.DivorceTemplate = DivorceTemplate;