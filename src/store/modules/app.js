import Storage from '@/utils/storage'

const applyTheme = (darkMode) => {
  try {
    const pages = getCurrentPages()
    const currentPage = pages[pages.length - 1]
    
    if (currentPage && currentPage.$vm) {
      currentPage.$vm.$set(currentPage.$vm, 'isDarkMode', darkMode)
    }
    
    // Update global style
    const globalStyle = {
      'navigationBarTextStyle': darkMode ? 'white' : 'black',
      'navigationBarBackgroundColor': darkMode ? '#1a1a1a' : '#F8F8F8',
      'backgroundColor': darkMode ? '#1a1a1a' : '#F8F8F8'
    }
    
    // Note: In a real uni-app application, you might need to use
    // uni.setNavigationBarColor() or other APIs to apply theme changes
    if (typeof uni !== 'undefined' && uni.setNavigationBarColor) {
      uni.setNavigationBarColor({
        frontColor: darkMode ? '#ffffff' : '#000000',
        backgroundColor: darkMode ? '#1a1a1a' : '#F8F8F8'
      })
    }
  } catch (error) {
    console.error('应用主题失败:', error)
  }
}

const state = {
  initialized: false,
  userInfo: null,
  settings: {
    darkMode: false,
    language: 'zh-CN',
    notifications: true
  }
}

const mutations = {
  SET_INITIALIZED(state, initialized) {
    state.initialized = initialized
  },
  SET_USER_INFO(state, userInfo) {
    state.userInfo = userInfo
  },
  UPDATE_SETTINGS(state, settings) {
    state.settings = { ...state.settings, ...settings }
  }
}

const actions = {
  async init({ commit, dispatch }) {
    try {
      await dispatch('loadSettings')
      await dispatch('loadUserInfo')
      commit('SET_INITIALIZED', true)
    } catch (error) {
      console.error('初始化失败:', error)
    }
  },
  async loadSettings({ commit }) {
    try {
      const settings = await Storage.get('settings')
      if (settings) {
        commit('UPDATE_SETTINGS', settings)
      }
    } catch (error) {
      console.error('加载设置失败:', error)
    }
  },
  async saveSettings({ state, commit }, settings) {
    try {
      const newSettings = { ...state.settings, ...settings }
      await Storage.set('settings', newSettings)
      commit('UPDATE_SETTINGS', newSettings)
      
      // Apply theme changes globally
      if (settings.darkMode !== undefined) {
        applyTheme(newSettings.darkMode)
      }
      
      return true
    } catch (error) {
      console.error('保存设置失败:', error)
      return false
    }
  },
  async loadUserInfo({ commit }) {
    try {
      const userInfo = await Storage.get('userInfo')
      if (userInfo) {
        commit('SET_USER_INFO', userInfo)
      }
    } catch (error) {
      console.error('加载用户信息失败:', error)
    }
  },
  async updateUserInfo({ commit }, userInfo) {
    try {
      await Storage.set('userInfo', userInfo)
      commit('SET_USER_INFO', userInfo)
      return true
    } catch (error) {
      console.error('更新用户信息失败:', error)
      return false
    }
  }
}

const getters = {
  isInitialized: (state) => state.initialized,
  userInfo: (state) => state.userInfo,
  settings: (state) => state.settings
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}