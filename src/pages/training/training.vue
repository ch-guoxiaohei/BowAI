<template>
  <view class="container">
    <view class="header">
      <button class="btn btn-primary btn-block" @tap="startNewCounter">
        开始计数
      </button>
    </view>

    <view v-if="hasActiveFilter || sessions.length > 0" class="list-content">
      <view v-if="sessions.length > 0 || hasActiveFilter" class="date-filter">
        <view class="filter-row">
          <view class="filter-item">
            <text class="filter-label">开始日期</text>
            <picker 
              mode="date" 
              :value="filterStartDate" 
              @change="onStartDateChange"
              class="date-picker"
            >
              <view class="picker-value">
                {{ filterStartDate || '选择日期' }}
              </view>
            </picker>
          </view>
          <view class="filter-item">
            <text class="filter-label">结束日期</text>
            <picker 
              mode="date" 
              :value="filterEndDate" 
              @change="onEndDateChange"
              class="date-picker"
            >
              <view class="picker-value">
                {{ filterEndDate || '选择日期' }}
              </view>
            </picker>
          </view>
        </view>
        <view v-if="hasActiveFilter" class="filter-actions">
          <button 
            class="clear-filter-btn" 
            @tap="clearFilter"
          >
            清除筛选
          </button>
          <text class="filter-result">
            筛选结果：{{ pagination.total }} 条记录
          </text>
        </view>
      </view>

      <view v-if="allFilteredSessions.length > 0" class="chart-container">
        <view class="chart-header">
          <text class="chart-title">训练趋势</text>
          <text class="chart-subtitle">箭数变化</text>
        </view>
        <view class="chart-wrapper">
          <canvas 
            canvas-id="trainingChart" 
            id="trainingChart" 
            class="chart-canvas"
            @touchstart="touchChart"
            @touchmove="moveChart"
            @touchend="touchEndChart"
          ></canvas>
        </view>
      </view>

      <view v-if="sessions.length > 0" class="page-size-selector">
        <text class="selector-label">每页显示:</text>
        <view class="selector-buttons">
          <button 
            v-for="size in pageSizes"
            :key="size"
            class="size-btn"
            :class="{ active: currentPageSize === size }"
            @tap="changePageSize(size)"
          >
            {{ size }}
          </button>
        </view>
      </view>

      <view
        v-if="sessions.length > 0"
        class="record-card"
        v-for="session in sessions"
        :key="session.id"
      >
        <view class="card-content">
          <view class="date-range">
            <text class="date-text">{{ formatDateTime(session.startTime) }}</text>
            <text class="date-separator">-</text>
            <text class="date-text">{{ formatDateTime(session.endTime) }}</text>
          </view>
          <text class="arrow-count">{{ session.arrowCount }} 箭</text>
        </view>
      </view>

      <view v-if="sessions.length === 0 && hasActiveFilter" class="no-filter-results">
        <text class="no-results-icon">📅</text>
        <text class="no-results-text">该日期范围内没有训练记录</text>
        <button class="clear-filter-btn-large" @tap="clearFilter">
          清除筛选
        </button>
      </view>

      <view v-if="sessions.length > 0 && pagination.totalPages > 1" class="pagination">
        <button 
          class="page-btn" 
          :disabled="isFirstPage"
          @tap="goToPage(1)"
        >
          首页
        </button>
        <button 
          class="page-btn" 
          :disabled="isFirstPage"
          @tap="prevPage"
        >
          上一页
        </button>
        <text class="page-info">{{ pagination.page }} / {{ pagination.totalPages }}</text>
        <button 
          class="page-btn" 
          :disabled="isLastPage"
          @tap="nextPage"
        >
          下一页
        </button>
        <button 
          class="page-btn" 
          :disabled="isLastPage"
          @tap="goToPage(pagination.totalPages)"
        >
          末页
        </button>
      </view>

      <view class="pagination-info" v-if="pagination.totalPages > 0">
        <text class="pagination-text">总计 {{ pagination.total }} 条记录</text>
      </view>
    </view>

    <view v-else class="empty-state">
      <text class="empty-icon">📝</text>
      <text class="empty-text">No records</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useStore } from 'vuex'
import uCharts from '@qiun/ucharts'

const store = useStore()

