const { getLocale } = require("../../shared/i18n/index");

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
        this.setData({ products: res.data, loading: false });
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
});
