const { t, getLocale } = require("../../shared/i18n/index");
const { formatUnitPrice } = require("../../shared/constants");

Page({
  data: {
    _t: getLocale(),
    product: null,
    specs: [],
    loading: true,
  },
  onLoad(options) {
    wx.setNavigationBarTitle({ title: t("detail.navTitle") });
    const id = options.id;
    if (id) this.loadDetail(id);
  },
  async loadDetail(productId) {
    const db = wx.cloud.database();
    try {
      const productRes = await db.collection("products").doc(productId).get();
      const specRes = await db.collection("specs")
        .where({ productId })
        .orderBy("createTime", "desc")
        .get();

      const specs = [];
      for (const spec of specRes.data) {
        const priceRes = await db.collection("prices")
          .where({ specId: spec._id })
          .orderBy("unitPrice", "asc")
          .get();
        specs.push({
          ...spec,
          prices: priceRes.data.map((p) => ({
            ...p,
            unitPriceText: formatUnitPrice(p.unitPrice),
          })),
        });
      }

      this.setData({
        product: productRes.data,
        specs,
        loading: false,
      });
    } catch (e) {
      wx.showToast({ title: t("detail.loadFail"), icon: "none" });
      this.setData({ loading: false });
    }
  },
});
