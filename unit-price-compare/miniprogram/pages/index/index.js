const { t, getLocale } = require("../../shared/i18n/index");

Page({
  data: {
    _t: getLocale(),
    products: [],
    loading: true,
  },
  onShow() {
    this.loadProducts();
  },
  loadProducts() {
    this.setData({ loading: true });
    const db = wx.cloud.database();
    db.collection("products")
      .orderBy("createTime", "desc")
      .get()
      .then((res) => {
        const products = res.data.map((p) => ({
          ...p,
          swipeBtns: [{
            text: t("index.deleteProduct"),
            type: "warn",
            data: { id: p._id, name: p.productName },
          }],
        }));
        this.setData({ products, loading: false });
      })
      .catch(() => {
        this.setData({ loading: false });
      });
  },
  goToAdd() {
    wx.navigateTo({ url: "/pages/add-record/index" });
  },
  goToDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/product-detail/index?id=${id}` });
  },
  onDeleteProduct(e) {
    const { id, name } = e.detail.data;
    wx.showModal({
      title: t("index.deleteProduct"),
      content: t("index.deleteProductConfirm", { name }),
      confirmText: t("index.deleteProduct"),
      confirmColor: "#e53935",
      success: (res) => {
        if (res.confirm) this.deleteProduct(id);
      },
    });
  },
  async deleteProduct(productId) {
    const db = wx.cloud.database();
    const _ = db.command;
    try {
      const specRes = await db.collection("specs").where({ productId }).get();
      const specIds = specRes.data.map((s) => s._id);
      if (specIds.length > 0) {
        await db.collection("prices").where({ specId: _.in(specIds) }).remove();
      }
      await db.collection("specs").where({ productId }).remove();
      await db.collection("products").doc(productId).remove();
      wx.showToast({ title: t("index.deleted") });
      this.loadProducts();
    } catch (e) {
      wx.showToast({ title: t("index.fail"), icon: "none" });
    }
  },
});
