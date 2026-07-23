/**
 * 工具函式
 */
const Utils = {
  debounce(fn, delay = 300) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  },

  getFieldKey(prefix, name) {
    return `${prefix}.${name}`;
  },

  parseFieldKey(key) {
    const [prefix, name] = key.split('.');
    return { prefix, name };
  },

  setNestedValue(obj, prefix, name, value) {
    if (!obj[prefix]) obj[prefix] = {};
    obj[prefix][name] = value;
    return obj;
  },

  getNestedValue(obj, prefix, name) {
    return obj?.[prefix]?.[name] ?? '';
  },

  /**
   * 阿拉伯數字金額轉國字大寫（例：100000 → 壹拾萬元整）
   */
  amountToChinese(amount) {
    if (amount === '' || amount === null || amount === undefined) return '';

    const num = Math.floor(Number(amount));
    if (!Number.isFinite(num) || num < 0) return '';
    if (num === 0) return '零元整';

    const CN_NUM = ['零', '壹', '貳', '叄', '肆', '伍', '陸', '柒', '捌', '玖'];
    const CN_UNIT = ['', '拾', '佰', '仟'];
    const CN_BIG = ['', '萬', '億', '兆'];

    const sectionToChinese = (section) => {
      let str = '';
      let zero = false;

      for (let i = 0; i < 4; i += 1) {
        const digit = section % 10;
        if (digit === 0) {
          if (str) zero = true;
        } else {
          if (zero) {
            str = `零${str}`;
            zero = false;
          }
          str = `${CN_NUM[digit]}${CN_UNIT[i]}${str}`;
        }
        section = Math.floor(section / 10);
      }

      return str;
    };

    let result = '';
    let bigIndex = 0;
    let remaining = num;
    let needZero = false;

    while (remaining > 0) {
      const section = remaining % 10000;
      if (section === 0) {
        if (result) needZero = true;
      } else {
        if (needZero) result = `零${result}`;
        result = `${sectionToChinese(section)}${CN_BIG[bigIndex]}${result}`;
        needZero = false;
      }
      remaining = Math.floor(remaining / 10000);
      bigIndex += 1;
    }

    return `${result}元整`;
  },

  formatAmount(amount) {
    if (amount === '' || amount === null || amount === undefined) return '';
    const num = Number(amount);
    if (!Number.isFinite(num)) return '';
    return num.toLocaleString('zh-TW');
  },

  formatRocDate(dateStr, fallback = '　　年　　月　　日') {
    if (!dateStr) return fallback;

    const date = new Date(`${dateStr}T00:00:00`);
    if (Number.isNaN(date.getTime())) return fallback;

    const year = date.getFullYear() - 1911;
    return `民國${year}年${date.getMonth() + 1}月${date.getDate()}日`;
  }
};
