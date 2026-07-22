<div class="doc-preview">

  <h1 class="doc-preview__title">
    離婚協議書
  </h1>
  <div class="doc-preview__block">
  <p class="doc-preview__line">
    立協議書人：
  </p>

  <p class="doc-preview__line">
    男方：${husband.name}
  </p>

  <p class="doc-preview__line">
    女方：${wife.name}
  </p>

  <br>

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
    ${data.childrenAgreement || '雙方約定如本協議書所載。'}
  </p>

</div>
<div class="doc-preview__block">

  <p class="doc-preview__heading">
    第三條　扶養費
  </p>

  <p class="doc-preview__paragraph">
    ${data.supportAgreement || '雙方約定如本協議書所載。'}
  </p>

</div>
<div class="doc-preview__block">

  <p class="doc-preview__heading">
    第四條　夫妻剩餘財產
  </p>

  <p class="doc-preview__paragraph">
    ${data.propertyAgreement || '雙方就夫妻剩餘財產及其他財產權利義務均已協議完畢，日後不得再向他方主張。'}
  </p>

</div>
<div class="doc-preview__block">

  <p class="doc-preview__heading">
    第五條　其他約定
  </p>

  <p class="doc-preview__paragraph">
    ${data.otherAgreement || '雙方確認已詳閱本協議內容，並願共同遵守。'}
  </p>

</div>
<div class="doc-preview__footer">

  <p class="doc-preview__line doc-preview__salutation">
    立協議書人
  </p>

  <br>

  <p class="doc-preview__line">
    男方：________________________
  </p>

  <br>

  <p class="doc-preview__line">
    女方：________________________
  </p>

  <br><br>

  ${PaymentOrderTemplate.renderDocumentDate()}

</div>