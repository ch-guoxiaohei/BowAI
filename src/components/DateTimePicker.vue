<template>
  <view class="datetime-picker-container">
    <picker
      mode="multiSelector"
      :range="pickerData"
      :value="pickerValue"
      @change="onPickerChange"
      @columnchange="onColumnChange"
    >
      <view class="picker-display">
        <text v-if="displayValue" class="picker-text">{{ displayValue }}</text>
        <text v-else class="picker-placeholder">请选择时间</text>
      </view>
    </picker>
  </view>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

const pickerValue = ref([0, 0, 0, 0, 0])
const years = ref([])
const months = ref([])
const days = ref([])
const hours = ref([])
const minutes = ref([])

const pickerData = computed(() => [years.value, months.value, days.value, hours.value, minutes.value])

const displayValue = computed(() => {
  if (!props.modelValue) return ''
  
  if (props.modelValue.includes(' ')) {
    return props.modelValue
  }
  
  const date = new Date(props.modelValue)
  if (isNaN(date.getTime())) return props.modelValue
  
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')
  const second = String(date.getSeconds()).padStart(2, '0')
  
  if (isNaN(year) || isNaN(month) || isNaN(day) || isNaN(hour) || isNaN(minute)) {
    return props.modelValue
  }
  
  return `${year}-${month}-${day} ${hour}:${minute}:${second}`
})

const initPickerData = () => {
  const currentYear = new Date().getFullYear()
  
  years.value = Array.from({ length: 100 }, (_, i) => currentYear - 50 + i)
  months.value = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'))
  days.value = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'))
  hours.value = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'))
  minutes.value = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'))
}

const updatePickerValue = () => {
  if (!props.modelValue) {
    const now = new Date()
    pickerValue.value = [
      years.value.findIndex(y => y === now.getFullYear()),
      now.getMonth(),
      now.getDate() - 1,
      now.getHours(),
      now.getMinutes()
    ]
    return
  }
  
  const date = new Date(props.modelValue)
  if (isNaN(date.getTime())) return
  
  pickerValue.value = [
    years.value.findIndex(y => y === date.getFullYear()),
    date.getMonth(),
    date.getDate() - 1,
    date.getHours(),
    date.getMinutes()
  ]
}

const onPickerChange = (e) => {
  const value = e.detail.value
  const year = years.value[value[0]] || new Date().getFullYear()
  const month = months.value[value[1]] || '01'
  const day = days.value[value[2]] || '01'
  const hour = hours.value[value[3]] || '00'
  const minute = minutes.value[value[4]] || '00'
  const second = '00'
  
  const result = `${year}-${month}-${day} ${hour}:${minute}:${second}`
  console.log('DateTimePicker - onPickerChange:', result)
  emit('update:modelValue', result)
  emit('change', result)
}

const onColumnChange = (e) => {
  const { column, value } = e.detail
  
  if (column === 1) {
    updateDays(value)
  }
}

const updateDays = (monthIndex) => {
  const yearIndex = pickerValue.value[0]
  const year = years.value[yearIndex]
  const month = parseInt(months.value[monthIndex])
  
  const daysInMonth = new Date(year, month, 0).getDate()
  days.value = Array.from({ length: daysInMonth }, (_, i) => String(i + 1).padStart(2, '0'))
  
  const currentDay = pickerValue.value[2]
  if (currentDay >= daysInMonth) {
    pickerValue.value[2] = daysInMonth - 1
  }
}

watch(() => props.modelValue, updatePickerValue, { immediate: true })

onMounted(() => {
  initPickerData()
  updatePickerValue()
})
</script>

<style lang="scss" scoped>
.datetime-picker-container {
  width: 100%;
}

.picker-display {
  height: 88rpx;
  padding: 0 24rpx;
  background: #fff;
  border: 2rpx solid #e5e5e5;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.3s;

  &:active {
    border-color: #667eea;
    background: #f8f9ff;
  }
}

.picker-text {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}

.picker-placeholder {
  font-size: 28rpx;
  color: #ccc;
}
</style>