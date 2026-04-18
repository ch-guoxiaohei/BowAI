<template>
  <view class="container" :class="{ 'dark-mode': isDarkMode }">
    <view class="section">
      <view class="section-title">偏好设置</view>
      <view class="setting-item">
        <text class="setting-label">深色模式</text>
        <switch
          :checked="settings.darkMode"
          @change="onDarkModeChange"
          color="#667eea"
        />
      </view>
      <view class="setting-item">
        <text class="setting-label">消息通知</text>
        <switch
          :checked="settings.notifications"
          @change="onNotificationChange"
          color="#667eea"
        />
      </view>
      <view class="setting-item">
        <text class="setting-label">语言</text>
        <picker
          mode="selector"
          :range="languageOptions"
          :value="languageIndex"
          @change="onLanguageChange"
        >
          <view class="picker">
            {{ languageOptions[languageIndex] }}
          </view>
        </picker>
      </view>
    </view>

    <view class="section">
      <view class="section-title">数据管理</view>
      <view class="setting-item" @tap="exportData">
        <text class="setting-label">导出数据</text>
        <text class="setting-value">></text>
      </view>
      <view class="setting-item" @tap="clearData">
        <text class="setting-label danger">清除所有数据</text>
        <text class="setting-value">></text>
      </view>
    </view>

    <view class="section">
      <view class="section-title">关于</view>
      <view class="setting-item">
        <text class="setting-label">版本</text>
        <text class="setting-value">v1.0.0</text>
      </view>
      <view class="setting-item" @tap="showAbout">
        <text class="setting-label">关于我们</text>
        <text class="setting-value">></text>
      </view>
      <view class="setting-item" @tap="showPrivacy">
        <text class="setting-label">隐私政策</text>
        <text class="setting-value">></text>
      </view>
    </view>

    <view class="action-section">
      <button class="btn btn-primary btn-block btn-lg" @tap="saveSettings">
        保存设置
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useStore } from 'vuex'

const store = useStore()

const isDarkMode = ref(false)

const settings = ref({
  darkMode: false,
  language: 'zh-CN',
  notifications: true
})

const languageOptions = ['简体中文', 'English']
const languageIndex = ref(0)

onMounted(() => {
  loadSettings()
  isDarkMode.value = settings.value.darkMode
})

const loadSettings = async () => {
  const storedSettings = await store.getters['app/settings']
  if (storedSettings) {
    settings.value = { ...storedSettings }
    languageIndex.value = storedSettings.language === 'zh-CN' ? 0 : 1
  }
}

const onDarkModeChange = (e) => {
  settings.value.darkMode = e.detail.value
  isDarkMode.value = e.detail.value
  applyThemeImmediately()
}

const onNotificationChange = (e) => {
  settings.value.notifications = e.detail.value
}

const onLanguageChange = (e) => {
  languageIndex.value = e.detail.value
  settings.value.language = e.detail.value === 0 ? 'zh-CN' : 'en-US'
  saveLanguageSettings()
}

const saveLanguageSettings = async () => {
  try {
    await store.dispatch('app/saveSettings', { 
      language: settings.value.language 
    })
    
    uni.showToast({
      title: '语言已切换',
      icon: 'success'
    })
  } catch (error) {
    uni.showToast({
      title: '保存失败',
      icon: 'none'
    })
  }
}

const applyThemeImmediately = async () => {
  try {
    await store.dispatch('app/saveSettings', { darkMode: settings.value.darkMode })
    
    // Update navigation bar
    if (typeof uni !== 'undefined' && uni.setNavigationBarColor) {
      uni.setNavigationBarColor({
        frontColor: settings.value.darkMode ? '#ffffff' : '#000000',
        backgroundColor: settings.value.darkMode ? '#1a1a1a' : '#F8F8F8'
      })
    }
    
    uni.showToast({
      title: settings.value.darkMode ? '已切换到深色模式' : '已切换到浅色模式',
      icon: 'success'
    })
  } catch (error) {
    console.error('应用主题失败:', error)
  }
}

