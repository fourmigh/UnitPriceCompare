const { t, getLocale } = require("../../shared/i18n/index");
const { PLATFORM_CATEGORIES, PLATFORMS, SPEC_UNITS, PIECE_UNITS } = require("../../shared/constants");

Page({
  data: {
    _t: getLocale(),
    isQuickAdd: false,
    existingProductId: "",
    existingSpecs: [],
    specOptions: [],
    specSelectIndex: 0,
    categoryIndex: 0,
    platformCategories: PLATFORM_CATEGORIES,
    platforms: PLATFORMS.online,
    platformsByCategory: PLATFORMS,
    platformIndex: 0,
    specUnits: SPEC_UNITS,
    pieceUnits: PIECE_UNITS,
    brand: "",
    productName: "",
    shopName: "",
    spec: "",
    specUnitIndex: 0,
    specValue: "",
    pieceCount: "",
    pieceUnitIndex: 0,
    price: "",
    unitPriceText: "",
    perPieceText: "",
    customPlatform: "",
    showCustomPlatform: false,
    isFormValid: false,
    saving: false,
  },
  onLoad(options) {
    if (options.id) {
      this.loadProduct(options.id);
    } else {
      wx.setNavigationBarTitle({ title: t("add.navTitle") });
      this.checkFormValid();
    }
  },
  async loadProduct(productId) {
    const db = wx.cloud.database();
    try {
      const productRes = await db.collection("products").doc(productId).get();
      const product = productRes.data;
      wx.setNavigationBarTitle({ title: t("quickAdd.navTitle", { name: product.fullName }) });
      const specRes = await db.collection("specs").where({ productId }).get();
      const existingSpecs = specRes.data;
      const specOptions = existingSpecs.map(s => ({ label: s.spec, isNew: false }));
      specOptions.push({ label: t("quickAdd.newSpec"), isNew: true });

      // 加载最近一条价格记录作为默认值
      let defaults = {};
      if (existingSpecs.length > 0) {
        const _ = db.command;
        const specIds = existingSpecs.map(s => s._id);
        const priceRes = await db.collection("prices")
          .where({ specId: _.in(specIds) })
          .orderBy("createTime", "desc")
          .limit(1)
          .get();
        if (priceRes.data.length > 0) {
          const last = priceRes.data[0];
          const catIdx = PLATFORM_CATEGORIES.findIndex(c => c.key === last.platformCategory);
          const catKey = PLATFORM_CATEGORIES[catIdx >= 0 ? catIdx : 0].key;
          const platformsList = PLATFORMS[catKey];
          const pIdx = platformsList.indexOf(last.platform);
          defaults = {
            categoryIndex: catIdx >= 0 ? catIdx : 0,
            platforms: platformsList,
            platformIndex: pIdx >= 0 ? pIdx : 0,
            showCustomPlatform: pIdx < 0,
            customPlatform: pIdx < 0 ? last.platform : "",
            shopName: last.shopName,
          };
          const specIdx = existingSpecs.findIndex(s => s._id === last.specId);
          if (specIdx >= 0) defaults.specSelectIndex = specIdx;
        }
      }

      this.setData({
        isQuickAdd: true,
        existingProductId: productId,
        existingSpecs,
        specOptions,
        brand: product.brand,
        productName: product.productName,
        ...defaults,
      });
      this.onSpecSelectChange({ detail: { value: defaults.specSelectIndex || 0 } });
    } catch (e) {
      wx.showToast({ title: t("detail.loadFail"), icon: "none" });
      wx.navigateBack();
    }
  },
  onSpecSelectChange(e) {
    const index = e.detail.value;
    const { existingSpecs } = this.data;
    const selected = existingSpecs[index];

    if (selected) {
      const specUnitIndex = SPEC_UNITS.findIndex(u => u.value === selected.specUnit);
      this.setData({
        specSelectIndex: index,
        specValue: String(selected.specValue),
        specUnitIndex: specUnitIndex >= 0 ? specUnitIndex : 0,
        spec: selected.spec,
        pieceCount: selected.pieceCount ? String(selected.pieceCount) : "",
        pieceUnitIndex: selected.pieceUnit ? PIECE_UNITS.indexOf(selected.pieceUnit) : 0,
      });
    } else {
      this.setData({
        specSelectIndex: index,
        specValue: "",
        specUnitIndex: 0,
        spec: "",
        pieceCount: "",
        pieceUnitIndex: 0,
      });
    }
    this.calcPreview();
    this.checkFormValid();
  },
  checkFormValid() {
    const { brand, productName, shopName, specValue, spec, price, showCustomPlatform, customPlatform } = this.data;
    const valid = !!(brand && productName && shopName && spec && Number(specValue) > 0 && Number(price) > 0 && (!showCustomPlatform || customPlatform));
    this.setData({ isFormValid: valid });
  },
  onBrandInput(e) {
    this.setData({ brand: e.detail.value });
    this.checkFormValid();
  },
  onProductNameInput(e) {
    this.setData({ productName: e.detail.value });
    this.checkFormValid();
  },
  onCategoryChange(e) {
    const categoryIndex = e.detail.value;
    const key = PLATFORM_CATEGORIES[categoryIndex].key;
    this.setData({
      categoryIndex,
      platforms: PLATFORMS[key],
      platformIndex: 0,
      showCustomPlatform: false,
      customPlatform: "",
    });
    this.checkFormValid();
  },
  onPlatformChange(e) {
    const platformIndex = e.detail.value;
    const isOther = this.data.platforms[platformIndex] === "其他";
    this.setData({ platformIndex, showCustomPlatform: isOther });
    this.checkFormValid();
  },
  onShopNameInput(e) {
    this.setData({ shopName: e.detail.value });
    this.checkFormValid();
  },
  onSpecChange(e) {
    this.setData({ spec: e.detail.value });
    this.checkFormValid();
  },
  onSpecUnitChange(e) {
    const specUnitIndex = e.detail.value;
    const { specValue, specUnits } = this.data;
    const spec = specValue + specUnits[specUnitIndex].value;
    this.setData({ specUnitIndex, spec });
    this.calcPreview();
    this.checkFormValid();
  },
  onSpecValueInput(e) {
    const specValue = e.detail.value;
    const { specUnitIndex, specUnits } = this.data;
    const spec = specValue + specUnits[specUnitIndex].value;
    this.setData({ specValue, spec });
    this.calcPreview();
    this.checkFormValid();
  },
  onPieceCountInput(e) {
    this.setData({ pieceCount: e.detail.value });
    this.calcPreview();
  },
  onPieceUnitChange(e) {
    this.setData({ pieceUnitIndex: e.detail.value });
    this.calcPreview();
  },
  onCustomPlatformInput(e) {
    this.setData({ customPlatform: e.detail.value });
    this.checkFormValid();
  },
  onPriceInput(e) {
    this.setData({ price: e.detail.value });
    this.calcPreview();
    this.checkFormValid();
  },
  calcPreview() {
    const { price, specValue, specUnitIndex, specUnits, pieceCount, pieceUnitIndex, pieceUnits } = this.data;
    const specUnit = specUnits[specUnitIndex].value;
    const nPrice = Number(price);
    const nSpec = Number(specValue);
    const nPiece = Number(pieceCount);

    if (nPrice && nSpec) {
      const totalSpec = nPiece > 0 ? nSpec * nPiece : nSpec;
      const unitPrice = nPrice / totalSpec;
      const text = t("add.unitPricePreview", { price: unitPrice.toFixed(4), unit: specUnit });
      this.setData({ unitPriceText: text });

      if (nPiece > 0) {
        const perPiece = nPrice / nPiece;
        this.setData({
          perPieceText: t("add.perPiece", {
            price: perPiece.toFixed(2),
            unit: pieceUnits[pieceUnitIndex],
          }),
        });
      } else {
        this.setData({ perPieceText: "" });
      }
    } else {
      this.setData({ unitPriceText: "", perPieceText: "" });
    }
  },
  async onSubmit() {
    const {
      isQuickAdd, existingProductId, existingSpecs, specSelectIndex,
      categoryIndex, platformCategories, platformIndex, platforms,
      brand, productName, shopName,
      spec, specUnitIndex, specUnits, specValue,
      pieceCount, pieceUnitIndex, pieceUnits,
      price, customPlatform, showCustomPlatform,
    } = this.data;
    if (!brand || !productName || !shopName || !spec || !specValue || !price) {
      wx.showToast({ title: t("add.formIncomplete"), icon: "none" });
      return;
    }
    if (showCustomPlatform && !customPlatform) {
      wx.showToast({ title: t("add.customPlatformRequired"), icon: "none" });
      return;
    }

    this.setData({ saving: true });
    const db = wx.cloud.database();
    const specUnit = specUnits[specUnitIndex].value;
    const nSpecValue = Number(specValue);
    const nPiece = Number(pieceCount);
    const nPrice = Number(price);
    const hasPiece = nPiece > 0 && pieceUnitIndex >= 0;
    const totalSpecValue = hasPiece ? nSpecValue * nPiece : nSpecValue;
    const specKey = hasPiece ? `${nSpecValue}${specUnit}×${nPiece}${pieceUnits[pieceUnitIndex]}` : spec;
    const unitPrice = nPrice / totalSpecValue;
    const platformName = showCustomPlatform ? customPlatform : platforms[platformIndex];

    try {
      // 获取或创建 product
      let productId = existingProductId;
      if (!productId) {
        const fullName = brand + productName;
        const productRes = await db.collection("products").where({ fullName }).get();
        if (productRes.data.length > 0) {
          productId = productRes.data[0]._id;
        } else {
          const addRes = await db.collection("products").add({
            data: { brand, productName, fullName, createTime: db.serverDate() },
          });
          productId = addRes._id;
        }
      }

      // 获取或创建 spec
      let specId;
      if (isQuickAdd && existingSpecs[specSelectIndex]) {
        specId = existingSpecs[specSelectIndex]._id;
      } else {
        const specRes = await db.collection("specs").where({ productId, spec: specKey }).get();
        if (specRes.data.length > 0) {
          specId = specRes.data[0]._id;
        } else {
          const specData = {
            productId,
            spec: specKey,
            specUnit,
            specValue: totalSpecValue,
            createTime: db.serverDate(),
          };
          if (hasPiece) {
            specData.pieceCount = nPiece;
            specData.pieceUnit = pieceUnits[pieceUnitIndex];
            specData.pieceSpecValue = nSpecValue;
          }
          const addRes = await db.collection("specs").add({ data: specData });
          specId = addRes._id;
        }
      }

      // 查重
      const dupRes = await db.collection("prices").where({
        specId,
        platform: platformName,
        shopName,
        price: nPrice,
      }).get();
      if (dupRes.data.length > 0) {
        wx.showToast({ title: t("add.duplicateRecord"), icon: "none" });
        this.setData({ saving: false });
        return;
      }

      // 写入 price
      await db.collection("prices").add({
        data: {
          specId,
          platformCategory: platformCategories[categoryIndex].key,
          platform: platformName,
          shopName,
          price: nPrice,
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
