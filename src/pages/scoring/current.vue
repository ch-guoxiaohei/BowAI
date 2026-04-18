<template>
  <view class="container">
    <view v-if="!currentSession" class="setup-screen">
      <view class="setup-content">
        <text class="setup-title">创建计分会话</text>
        <text class="setup-subtitle">设置比赛参数</text>
      </view>

      <view class="form-section">
        <view class="form-item">
          <text class="form-label">弓种</text>
          <picker
            mode="selector"
            :range="bowTypes"
            range-key="label"
            :value="bowTypeIndex"
            @change="onBowTypeChange"
          >
            <view class="picker">
              {{ bowTypes[bowTypeIndex]?.label || '请选择弓种' }}
            </view>
          </picker>
        </view>

        <view class="form-item">
          <text class="form-label">距离（米）</text>
          <picker
            mode="selector"
            :range="distances"
            :value="distanceIndex"
            @change="onDistanceChange"
          >
            <view class="picker">
              {{ distances[distanceIndex] ? distances[distanceIndex] + '米' : '请选择距离' }}
            </view>
          </picker>
        </view>

        <view class="form-item">
          <text class="form-label">靶纸</text>
          <picker
            mode="selector"
            :range="targetFaces"
            range-key="label"
            :value="targetFaceIndex"
            @change="onTargetFaceChange"
          >
            <view class="picker">
              {{ targetFaces[targetFaceIndex]?.label || '请选择靶纸' }}
            </view>
          </picker>
        </view>

        <view class="form-item">
          <text class="form-label">组数</text>
          <input
            class="form-input"
            type="number"
            v-model.number="formData.totalRounds"
            placeholder="输入组数"
          />
        </view>

        <view class="form-item">
          <text class="form-label">每组箭数</text>
          <input
            class="form-input"
            type="number"
            v-model.number="formData.arrowsPerRound"
            placeholder="输入每组箭数"
          />
        </view>
      </view>

      <button class="btn btn-primary btn-block btn-lg" @tap="createSession">
        开始计分
      </button>
    </view>

    <view v-else class="scoring-screen">
      <view class="session-info">
        <text class="info-title">{{ getBowTypeLabel(currentSession.bowType) }}</text>
        <text class="info-detail">
          {{ currentSession.distance }}米 · {{ getTargetFaceLabel(currentSession.targetFace) }}
        </text>
        <text class="info-time" v-if="isScoring">
          用时: {{ formattedElapsedTime }}
        </text>
      </view>

      <view class="score-display">
        <text class="score-label">总分</text>
        <text class="score-value">{{ currentSession.totalScore }}</text>
      </view>

      <view class="rounds-container">
        <view
          class="round-card"
          v-for="(round, roundIndex) in currentSession.scores"
          :key="roundIndex"
        >
          <view class="round-header">
            <text class="round-title">第 {{ roundIndex + 1 }} 组</text>
            <text class="round-score">
              {{ round.reduce((sum, score) => sum + score, 0) }} 环
            </text>
          </view>
          <view class="arrows-grid">
            <view
              class="arrow-item"
              v-for="(score, arrowIndex) in round"
              :key="arrowIndex"
              :class="{ active: currentRound === roundIndex && currentArrow === arrowIndex }"
              @tap="selectArrow(roundIndex, arrowIndex)"
            >
              <text class="arrow-score">{{ score || '-' }}</text>
            </view>
          </view>
        </view>
      </view>

      <view class="score-input-section">
        <view class="score-buttons">
          <button
            class="score-btn"
            v-for="score in [10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0, 'M']"
            :key="score"
            :class="{ 'score-m': score === 'M' }"
            @tap="inputScore(score)"
          >
            {{ score }}
          </button>
        </view>
      </view>

      <view class="action-section">
        <button class="btn btn-default btn-block" @tap="cancelSession">
          取消
        </button>
        <button class="btn btn-success btn-block" @tap="saveSession">
          保存计分
        </button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useStore } from 'vuex'
import Security from '@/utils/security'

const store = useStore()

