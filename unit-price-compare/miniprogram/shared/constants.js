const PLATFORMS = [
  "淘宝",
  "京东",
  "拼多多",
  "抖音",
  "快手",
  "山姆",
  "盒马",
  "Costco",
  "大润发",
  "永辉",
  "沃尔玛",
  "线下商超",
  "其他",
];

const SPEC_UNITS = [
  { label: "克 (g)", value: "g" },
  { label: "千克 (kg)", value: "kg" },
  { label: "毫升 (ml)", value: "ml" },
  { label: "升 (L)", value: "L" },
  { label: "个", value: "个" },
  { label: "包", value: "包" },
  { label: "瓶", value: "瓶" },
  { label: "罐", value: "罐" },
  { label: "盒", value: "盒" },
  { label: "斤", value: "斤" },
];

function calcUnitPrice(price, specValue, specUnit) {
  if (!price || !specValue) return 0;
  return price / specValue;
}

function formatUnitPrice(unitPrice) {
  if (unitPrice === 0) return "-";
  if (unitPrice < 0.0001) return unitPrice.toExponential(2);
  if (unitPrice < 1) return unitPrice.toFixed(4);
  return unitPrice.toFixed(2);
}

module.exports = {
  PLATFORMS,
  SPEC_UNITS,
  calcUnitPrice,
  formatUnitPrice,
};