const saveSettings = async () => {
  try {
    await store.dispatch('app/saveSettings', settings.value)
    
    uni.showToast({
      title: '保存成功',
      icon: 'success'
    })
  } catch (error) {
    uni.showToast({
      title: '保存失败',
      icon: 'none'
    })
  }
}

const exportData = () => {
  uni.showModal({
    title: '导出数据',
    content: '确定要导出所有数据吗？数据将以JSON格式保存。',
    success: (res) => {
      if (res.confirm) {
        const data = {
          settings: settings.value,
          trainingSessions: store.getters['training/sessions'],
          scoringSessions: store.getters['scoring/sessions']
        }
        
        const jsonData = JSON.stringify(data, null, 2)
        
        uni.showModal({
          title: '数据导出',
          content: '数据已准备好，请复制保存',
          editable: true,
          placeholderText: jsonData,
          success: (modalRes) => {
            if (modalRes.confirm) {
              uni.showToast({
                title: '导出成功',
                icon: 'success'
              })
            }
          }
        })
      }
    }
  })
}

const clearData = () => {
  uni.showModal({
    title: '清除数据',
    content: '确定要清除所有数据吗？此操作不可恢复！',
    confirmColor: '#dd524d',
    success: async (res) => {
      if (res.confirm) {
        try {
          await store.dispatch('training/loadSessions')
          await store.dispatch('scoring/loadSessions')
          
          uni.showToast({
            title: '数据已清除',
            icon: 'success'
          })
        } catch (error) {
          uni.showToast({
            title: '清除失败',
            icon: 'none'
          })
        }
      }
    }
  })
}

const showAbout = () => {
  uni.showModal({
    title: '关于我们',
    content: '射箭辅助工具 v1.0.0\n\n专业的射箭训练辅助工具，帮助您记录训练数据、计算成绩、提升训练效果。',
    showCancel: false
  })
}

const showPrivacy = () => {
  uni.showModal({
    title: '隐私政策',
    content: '1. 所有数据仅存储在本地设备\n2. 不会收集任何个人信息\n3. 不会上传数据到任何服务器\n4. 您可以随时导出或删除数据',
    showCancel: false
  })
}
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 120rpx;
  transition: background 0.3s;

  &.dark-mode {
    background: #1a1a1a;
  }
}

.section {
  background: #fff;
  margin-bottom: 24rpx;
  transition: background 0.3s;

  .dark-mode & {
    background: #2a2a2a;
  }
}

.section-title {
  padding: 32rpx 32rpx 16rpx;
  font-size: 28rpx;
  color: #999;
  transition: color 0.3s;

  .dark-mode & {
    color: #888;
  }
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx;
  border-bottom: 2rpx solid #f0f0f0;
  transition: all 0.3s;

  &:last-child {
    border-bottom: none;
  }

  &:active {
    background: #f8f9fa;
  }

  .dark-mode & {
    border-bottom-color: #3a3a3a;

    &:active {
      background: #3a3a3a;
    }
  }
}

.setting-label {
  font-size: 28rpx;
  color: #333;
  transition: color 0.3s;

  &.danger {
    color: #dd524d;
  }

  .dark-mode & {
    color: #e0e0e0;

    &.danger {
      color: #ff6b6b;
    }
  }
}

.setting-value {
  font-size: 24rpx;
  color: #999;
  transition: color 0.3s;

  .dark-mode & {
    color: #888;
  }
}

.picker {
  font-size: 28rpx;
  color: #666;
  transition: color 0.3s;

  .dark-mode & {
    color: #aaa;
  }
}

.action-section {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 24rpx 32rpx;
  background: #fff;
  box-shadow: 0 -2rpx 8rpx rgba(0, 0, 0, 0.06);
  transition: background 0.3s;

  .dark-mode & {
    background: #2a2a2a;
    box-shadow: 0 -2rpx 8rpx rgba(0, 0, 0, 0.3);
  }
}

.btn {
  height: 88rpx;
  border-radius: 12rpx;
  font-size: 32rpx;
  font-weight: bold;
  border: none;
  color: #fff;

  &-primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }

  &-block {
    width: 100%;
  }

  &-lg {
    height: 88rpx;
  }

  &:active {
    opacity: 0.8;
  }
}
</style>