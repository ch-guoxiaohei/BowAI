<template>
  <view class="container">
    <view v-if="session" class="session-details">
      <view class="session-info">
        <text class="info-title">{{ getBowTypeLabel(session.bowType) }}</text>
        <text class="info-detail">
          {{ session.distance }}米 · {{ getTargetFaceLabel(session.targetFace) }}
        </text>
        <text class="info-date">{{ formatDateTime(session.startTime) }}</text>
        <text class="info-duration">
          用时: {{ formatDuration(session.duration) }}
        </text>
      </view>

      <view class="score-summary">
        <view class="summary-item">
          <text class="summary-label">总分</text>
          <text class="summary-value">{{ session.totalScore }}</text>
        </view>
        <view class="summary-item">
          <text class="summary-label">组数</text>
          <text class="summary-value">{{ session.totalRounds }}</text>
        </view>
        <view class="summary-item">
          <text class="summary-label">总箭数</text>
          <text class="summary-value">{{ session.totalRounds * session.arrowsPerRound }}</text>
        </view>
        <view class="summary-item">
          <text class="summary-label">平均分</text>
          <text class="summary-value">{{ averageScore }}</text>
        </view>
      </view>

      <view v-if="chartData" class="chart-container">
        <view class="chart-header">
          <text class="chart-title">得分趋势</text>
          <text class="chart-subtitle">组别分数变化</text>
        </view>
        <view class="chart-wrapper">
          <canvas 
            canvas-id="roundChart" 
            id="roundChart" 
            class="chart-canvas"
            @touchstart="touchChart"
            @touchmove="moveChart"
            @touchend="touchEndChart"
          ></canvas>
        </view>
      </view>

      <view class="rounds-details">
        <view class="details-header">
          <text class="details-title">详细记录</text>
        </view>
        <view
          class="round-detail-card"
          v-for="(round, roundIndex) in session.scores"
          :key="roundIndex"
        >
          <view class="round-detail-header">
            <text class="round-detail-title">第 {{ roundIndex + 1 }} 组</text>
            <text class="round-detail-score">
              {{ round.reduce((sum, score) => sum + score, 0) }} 环
            </text>
          </view>
          <view class="arrows-detail-grid">
            <view
              class="arrow-detail-item"
              v-for="(score, arrowIndex) in round"
              :key="arrowIndex"
            >
              <text class="arrow-detail-score">{{ score || '-' }}</text>
              <text class="arrow-detail-label">第{{ arrowIndex + 1 }}箭</text>
            </view>
          </view>
        </view>
      </view>

      <view class="action-section">
        <button class="btn btn-primary btn-block" @tap="goBack">
          返回列表
        </button>
      </view>
    </view>

    <view v-else class="loading-state">
      <text class="loading-icon">⏳</text>
      <text class="loading-text">加载中...</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useStore } from 'vuex'
import uCharts from '@qiun/ucharts'

const store = useStore()

const sessionId = ref('')
const session = ref(null)
let uChartsInstance = null

const getBowTypeLabel = computed(() => store.getters['scoring/getBowTypeLabel'])
const getTargetFaceLabel = computed(() => store.getters['scoring/getTargetFaceLabel'])

const averageScore = computed(() => {
  if (!session.value) return '0.00'
  const totalArrows = session.value.totalRounds * session.value.arrowsPerRound
  return totalArrows > 0 ? (session.value.totalScore / totalArrows).toFixed(2) : '0.00'
})

const chartData = computed(() => {
  if (!session.value || !session.value.scores) {
    return null
  }
  
  const roundScores = session.value.scores.map((round, index) => ({
    roundNumber: index + 1,
    score: round.reduce((sum, score) => sum + score, 0)
  }))
  
  return {
    categories: roundScores.map(r => `第${r.roundNumber}组`),
    data: roundScores.map(r => r.score)
  }
})

onMounted(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const options = currentPage.options || {}
  sessionId.value = options.id || ''
  
  loadSession()
})

const loadSession = async () => {
  if (!sessionId.value) {
    uni.showToast({
      title: '缺少记录ID',
      icon: 'none'
    })
    return
  }

  try {
    const sessions = await store.dispatch('scoring/loadSessions')
    const foundSession = sessions.find(s => s.id === sessionId.value)
    
    if (foundSession) {
      session.value = foundSession
      nextTick(() => {
        initChart()
      })
    } else {
      uni.showToast({
        title: '记录不存在',
        icon: 'none'
      })
    }
  } catch (error) {
    console.error('加载记录失败:', error)
    uni.showToast({
      title: '加载失败',
      icon: 'none'
    })
  }
}

