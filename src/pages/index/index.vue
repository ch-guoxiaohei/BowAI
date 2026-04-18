<template>
  <view class="container">
    <view class="header">
      <text class="title">射箭辅助工具</text>
      <text class="subtitle">专业训练，精准提升</text>
    </view>

    <view class="stats-container">
      <view class="stat-card">
        <text class="stat-value">{{ totalArrows }}</text>
        <text class="stat-label">总箭数</text>
      </view>
      <view class="stat-card">
        <text class="stat-value">{{ totalTrainingTime }}</text>
        <text class="stat-label">累计时长</text>
      </view>
      <view class="stat-card">
        <text class="stat-value">{{ averageScore }}</text>
        <text class="stat-label">平均环数</text>
      </view>
    </view>

    <view class="quick-actions">
      <view class="action-card" @tap="goToTraining">
        <view class="action-icon">🎯</view>
        <text class="action-title">计数器</text>
        <text class="action-desc">记录训练数据</text>
      </view>

      <view class="action-card" @tap="goToScoring">
        <view class="action-icon">📊</view>
        <text class="action-title">计分系统</text>
        <text class="action-desc">记录比赛成绩</text>
      </view>

      <view class="action-card" @tap="goToSettings">
        <view class="action-icon">⚙️</view>
        <text class="action-title">设置</text>
        <text class="action-desc">个性化配置</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { formatDuration } from '@/utils/helpers'

const store = useStore()

const totalArrows = computed(() => {
  const trainingArrows = store.getters['training/totalArrows']
  const scoringArrows = store.getters['scoring/totalArrows']
  return trainingArrows + scoringArrows
})

const totalTrainingTime = computed(() => {
  const trainingTime = store.getters['training/totalTrainingTime']
  const scoringTime = store.getters['scoring/totalDuration']
  const totalSeconds = trainingTime + scoringTime
  return formatDuration(totalSeconds)
})

const averageScore = computed(() => store.getters['scoring/averageScore'])

onMounted(() => {
  store.dispatch('training/loadSessions')
  store.dispatch('scoring/loadSessions')
})

const goToTraining = () => {
  uni.navigateTo({
    url: '/pages/training/training'
  })
}

const goToScoring = () => {
  uni.navigateTo({
    url: '/pages/scoring/scoring'
  })
}

const goToSettings = () => {
  uni.navigateTo({
    url: '/pages/settings/settings'
  })
}
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  padding: 32rpx;
}

.header {
  text-align: center;
  margin-bottom: 48rpx;
}

.title {
  display: block;
  font-size: 48rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 16rpx;
}

.subtitle {
  display: block;
  font-size: 28rpx;
  color: #999;
}

.stats-container {
  display: flex;
  justify-content: space-between;
  margin-bottom: 48rpx;
}

.stat-card {
  flex: 1;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16rpx;
  padding: 32rpx 16rpx;
  text-align: center;
  margin: 0 8rpx;

  &:first-child {
    margin-left: 0;
  }

  &:last-child {
    margin-right: 0;
  }
}

.stat-value {
  display: block;
  font-size: 36rpx;
  font-weight: bold;
  color: #fff;
  margin-bottom: 8rpx;
}

.stat-label {
  display: block;
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24rpx;
  margin-bottom: 48rpx;
}

.action-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 32rpx;
  text-align: center;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
  transition: all 0.3s;

  &:active {
    transform: scale(0.98);
  }
}

.action-icon {
  font-size: 64rpx;
  margin-bottom: 16rpx;
}

.action-title {
  display: block;
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 8rpx;
}

.action-desc {
  display: block;
  font-size: 24rpx;
  color: #999;
}
</style>