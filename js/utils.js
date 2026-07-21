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
  }
};
