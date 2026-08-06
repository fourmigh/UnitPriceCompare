const { t, getLocale } = require("../../shared/i18n/index");
const { formatUnitPrice, PLATFORM_CATEGORIES } = require("../../shared/constants");

Page({
  data: {
    _t: getLocale(),
    product: null,
    specs: [],
    loading: true,
    productId: "",
  },
  onLoad(options) {
    wx.setNavigationBarTitle({ title: t("detail.navTitle") });
    if (options.id) this.setData({ productId: options.id });
  },
  onShow() {
    if (this.data.productId) this.loadDetail(this.data.productId);
  },
  goToAddRecord() {
    wx.navigateTo({ url: `/pages/add-record/index?id=${this.data.productId}` });
  },
  noop() {},
  onDeleteSpec(e) {
    const { id, spec } = e.detail.data;
    wx.showModal({
      title: t("detail.deleteSpec"),
      content: t("detail.deleteSpecConfirm", { spec }),
      confirmText: t("detail.deleteSpec"),
      confirmColor: "#e53935",
      success: (res) => {
        if (res.confirm) this.deleteSpec(id);
      },
    });
  },
  onDeletePrice(e) {
    const { id } = e.detail.data;
    wx.showModal({
      title: t("detail.deletePrice"),
      content: t("detail.deletePriceConfirm"),
      confirmText: t("detail.deletePrice"),
      confirmColor: "#e53935",
      success: (res) => {
        if (res.confirm) this.deletePrice(id);
      },
    });
  },
  async deleteSpec(specId) {
    const db = wx.cloud.database();
    try {
      await db.collection("prices").where({ specId }).remove();
      await db.collection("specs").doc(specId).remove();
      wx.showToast({ title: t("detail.deleted") });
      this.loadDetail(this.data.productId);
    } catch (e) {
      wx.showToast({ title: t("detail.fail"), icon: "none" });
    }
  },
  async deletePrice(priceId) {
    const db = wx.cloud.database();
    try {
      const priceRes = await db.collection("prices").doc(priceId).get();
      const specId = priceRes.data.specId;
      await db.collection("prices").doc(priceId).remove();
      const remainRes = await db.collection("prices").where({ specId }).count();
      if (remainRes.total === 0) {
        await db.collection("specs").doc(specId).remove();
      }
      wx.showToast({ title: t("detail.deleted") });
      this.loadDetail(this.data.productId);
    } catch (e) {
      wx.showToast({ title: t("detail.fail"), icon: "none" });
    }
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
      const allPrices = [];
      for (const spec of specRes.data) {
        const priceRes = await db.collection("prices")
          .where({ specId: spec._id })
          .orderBy("unitPrice", "asc")
          .get();
        const prices = priceRes.data.map((p) => {
          const cat = PLATFORM_CATEGORIES.find(c => c.key === p.platformCategory);
          const item = {
            ...p,
            unitPriceText: formatUnitPrice(p.unitPrice),
            categoryLabel: cat ? cat.label : "",
            priceBtns: [{
              text: t("detail.deletePrice"),
              type: "warn",
              data: { id: p._id },
            }],
          };
          if (spec.pieceCount) {
            item.perPiece = p.price / spec.pieceCount;
            item.perPieceText = formatUnitPrice(item.perPiece);
            item.pieceUnit = spec.pieceUnit;
          }
          return item;
        });
        specs.push({
          ...spec,
          prices,
          specBtns: [{
            text: t("detail.deleteSpec"),
            type: "warn",
            data: { id: spec._id, spec: spec.spec },
          }],
        });
        allPrices.push(...prices);
      }

      allPrices.sort((a, b) => a.unitPrice - b.unitPrice);
      allPrices.forEach((p, i) => { p.rank = i + 1; });

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
