const { t, getLocale } = require("../../shared/i18n/index");
const { PLATFORMS, SPEC_UNITS } = require("../../shared/constants");

Page({
  data: {
    _t: getLocale(),
    platforms: PLATFORMS,
    specUnits: SPEC_UNITS,
    brand: "",
    productName: "",
    platformIndex: 0,
    shopName: "",
    spec: "",
    specUnitIndex: 0,
    specValue: "",
    price: "",
    unitPriceText: "",
    saving: false,
  },
  onLoad() {
    wx.setNavigationBarTitle({ title: t("add.navTitle") });
  },
  onBrandInput(e) {
    this.setData({ brand: e.detail.value });
  },
  onProductNameInput(e) {
    this.setData({ productName: e.detail.value });
  },
  onPlatformChange(e) {
    this.setData({ platformIndex: e.detail.value });
  },
  onShopNameInput(e) {
    this.setData({ shopName: e.detail.value });
  },
  onSpecChange(e) {
    this.setData({ spec: e.detail.value });
  },
  onSpecUnitChange(e) {
    this.setData({ specUnitIndex: e.detail.value });
  },
  onSpecValueInput(e) {
    this.setData({ specValue: e.detail.value });
  },
  onPriceInput(e) {
    this.setData({ price: e.detail.value });
    this.calcPreview();
  },
  calcPreview() {
    const { price, specValue } = this.data;
    if (price && specValue) {
      const unitPrice = Number(price) / Number(specValue);
      this.setData({
        unitPriceText: t("add.unitPricePreview", { price: unitPrice.toFixed(4) }),
      });
    } else {
      this.setData({ unitPriceText: "" });
    }
  },
  async onSubmit() {
    const { brand, productName, platformIndex, shopName, spec, specUnitIndex, specValue, price } = this.data;
    if (!brand || !productName || !shopName || !spec || !specValue || !price) {
      wx.showToast({ title: t("add.formIncomplete"), icon: "none" });
      return;
    }
    this.setData({ saving: true });
    const db = wx.cloud.database();
    const _ = db.command;
    const fullName = brand + productName;
    const specUnit = SPEC_UNITS[specUnitIndex].value;
    const unitPrice = Number(price) / Number(specValue);

    try {
      let productRes = await db.collection("products").where({ fullName }).get();
      let productId;
      if (productRes.data.length === 0) {
        const addRes = await db.collection("products").add({
          data: { brand, productName, fullName, createTime: db.serverDate() },
        });
        productId = addRes._id;
      } else {
        productId = productRes.data[0]._id;
      }

      const specKey = `${specValue}${specUnit}`;
      let specRes = await db.collection("specs").where({
        productId,
        spec: specKey,
      }).get();
      let specId;
      if (specRes.data.length === 0) {
        const addRes = await db.collection("specs").add({
          data: {
            productId,
            spec: specKey,
            specUnit,
            specValue: Number(specValue),
            createTime: db.serverDate(),
          },
        });
        specId = addRes._id;
      } else {
        specId = specRes.data[0]._id;
      }

      await db.collection("prices").add({
        data: {
          specId,
          platform: PLATFORMS[platformIndex],
          shopName,
          price: Number(price),
          unitPrice,
          recordDate: db.serverDate(),
          createTime: db.serverDate(),
        },
      });

      wx.showToast({ title: t("add.success") });
      wx.navigateBack();
    } catch (e) {
      wx.showToast({ title: t("add.fail"), icon: "none" });
    } finally {
      this.setData({ saving: false });
    }
  },
});
