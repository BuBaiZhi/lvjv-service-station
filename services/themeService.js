// 主题服务
const STORAGE_KEY = 'app_theme_settings'

// 默认设置
const defaultSettings = {
  theme: 'light',      // light / dark
  elderMode: false     // 老人模式
}

// 获取当前主题设置
function getThemeSettings() {
  try {
    const settings = wx.getStorageSync(STORAGE_KEY)
    return settings || defaultSettings
  } catch (e) {
    console.error('获取主题设置失败', e)
    return defaultSettings
  }
}

// 保存主题设置
function saveThemeSettings(settings) {
  try {
    wx.setStorageSync(STORAGE_KEY, settings)
    return true
  } catch (e) {
    console.error('保存主题设置失败', e)
    return false
  }
}

// 切换日夜模式
function toggleTheme() {
  const settings = getThemeSettings()
  settings.theme = settings.theme === 'light' ? 'dark' : 'light'
  saveThemeSettings(settings)
  return settings
}

// 切换老人模式
function toggleElderMode() {
  const settings = getThemeSettings()
  settings.elderMode = !settings.elderMode
  saveThemeSettings(settings)
  return settings
}

// 应用主题到页面
function applyThemeToPage(page) {
  const settings = getThemeSettings()
  page.setData({
    theme: settings.theme,
    elderMode: settings.elderMode
  })
  
  // 设置到根元素
  const app = getApp()
  if (app.globalData) {
    app.globalData.theme = settings.theme
    app.globalData.elderMode = settings.elderMode
  }
}

module.exports = {
  getThemeSettings,
  saveThemeSettings,
  toggleTheme,
  toggleElderMode,
  applyThemeToPage
}