const { t } = require("./shared/i18n/index");

App({
  globalData: {
    env: "",
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
