<template>
  <view class="container">
    <view class="counter-display">
      <text class="arrow-count">{{ arrowCount }}</text>
      <text class="arrow-label">箭</text>
    </view>

    <view class="timer-display">
      <text class="timer-value">{{ formattedElapsedTime }}</text>
      <text class="timer-label">训练时长</text>
    </view>

    <view class="step-input-container">
      <text class="step-label">每次增加</text>
      <input
        class="step-input"
        type="number"
        v-model.number="stepValue"
        @input="validateStep"
        placeholder="1"
      />
      <text class="step-unit">箭</text>
    </view>

    <view class="action-buttons">
      <button class="btn btn-counter" @tap="incrementArrow">
        + {{ stepValue }} 箭
      </button>
      <button class="btn btn-end" @tap="endCounting">
        结束计数
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useStore } from 'vuex'

const store = useStore()

const arrowCount = ref(0)
const timer = ref(null)
const elapsedTime = ref(0)
const stepValue = ref(1)
const MAX_STEP = 50

const formattedElapsedTime = computed(() => {
  const hours = Math.floor(elapsedTime.value / 3600)
  const minutes = Math.floor((elapsedTime.value % 3600) / 60)
  const seconds = elapsedTime.value % 60
  
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
})

onMounted(() => {
  startTraining()
})

onUnmounted(() => {
  if (timer.value) {
    clearInterval(timer.value)
  }
})

const startTraining = () => {
  elapsedTime.value = 0
  arrowCount.value = 0
  stepValue.value = 1
  
  timer.value = setInterval(() => {
    elapsedTime.value += 1
  }, 1000)
}

const validateStep = () => {
  if (stepValue.value < 1) {
    stepValue.value = 1
  } else if (stepValue.value > MAX_STEP) {
    stepValue.value = MAX_STEP
  } else if (!stepValue.value || isNaN(stepValue.value)) {
    stepValue.value = 1
  }
}

const incrementArrow = () => {
  validateStep()
  arrowCount.value += stepValue.value
}

const endCounting = async () => {
  if (timer.value) {
    clearInterval(timer.value)
  }
  
  const now = new Date()
  const startTime = new Date(now.getTime() - elapsedTime.value * 1000)
  
  const session = {
    id: Date.now().toString(),
    startTime: formatDateTime(startTime),
    endTime: formatDateTime(now),
    arrowCount: arrowCount.value,
    duration: elapsedTime.value
  }
  
  const result = await store.dispatch('training/addSessionWithLimit', session)
  
  if (result.success && result.trimmed) {
    uni.showToast({
      title: `已归档${result.removedCount}条旧记录`,
      icon: 'success',
      duration: 2000
    })
  }
  
  uni.navigateBack()
}

const formatDateTime = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  padding: 32rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.counter-display {
  text-align: center;
  margin-bottom: 48rpx;
}

.arrow-count {
  display: block;
  font-size: 120rpx;
  font-weight: bold;
  color: #fff;
  line-height: 1;
  margin-bottom: 16rpx;
}

.arrow-label {
  display: block;
  font-size: 32rpx;
  color: rgba(255, 255, 255, 0.8);
}

.timer-display {
  text-align: center;
  margin-bottom: 48rpx;
}

.timer-value {
  display: block;
  font-size: 64rpx;
  font-weight: bold;
  color: #fff;
  line-height: 1;
  margin-bottom: 8rpx;
}

.timer-label {
  display: block;
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.8);
}

.step-input-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  margin-bottom: 48rpx;
  background: rgba(255, 255, 255, 0.2);
  padding: 24rpx 32rpx;
  border-radius: 16rpx;
  backdrop-filter: blur(10rpx);
}

.step-label {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.9);
}

.step-input {
  width: 120rpx;
  height: 60rpx;
  background: #fff;
  border: none;
  border-radius: 8rpx;
  font-size: 32rpx;
  font-weight: bold;
  color: #667eea;
  text-align: center;
  padding: 0 16rpx;
}

.step-unit {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.9);
}

.action-buttons {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.btn {
  padding: 32rpx;
  border-radius: 16rpx;
  font-size: 36rpx;
  font-weight: bold;
  border: none;
  transition: all 0.3s;

  &.btn-counter {
    background: #fff;
    color: #667eea;
    box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.2);
  }

  &.btn-end {
    background: rgba(255, 255, 255, 0.3);
    color: #fff;
    border: 2rpx solid rgba(255, 255, 255, 0.8);
    box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.3);
    font-size: 40rpx;
  }

  &:active {
    transform: scale(0.98);
    opacity: 0.9;
  }
}
</style>