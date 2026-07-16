const { t } = require("./shared/i18n/index");

App({
  globalData: {
    env: "cloud1-9gfoqx5va6f33a45",
  },
  onLaunch() {
    if (!wx.cloud) {
      console.error(t("app.lowVersion"));
    } else {
      wx.cloud.init({
        env: this.globalData.env,
        traceUser: true,
      });
    }
  },
});