const sessions = computed(() => store.getters['training/sessions'])
const allFilteredSessions = computed(() => store.getters['training/allFilteredSessions'])
const pagination = computed(() => store.getters['training/pagination'])
const isFirstPage = computed(() => store.getters['training/isFirstPage'])
const isLastPage = computed(() => store.getters['training/isLastPage'])

const currentPageSize = ref(10)
const pageSizes = [10, 20, 50, 100]
const filterStartDate = ref('')
const filterEndDate = ref('')
const hasActiveFilter = computed(() => filterStartDate.value || filterEndDate.value)
const chartId = ref('trainingChart')
let uChartsInstance = null

const chartData = computed(() => {
  const allSessions = allFilteredSessions.value
  
  if (allSessions.length === 0) {
    return null
  }
  
  const sortedSessions = [...allSessions].sort((a, b) => {
    return new Date(a.startTime) - new Date(b.startTime)
  })
  
  const dailyData = {}
  
  sortedSessions.forEach(session => {
    const date = new Date(session.startTime)
    const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    const displayDate = `${date.getMonth() + 1}/${date.getDate()}`
    
    if (!dailyData[dateKey]) {
      dailyData[dateKey] = {
        displayDate: displayDate,
        arrowCount: 0
      }
    }
    
    dailyData[dateKey].arrowCount += session.arrowCount
  })
  
  const sortedDates = Object.keys(dailyData).sort()
  
  return {
    categories: sortedDates.map(date => dailyData[date].displayDate),
    data: sortedDates.map(date => dailyData[date].arrowCount)
  }
})