const currentSession = computed(() => store.getters['scoring/currentSession'])
const bowTypes = computed(() => store.getters['scoring/bowTypes'])
const distances = computed(() => store.getters['scoring/distances'])
const targetFaces = computed(() => store.getters['scoring/targetFaces'])
const getBowTypeLabel = computed(() => store.getters['scoring/getBowTypeLabel'])
const getTargetFaceLabel = computed(() => store.getters['scoring/getTargetFaceLabel'])
const isScoring = computed(() => store.getters['scoring/isScoring'])
const formattedElapsedTime = computed(() => store.getters['scoring/formattedElapsedTime'])

const formData = ref({
  bowType: 'recurve',
  distance: 18,
  targetFace: '80cm',
  totalRounds: 6,
  arrowsPerRound: 6
})

const bowTypeIndex = ref(1)
const distanceIndex = ref(0)
const targetFaceIndex = ref(1)

const currentRound = ref(0)
const currentArrow = ref(0)

const onBowTypeChange = (e) => {
  bowTypeIndex.value = e.detail.value
  formData.value.bowType = bowTypes.value[e.detail.value].value
}

const onDistanceChange = (e) => {
  distanceIndex.value = e.detail.value
  formData.value.distance = distances.value[e.detail.value]
}

const onTargetFaceChange = (e) => {
  targetFaceIndex.value = e.detail.value
  formData.value.targetFace = targetFaces.value[e.detail.value].value
}

const createSession = async () => {
  const sanitizedData = Security.sanitize(formData.value)
  
  const validation = Security.validateInput(sanitizedData.totalRounds, {
    required: true,
    type: 'number',
    min: 1,
    max: 20
  })
  
  if (!validation.valid) {
    uni.showToast({
      title: validation.errors[0],
      icon: 'none'
    })
    return
  }

  const result = await store.dispatch('scoring/createSession', {
    bowType: sanitizedData.bowType,
    distance: sanitizedData.distance,
    targetFace: sanitizedData.targetFace,
    totalRounds: sanitizedData.totalRounds,
    arrowsPerRound: sanitizedData.arrowsPerRound
  })

  if (result.success) {
    currentRound.value = 0
    currentArrow.value = 0
    uni.showToast({
      title: '计分开始',
      icon: 'success'
    })
  } else {
    uni.showToast({
      title: result.error || '创建失败',
      icon: 'none'
    })
  }
}

const selectArrow = (roundIndex, arrowIndex) => {
  currentRound.value = roundIndex
  currentArrow.value = arrowIndex
}

const inputScore = async (score) => {
  const numScore = score === 'M' ? 0 : Number(score)
  
  if (!Security.validateScore(numScore)) {
    uni.showToast({
      title: '无效的分数',
      icon: 'none'
    })
    return
  }

  const result = await store.dispatch('scoring/updateScore', {
    roundIndex: currentRound.value,
    arrowIndex: currentArrow.value,
    score: numScore
  })

  if (result.success) {
    uni.vibrateShort()
    
    const session = currentSession.value
    const nextArrow = currentArrow.value + 1
    const nextRound = currentRound.value
    
    if (nextArrow < session.arrowsPerRound) {
      currentArrow.value = nextArrow
    } else if (nextRound < session.totalRounds - 1) {
      currentRound.value = nextRound + 1
      currentArrow.value = 0
    }
  } else {
    uni.showToast({
      title: result.error || '更新失败',
      icon: 'none'
    })
  }
}

const saveSession = async () => {
  uni.showModal({
    title: '保存计分',
    content: '确定要保存本次计分记录吗？',
    success: async (res) => {
      if (res.confirm) {
        const result = await store.dispatch('scoring/saveSession')
        if (result.success) {
          uni.showToast({
            title: '保存成功',
            icon: 'success'
          })
          uni.navigateBack()
          resetForm()
        } else {
          uni.showToast({
            title: result.error || '保存失败',
            icon: 'none'
          })
        }
      }
    }
  })
}

