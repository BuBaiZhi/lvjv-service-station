function applyThemeFromStorage() {
  const st = wx.getStorageSync("settings") || {};
  const dark = !!st.darkMode;
  const navBg = dark ? "#111111" : "#ffffff";
  const frontColor = dark ? "#ffffff" : "#000000";
  const pageBg = dark ? "#000000" : "#f5f5f5";
  try {
    wx.setNavigationBarColor({
      frontColor: frontColor,
      backgroundColor: navBg
    });
  } catch (e) {}
  try {
    wx.setBackgroundColor({
      backgroundColor: pageBg
    });
  } catch (e) {}
}

module.exports = {
  applyThemeFromStorage: applyThemeFromStorage
};
