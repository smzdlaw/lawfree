/**
 * 離婚協議書預覽模板
 */
const DivorceTemplate = {
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
  
            <p class="doc-preview__paragraph">
              ${
                agreement.childrenAgreement
                  ? this.escapeHtml(agreement.childrenAgreement)
                  : '雙方約定如本協議書所載。'
              }
            </p>
          </div>
  
          <div class="doc-preview__block">
            <p class="doc-preview__heading">
              第三條　扶養費
            </p>
  
            <p class="doc-preview__paragraph">
              ${
                agreement.supportAgreement
                  ? this.escapeHtml(agreement.supportAgreement)
                  : '雙方約定如本協議書所載。'
              }
            </p>
          </div>
  
          <div class="doc-preview__block">
            <p class="doc-preview__heading">
              第四條　夫妻剩餘財產
            </p>
  <p class="doc-preview__paragraph">
  ${
    agreement.propertyChoice === 'mutual-waiver'
      ? '雙方同意婚姻關係存續期間各自取得之財產均歸各自所有，並互相拋棄依民法第一千零三十條之一規定所得主張之夫妻剩餘財產分配請求權，日後均不得再向他方主張。'
      : agreement.propertyChoice === 'completed'
        ? '雙方確認婚姻關係存續期間之財產均已自行分配完畢，對於財產歸屬及夫妻剩餘財產分配均無爭議，日後不得再向他方主張。'
        : agreement.propertyChoice === 'custom' &&
          agreement.propertyAgreement
          ? this.escapeHtml(agreement.propertyAgreement)
          : '雙方尚未選擇夫妻財產及剩餘財產分配方式。'
  }
</p>
          </div>
  
          <div class="doc-preview__block">
            <p class="doc-preview__heading">
              第五條　其他約定
            </p>
  
            <p class="doc-preview__paragraph">
              ${
                agreement.otherAgreement
                  ? this.escapeHtml(agreement.otherAgreement)
                  : '雙方確認已詳閱本協議內容，並願共同遵守。'
              }
            </p>
          </div>
  
          <div class="doc-preview__block">
            <p class="doc-preview__heading">
              第六條　證人
            </p>
  
            <p class="doc-preview__paragraph">
              雙方應依民法規定，由二位證人在本協議書上簽名，以完成離婚程序。
            </p>
          </div>
  
          <div class="doc-preview__footer">
            <p class="doc-preview__line">
              立協議書人
            </p>
  
            <p class="doc-preview__line">
              男方：${this.val(husband.name)}
            </p>
  
            <p class="doc-preview__line">
              女方：${this.val(wife.name)}
            </p>
  
            <br>
  
            <p class="doc-preview__line">
              證人一：____________________
            </p>
  
            <p class="doc-preview__line">
              證人二：____________________
            </p>
  
            ${
              window.PaymentOrderTemplate?.renderDocumentDate?.(
                agreement.documentDate
              ) || ''
            }
          </div>
  
        </div>
      `;
    }
  };
  
  window.DivorceTemplate = DivorceTemplate;