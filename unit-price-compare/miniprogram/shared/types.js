/**
 * products 集合 - 商品
 * @typedef {Object} Product
 * @property {string} _id
 * @property {string} brand - 品牌，如"农夫山泉"
 * @property {string} productName - 商品名，如"饮用天然水"
 * @property {string} fullName - brand + productName，搜索用
 * @property {string} [category] - 分类，如"饮料/水"
 * @property {Date} createTime
 */

/**
 * specs 集合 - 规格
 * @typedef {Object} Spec
 * @property {string} _id
 * @property {string} productId - 关联 products._id
 * @property {string} spec - 如"550ml"
 * @property {string} specUnit - 单位 g / ml / 个 / 包
 * @property {number} specValue - 数值 550
 * @property {Date} createTime
 */

/**
 * prices 集合 - 价格记录
 * @typedef {Object} Price
 * @property {string} _id
 * @property {string} specId - 关联 specs._id
 * @property {string} platform - 平台，如"京东"
 * @property {string} shopName - 店铺名
 * @property {number} price - 总价
 * @property {number} unitPrice - 单价（自动计算）
 * @property {Date} recordDate - 记录日期
 * @property {Date} createTime
 */

module.exports = {};
