const zhCN = require("./zh-CN");

const locales = { "zh-CN": zhCN };
let currentLang = "zh-CN";

function setLanguage(lang) {
  if (locales[lang]) currentLang = lang;
}

function getLocale() {
  return locales[currentLang];
}

function t(key, params) {
  const keys = key.split(".");
  let val = locales[currentLang];
  for (const k of keys) {
    val = val?.[k];
    if (val === undefined) return key;
  }
  if (params && typeof val === "string") {
    return val.replace(/\{(\w+)\}/g, (_, k) => params[k] ?? `{${k}}`);
  }
  return val ?? key;
}

module.exports = { t, setLanguage, getLocale, locales };