const initChart = () => {
  nextTick(() => {
    const data = chartData.value
    if (!data || data.categories.length === 0) {
      return
    }

    const canvasContext = uni.createCanvasContext('roundChart')
    
    const chartConfig = {
      type: 'column',
      canvasId: 'roundChart',
      context: canvasContext,
      width: uni.upx2px(750),
      height: uni.upx2px(400),
      categories: data.categories,
      series: [{
        name: '分数',
        data: data.data,
        color: '#667eea'
      }],
      animation: true,
      background: '#FFFFFF',
      color: ['#667eea'],
      padding: [15, 15, 0, 5],
      enableScroll: false,
      legend: {
        show: false
      },
      xAxis: {
        disableGrid: true,
        itemCount: 7
      },
      yAxis: {
        gridType: 'dash',
        dashLength: 2,
        data: [{
          min: 0
        }]
      },
      extra: {
        line: {
          type: 'curve',
          width: 2,
          activeType: 'hollow'
        },
        column: {
          width: 30,
          activeType: 'hollow',
          activeWidth: 35,
          linearType: 'custom',
          linearOpacity: 0.8,
          barBorderCircle: true
        }
      }
    }

    uChartsInstance = new uCharts(chartConfig)
  })
}

const touchChart = (e) => {
  if (uChartsInstance) {
    uChartsInstance.touchLegend(e)
    uChartsInstance.showToolTip(e)
  }
}

const moveChart = (e) => {
  if (uChartsInstance) {
    uChartsInstance.scroll(e)
  }
}

const touchEndChart = (e) => {
  if (uChartsInstance) {
    uChartsInstance.touchEnd(e)
  }
}

const formatDateTime = (dateTime) => {
  if (!dateTime) return ''
  
  if (dateTime.includes(' ')) {
    return dateTime
  }
  
  const date = new Date(dateTime)
  if (isNaN(date.getTime())) {
    return dateTime
  }
  
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

const formatDuration = (seconds) => {
  if (!seconds) return '0分'
  
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  
  if (hours > 0) {
    return `${hours}小时${minutes}分`
  }
  return `${minutes}分`
}

const goBack = () => {
  const pages = getCurrentPages()
  if (pages.length > 1) {
    uni.navigateBack()
  } else {
    uni.redirectTo({
      url: '/pages/scoring/scoring'
    })
  }
}
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  padding: 32rpx;
  background: #f5f5f5;
}

.session-details {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.session-info {
  text-align: center;
  padding: 32rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16rpx;
}

.info-title {
  display: block;
  font-size: 36rpx;
  font-weight: bold;
  color: #fff;
  margin-bottom: 8rpx;
}

.info-detail {
  display: block;
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 8rpx;
}

.info-date {
  display: block;
  font-size: 24rpx;
  color: rgba(255,255, 255, 0.6);
  margin-bottom: 8rpx;
}

.info-duration {
  display: block;
  font-size: 32rpx;
  font-weight: bold;
  color: #fff;
  margin-top: 8rpx;
}

.score-summary {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx;
  padding: 24rpx;
  background: #fff;
  border-radius: 12rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
}

.summary-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
  padding: 16rpx;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  border-radius: 12rpx;
}

.summary-label {
  font-size: 24rpx;
  color: #666;
}

.summary-value {
  font-size: 32rpx;
  font-weight: bold;
  color: #667eea;
}

.chart-container {
  background: #fff;
  border-radius: 12rpx;
  padding: 24rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
}

.chart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24rpx;
  padding-bottom: 16rpx;
  border-bottom: 2rpx solid #f0f0f0;
}

.chart-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.chart-subtitle {
  font-size: 26rpx;
  color: #666;
  font-weight: 500;
}

.chart-wrapper {
  width: 100%;
  height: 400rpx;
  position: relative;
}

.chart-canvas {
  width: 100%;
  height: 100%;
}

.rounds-details {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.details-header {
  text-align: center;
  padding: 16rpx;
  background: #fff;
  border-radius: 12rpx;
  margin-bottom: 8rpx;
}

.details-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}

.round-detail-card {
  background: #fff;
  border-radius: 12rpx;
  padding: 24rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
}

.round-detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.round-detail-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}

.round-detail-score {
  font-size: 28rpx;
  color: #667eea;
  font-weight: bold;
}

.arrows-detail-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12rpx;
}

.arrow-detail-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4rpx;
  padding: 12rpx;
  background: #f8f9fa;
  border-radius: 8rpx;
  border: 2rpx solid #e5e5e5;
}

.arrow-detail-score {
  font-size: 32rpx;
  font-weight: bold;
  color: #667eea;
}

.arrow-detail-label {
  font-size: 20rpx;
  color: #999;
}

.action-section {
  margin-top: 24rpx;
}

.btn {
  height: 88rpx;
  border-radius: 12rpx;
  font-size: 28rpx;
  font-weight: bold;
  border: none;
  color: #fff;

  &-primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    box-shadow: 0 4rpx 12rpx rgba(102, 126, 234, 0.3);
  }

  &-default {
    background: #fff;
    color: #666;
    border: 2rpx solid #e5e5e5;
  }

  &-block {
    width: 100%;
  }

  &:active {
    opacity: 0.8;
    transform: scale(0.98);
  }
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
}

.loading-icon {
  font-size: 120rpx;
  margin-bottom: 32rpx;
}

.loading-text {
  font-size: 32rpx;
  color: #666;
}
</style>