const initChart = () => {
  nextTick(() => {
    const data = chartData.value
    if (!data || data.categories.length === 0) {
      return
    }

    const canvasContext = uni.createCanvasContext('trainingChart')
    
    const chartType = data.categories.length <= 5 ? 'column' : 'line'
    
    const chartConfig = {
      type: chartType,
      canvasId: 'trainingChart',
      context: canvasContext,
      width: uni.upx2px(750),
      height: uni.upx2px(400),
      categories: data.categories,
      series: [{
        name: '箭数',
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

onMounted(() => {
  loadSessions()
})

const loadSessions = async (page = 1) => {
  await store.dispatch('training/loadPaginatedSessions', { 
    page, 
    pageSize: currentPageSize.value,
    startDate: filterStartDate.value,
    endDate: filterEndDate.value
  })
  initChart()
}

const changePageSize = (size) => {
  currentPageSize.value = size
  loadSessions(1)
}

const onStartDateChange = (e) => {
  const newStartDate = e.detail.value
  
  if (filterEndDate.value && newStartDate > filterEndDate.value) {
    uni.showToast({
      title: '开始日期不能大于结束日期',
      icon: 'none',
      duration: 2000
    })
    return
  }
  
  filterStartDate.value = newStartDate
  loadSessions(1)
}

const onEndDateChange = (e) => {
  const newEndDate = e.detail.value
  
  if (filterStartDate.value && newEndDate < filterStartDate.value) {
    uni.showToast({
      title: '结束日期不能小于开始日期',
      icon: 'none',
      duration: 2000
    })
    return
  }
  
  filterEndDate.value = newEndDate
  loadSessions(1)
}

const clearFilter = () => {
  filterStartDate.value = ''
  filterEndDate.value = ''
  loadSessions(1)
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

const startNewCounter = () => {
  uni.navigateTo({
    url: '/pages/training/current'
  })
}

const goToPage = (page) => {
  loadSessions(page)
}

const prevPage = () => {
  if (!isFirstPage.value) {
    loadSessions(pagination.value.page - 1)
  }
}

const nextPage = () => {
  if (!isLastPage.value) {
    loadSessions(pagination.value.page + 1)
  }
}
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  padding: 32rpx;
  background: #f5f5f5;
}

.header {
  margin-bottom: 32rpx;
}

.btn {
  padding: 24rpx 32rpx;
  border-radius: 12rpx;
  font-size: 32rpx;
  font-weight: 500;
  border: none;
  transition: all 0.3s;

  &.btn-primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    box-shadow: 0 8rpx 24rpx rgba(102, 126, 234, 0.3);
  }

  &.btn-block {
    width: 100%;
  }

  &:active {
    transform: scale(0.98);
    opacity: 0.9;
  }
}

.list-content {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.date-filter {
  background: #fff;
  border-radius: 12rpx;
  padding: 24rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
  margin-bottom: 16rpx;
}

.filter-row {
  display: flex;
  gap: 16rpx;
  margin-bottom: 16rpx;
}

.filter-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.filter-label {
  font-size: 26rpx;
  color: #666;
  font-weight: 500;
}

.date-picker {
  width: 100%;
}

.picker-value {
  padding: 16rpx;
  background: #f5f5f5;
  border-radius: 8rpx;
  font-size: 28rpx;
  color: #333;
  text-align: center;
  border: 2rpx solid #e0e0e0;
}

.filter-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}

.clear-filter-btn {
  padding: 12rpx 24rpx;
  border-radius: 8rpx;
  font-size: 26rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border: none;
  transition: all 0.3s;

  &:active {
    transform: scale(0.95);
    opacity: 0.9;
  }
}

.filter-result {
  font-size: 26rpx;
  color: #667eea;
  font-weight: 500;
  flex: 1;
  text-align: right;
}

.chart-container {
  background: #fff;
  border-radius: 12rpx;
  padding: 24rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
  margin-bottom: 16rpx;
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

.no-filter-results {
  text-align: center;
  padding: 80rpx 32rpx;
  background: #fff;
  border-radius: 12rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
  margin-bottom: 16rpx;
}

.no-results-icon {
  display: block;
  font-size: 120rpx;
  margin-bottom: 32rpx;
}

.no-results-text {
  display: block;
  font-size: 32rpx;
  color: #666;
  font-weight: 500;
  margin-bottom: 48rpx;
}

.clear-filter-btn-large {
  padding: 24rpx 48rpx;
  border-radius: 12rpx;
  font-size: 32rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border: none;
  transition: all 0.3s;
  box-shadow: 0 8rpx 24rpx rgba(102, 126, 234, 0.3);

  &:active {
    transform: scale(0.95);
    opacity: 0.9;
  }
}

.page-size-selector {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx;
  background: #fff;
  border-radius: 12rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
  margin-bottom: 16rpx;
}

.selector-label {
  font-size: 28rpx;
  color: #666;
  font-weight: 500;
}

.selector-buttons {
  display: flex;
  gap: 12rpx;
}

.size-btn {
  padding: 12rpx 20rpx;
  border-radius: 8rpx;
  font-size: 26rpx;
  background: #f5f5f5;
  color: #666;
  border: 2rpx solid #e0e0e0;
  transition: all 0.3s;

  &.active {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    border-color: #667eea;
  }

  &:active {
    transform: scale(0.95);
  }
}

.record-card {
  background: #fff;
  border-radius: 12rpx;
  padding: 24rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
}

.card-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.date-range {
  display: flex;
  align-items: center;
  gap: 12rpx;
  flex: 1;
}

.date-text {
  font-size: 26rpx;
  color: #333;
  font-weight: 500;
}

.date-separator {
  font-size: 26rpx;
  color: #999;
  font-weight: 500;
}

.arrow-count {
  font-size: 32rpx;
  font-weight: bold;
  color: #667eea;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  padding: 8rpx 16rpx;
  border-radius: 8rpx;
  margin-left: 16rpx;
}

.empty-state {
  text-align: center;
  padding: 120rpx 0;
}

.empty-icon {
  display: block;
  font-size: 120rpx;
  margin-bottom: 32rpx;
}

.empty-text {
  display: block;
  font-size: 32rpx;
  color: #333;
  font-weight: 500;
  margin-bottom: 16rpx;
}

.empty-hint {
  display: block;
  font-size: 28rpx;
  color: #999;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  margin-top: 32rpx;
  padding: 24rpx;
  background: #fff;
  border-radius: 12rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
}

.page-btn {
  padding: 16rpx 24rpx;
  border-radius: 8rpx;
  font-size: 28rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border: none;
  transition: all 0.3s;

  &:disabled {
    background: #ccc;
    opacity: 0.5;
  }

  &:active:not(:disabled) {
    transform: scale(0.95);
    opacity: 0.9;
  }
}

.page-info {
  font-size: 28rpx;
  color: #666;
  font-weight: 500;
  min-width: 80rpx;
  text-align: center;
}

.pagination-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
  padding: 24rpx;
  background: #fff;
  border-radius: 12rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
  margin-top: 16rpx;
}

.pagination-text {
  font-size: 26rpx;
  color: #666;
  font-weight: 500;
}
</style>