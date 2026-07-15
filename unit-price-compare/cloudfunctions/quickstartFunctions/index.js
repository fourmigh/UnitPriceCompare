const cloud = require("wx-server-sdk");
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

exports.main = async (event) => {
  const { type, data } = event;

  switch (type) {
    // 获取商品详情（含 specs + prices）
    case "getProductDetail": {
      const { productId } = data;
      const product = await db.collection("products").doc(productId).get();
      const specs = await db.collection("specs")
        .where({ productId })
        .orderBy("createTime", "desc")
        .get();

      for (const spec of specs.data) {
        const prices = await db.collection("prices")
          .where({ specId: spec._id })
          .orderBy("unitPrice", "asc")
          .get();
        spec.prices = prices.data;
      }

      return { product: product.data, specs: specs.data };
    }

    // 搜索商品
    case "searchProducts": {
      const { keyword } = data;
      const res = await db.collection("products")
        .where({
          fullName: db.RegExp({
            regexp: keyword,
            options: "i",
          }),
        })
        .orderBy("createTime", "desc")
        .get();
      return { products: res.data };
    }

    default:
      return { error: "unknown type" };
  }
};