const cancelSession = async () => {
  uni.showModal({
    title: '取消计分',
    content: '确定要取消本次计分吗？未保存的数据将丢失。',
    success: async (res) => {
      if (res.confirm) {
        const result = await store.dispatch('scoring/cancelSession')
        if (result.success) {
          uni.showToast({
            title: '已取消',
            icon: 'success'
          })
          uni.navigateBack()
          resetForm()
        }
      }
    }
  })
}

const resetForm = () => {
  formData.value = {
    bowType: 'recurve',
    distance: 18,
    targetFace: '80cm',
    totalRounds: 6,
    arrowsPerRound: 6
  }
  bowTypeIndex.value = 1
  distanceIndex.value = 0
  targetFaceIndex.value = 1
  currentRound.value = 0
  currentArrow.value = 0
}
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  padding: 32rpx;
}

.setup-screen {
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 64rpx);
}

.setup-content {
  text-align: center;
  margin: 64rpx 0;
}

.setup-title {
  display: block;
  font-size: 48rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 16rpx;
}

.setup-subtitle {
  display: block;
  font-size: 28rpx;
  color: #999;
}

.form-section {
  flex: 1;
}

.form-item {
  margin-bottom: 32rpx;
}

.form-label {
  display: block;
  font-size: 28rpx;
  color: #666;
  margin-bottom: 16rpx;
}

.form-input {
  width: 100%;
  height: 88rpx;
  padding: 0 24rpx;
  background: #fff;
  border: 2rpx solid #e5e5e5;
  border-radius: 12rpx;
  font-size: 28rpx;
  color: #333;

  &::placeholder {
    color: #ccc;
  }
}

.picker {
  height: 88rpx;
  padding: 0 24rpx;
  background: #fff;
  border: 2rpx solid #e5e5e5;
  border-radius: 12rpx;
  font-size: 28rpx;
  color: #333;
  line-height: 88rpx;
}

.scoring-screen {
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 64rpx);
}

.session-info {
  text-align: center;
  padding: 32rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16rpx;
  margin-bottom: 24rpx;
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

.info-time {
  display: block;
  font-size: 32rpx;
  font-weight: bold;
  color: #fff;
  margin-top: 8rpx;
}

.score-display {
  text-align: center;
  padding: 48rpx;
  background: #fff;
  border-radius: 16rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
}

.score-label {
  display: block;
  font-size: 28rpx;
  color: #999;
  margin-bottom: 16rpx;
}

.score-value {
  display: block;
  font-size: 96rpx;
  font-weight: bold;
  color: #667eea;
  line-height: 1;
}

.rounds-container {
  flex: 1;
  overflow-y: auto;
  margin-bottom: 24rpx;
}

.round-card {
  background: #fff;
  border-radius: 12rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
}

.round-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.round-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}

.round-score {
  font-size: 28rpx;
  color: #667eea;
}

.arrows-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 12rpx;
}

.arrow-item {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  border: 2rpx solid #e5e5e5;
  border-radius: 8rpx;
  transition: all 0.3s;

  &.active {
    background: #667eea;
    border-color: #667eea;
  }

  &:active {
    transform: scale(0.95);
  }
}

.arrow-score {
  font-size: 28rpx;
  font-weight: bold;
  color: #666;

  .arrow-item.active & {
    color: #fff;
  }
}

.score-input-section {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
}

.score-buttons {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 12rpx;
}

.score-btn {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 12rpx;
  font-size: 32rpx;
  font-weight: bold;
  color: #fff;
  transition: all 0.3s;

  &:active {
    transform: scale(0.95);
    opacity: 0.8;
  }

  &.score-m {
    background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
  }
}

.action-section {
  display: flex;
  gap: 16rpx;
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
  }

  &-success {
    background: linear-gradient(135deg, #4cd964 0%, #2ac845 100%);
  }

  &-default {
    background: #fff;
    color: #666;
    border: 2rpx solid #e5e5e5;
  }

  &-block {
    flex: 1;
  }

  &-lg {
    height: 96rpx;
  }

  &:active {
    opacity: 0.8;
  }
}
</style>