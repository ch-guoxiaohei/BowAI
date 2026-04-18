import Storage from '@/utils/storage'
import { generateId } from '@/utils/helpers'

const TRAINING_STORAGE_KEY = 'counter_sessions'
const TRAINING_ARCHIVE_KEY = 'counter_sessions_archive'
const MAX_SESSIONS = 100
const DEFAULT_PAGE_SIZE = 10

const state = {
  currentSession: null,
  sessions: [],
  allFilteredSessions: [],
  isTraining: false,
  timer: null,
  elapsedTime: 0,
  pagination: {
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    total: 0,
    totalPages: 0
  }
}

const mutations = {
  SET_CURRENT_SESSION(state, session) {
    state.currentSession = session
  },
  SET_SESSIONS(state, sessions) {
    state.sessions = sessions
  },
  SET_PAGINATED_SESSIONS(state, { data, page, pageSize, total, totalPages }) {
    state.sessions = data
    state.pagination = { page, pageSize, total, totalPages }
  },
  SET_ALL_FILTERED_SESSIONS(state, sessions) {
    state.allFilteredSessions = sessions
  },
  ADD_SESSION(state, session) {
    state.sessions.unshift(session)
  },
  UPDATE_SESSION(state, session) {
    const index = state.sessions.findIndex(s => s.id === session.id)
    if (index !== -1) {
      state.sessions.splice(index, 1, session)
    }
  },
  SET_TRAINING_STATUS(state, status) {
    state.isTraining = status
  },
  SET_TIMER(state, timer) {
    state.timer = timer
  },
  SET_ELAPSED_TIME(state, time) {
    state.elapsedTime = time
  },
  INCREMENT_ARROW_COUNT(state) {
    if (state.currentSession) {
      state.currentSession.arrowCount += 1
    }
  },
  SET_PAGINATION(state, pagination) {
    state.pagination = { ...state.pagination, ...pagination }
  }
}

const actions = {
  async loadSessions({ commit }) {
    try {
      const sessions = await Storage.get(TRAINING_STORAGE_KEY)
      commit('SET_SESSIONS', sessions || [])
    } catch (error) {
      console.error('加载计数记录失败:', error)
      commit('SET_SESSIONS', [])
    }
  },
  async loadPaginatedSessions({ commit }, { page = 1, pageSize = DEFAULT_PAGE_SIZE, startDate, endDate } = {}) {
    try {
      let data = await Storage.get(TRAINING_STORAGE_KEY) || []
      
      if (startDate || endDate) {
        data = data.filter(session => {
          const sessionDate = new Date(session.startTime)
          if (isNaN(sessionDate.getTime())) {
            return false
          }
          
          let includeSession = true
          
          if (startDate) {
            const startFilterDate = new Date(startDate)
            if (!isNaN(startFilterDate.getTime())) {
              includeSession = includeSession && sessionDate >= startFilterDate
            }
          }
          
          if (endDate) {
            const endFilterDate = new Date(endDate)
            if (!isNaN(endFilterDate.getTime())) {
              const endFilterDateWithTime = new Date(endFilterDate)
              endFilterDateWithTime.setHours(23, 59, 59, 999)
              includeSession = includeSession && sessionDate <= endFilterDateWithTime
            }
          }
          
          return includeSession
        })
      }
      
      const total = data.length
      const totalPages = Math.ceil(total / pageSize)
      const startIndex = (page - 1) * pageSize
      const endIndex = startIndex + pageSize
      const paginatedData = data.slice(startIndex, endIndex)

      commit('SET_ALL_FILTERED_SESSIONS', data)
      commit('SET_PAGINATED_SESSIONS', {
        data: paginatedData,
        page,
        pageSize,
        total,
        totalPages
      })
      return { success: true }
    } catch (error) {
      console.error('加载分页计数记录失败:', error)
      return { success: false, error: error.message }
    }
  },
  async saveSessions({ state }) {
    try {
      await Storage.set(TRAINING_STORAGE_KEY, state.sessions)
      return true
    } catch (error) {
      console.error('保存计数记录失败:', error)
      return false
    }
  },
  async addSessionWithLimit({ commit, dispatch }, session) {
    try {
      const data = await Storage.get(TRAINING_STORAGE_KEY) || []
      data.unshift(session)

      let trimmed = false
      let removedItems = []

      if (data.length > MAX_SESSIONS) {
        removedItems = data.splice(MAX_SESSIONS)
        trimmed = true
      }

      await Storage.set(TRAINING_STORAGE_KEY, data)
      commit('SET_SESSIONS', data)

      if (removedItems.length > 0) {
        await dispatch('archiveSessions', removedItems)
      }

      return { success: true, data, trimmed, removedCount: removedItems.length }
    } catch (error) {
      console.error('添加计数记录失败:', error)
      return { success: false, error: error.message }
    }
  },
  async archiveSessions({ commit }, sessionsToArchive) {
    try {
      const existingArchive = await Storage.get(TRAINING_ARCHIVE_KEY) || []
      const updatedArchive = [...sessionsToArchive, ...existingArchive]
      await Storage.set(TRAINING_ARCHIVE_KEY, updatedArchive)
      return { success: true, archivedCount: sessionsToArchive.length }
    } catch (error) {
      console.error('归档计数记录失败:', error)
      return { success: false, error: error.message }
    }
  },
  async loadArchivedSessions({ commit }) {
    try {
      const archived = await Storage.get(TRAINING_ARCHIVE_KEY)
      return { success: true, data: archived || [] }
    } catch (error) {
      console.error('加载归档记录失败:', error)
      return { success: false, error: error.message }
    }
  },
  async deleteArchivedSession({ dispatch }, sessionId) {
    try {
      const archived = await Storage.get(TRAINING_ARCHIVE_KEY) || []
      const filtered = archived.filter(s => s.id !== sessionId)
      await Storage.set(TRAINING_ARCHIVE_KEY, filtered)
      return { success: true }
    } catch (error) {
      console.error('删除归档记录失败:', error)
      return { success: false, error: error.message }
    }
  },
  async getStorageStats() {
    try {
      const info = await Storage.getInfo()
      const sessions = await Storage.get(TRAINING_STORAGE_KEY) || []
      const archived = await Storage.get(TRAINING_ARCHIVE_KEY) || []

      return {
        success: true,
        currentSize: info.currentSize,
        limitSize: info.limitSize,
        usagePercentage: ((info.currentSize / info.limitSize) * 100).toFixed(2),
        activeSessions: sessions.length,
        archivedSessions: archived.length,
        totalSessions: sessions.length + archived.length
      }
    } catch (error) {
      console.error('获取存储统计失败:', error)
      return { success: false, error: error.message }
    }
  },
  async cleanupOldData({ dispatch }, daysToKeep = 90) {
    try {
      const data = await Storage.get(TRAINING_STORAGE_KEY) || []
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)

      const activeData = []
      const archivedData = []

      data.forEach(item => {
        const itemDate = new Date(item.startTime)
        if (itemDate < cutoffDate) {
          archivedData.push(item)
        } else {
          activeData.push(item)
        }
      })

      await Storage.set(TRAINING_STORAGE_KEY, activeData)

      if (archivedData.length > 0) {
        await dispatch('archiveSessions', archivedData)
      }

      return {
        success: true,
        archived: archivedData.length,
        remaining: activeData.length
      }
    } catch (error) {
      console.error('清理旧数据失败:', error)
      return { success: false, error: error.message }
    }
  },
  async startTraining({ commit, dispatch, state }, { startTime, endTime, notes, weather, location }) {
    try {
      const now = new Date()
      const currentDateTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
      
      const session = {
        id: generateId(),
        startTime: startTime || currentDateTime,
        endTime: endTime || null,
        arrowCount: 0,
        notes: notes || '',
        weather: weather || '',
        location: location || ''
      }
      
      commit('SET_CURRENT_SESSION', session)
      commit('SET_TRAINING_STATUS', true)
      commit('SET_ELAPSED_TIME', 0)
      
      const timer = setInterval(() => {
        commit('SET_ELAPSED_TIME', state.elapsedTime + 1)
      }, 1000)
      
      commit('SET_TIMER', timer)
      return { success: true, session }
    } catch (error) {
      console.error('开始训练失败:', error)
      return { success: false, error: error.message }
    }
  },
  async stopTraining({ commit, state, dispatch }) {
    try {
      console.log('stopTraining - state.currentSession:', state.currentSession)
      console.log('stopTraining - state.elapsedTime:', state.elapsedTime)
      
      if (state.timer) {
        clearInterval(state.timer)
        commit('SET_TIMER', null)
      }
      
      if (state.currentSession) {
        let endTime
        let duration
        
        if (state.currentSession.endTime) {
          endTime = state.currentSession.endTime
          const startDateTime = new Date(state.currentSession.startTime)
          const endDateTime = new Date(endTime)
          
          console.log('stopTraining - startDateTime:', startDateTime)
          console.log('stopTraining - endDateTime:', endDateTime)
          
          if (!isNaN(startDateTime.getTime()) && !isNaN(endDateTime.getTime())) {
            const calculatedDuration = Math.max(0, Math.floor((endDateTime - startDateTime) / 1000))
            console.log('stopTraining - calculatedDuration:', calculatedDuration)
            console.log('stopTraining - state.elapsedTime:', state.elapsedTime)
            
            duration = Math.max(calculatedDuration, state.elapsedTime)
            console.log('stopTraining - final duration:', duration)
          } else {
            duration = state.elapsedTime
            console.log('stopTraining - using elapsedTime as duration:', duration)
          }
        } else {
          endTime = new Date().toISOString()
          duration = state.elapsedTime
          console.log('stopTraining - no endTime set, using current time and elapsedTime:', duration)
        }
        
        const updatedSession = {
          ...state.currentSession,
          endTime,
          duration
        }
        
        console.log('stopTraining - updatedSession:', updatedSession)
        
        commit('SET_CURRENT_SESSION', null)
        await dispatch('saveSessions')
      }
      
      commit('SET_TRAINING_STATUS', false)
      return { success: true }
    } catch (error) {
      console.error('停止训练失败:', error)
      return { success: false, error: error.message }
    }
  },
  async addArrow({ commit, state, dispatch }) {
    try {
      if (!state.isTraining || !state.currentSession) {
        return { success: false, error: '当前没有进行中的训练' }
      }
      
      commit('INCREMENT_ARROW_COUNT')
      
      const updatedSession = { ...state.currentSession }
      commit('UPDATE_SESSION', updatedSession)
      
      return { success: true, arrowCount: state.currentSession.arrowCount }
    } catch (error) {
      console.error('添加箭数失败:', error)
      return { success: false, error: error.message }
    }
  },
  async deleteSession({ commit, dispatch, state }, sessionId) {
    try {
      const sessions = state.sessions.filter(s => s.id !== sessionId)
      commit('SET_SESSIONS', sessions)
      await dispatch('saveSessions')
      return { success: true }
    } catch (error) {
      console.error('删除训练记录失败:', error)
      return { success: false, error: error.message }
    }
  },
  async addSession({ commit, dispatch }, session) {
    try {
      commit('ADD_SESSION', session)
      await dispatch('saveSessions')
      return { success: true }
    } catch (error) {
      console.error('添加训练记录失败:', error)
      return { success: false, error: error.message }
    }
  },
  async updateSession({ commit, dispatch }, session) {
    try {
      commit('UPDATE_SESSION', session)
      await dispatch('saveSessions')
      return { success: true }
    } catch (error) {
      console.error('更新训练记录失败:', error)
      return { success: false, error: error.message }
    }
  }
}

const getters = {
  currentSession: (state) => state.currentSession,
  sessions: (state) => state.sessions,
  allFilteredSessions: (state) => state.allFilteredSessions,
  isTraining: (state) => state.isTraining,
  elapsedTime: (state) => state.elapsedTime,
  pagination: (state) => state.pagination,
  formattedElapsedTime: (state) => {
    console.log('formattedElapsedTime - state.elapsedTime:', state.elapsedTime)
    const hours = Math.floor(state.elapsedTime / 3600)
    const minutes = Math.floor((state.elapsedTime % 3600) / 60)
    const seconds = state.elapsedTime % 60
    
    console.log('formattedElapsedTime - hours:', hours, 'minutes:', minutes, 'seconds:', seconds)
    
    if (hours > 0) {
      const result = `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      console.log('formattedElapsedTime - result (with hours):', result)
      return result
    }
    const result = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    console.log('formattedElapsedTime - result (no hours):', result)
    return result
  },
  totalArrows: (state) => state.sessions.reduce((sum, session) => sum + session.arrowCount, 0),
  totalTrainingTime: (state) => state.sessions.reduce((sum, session) => sum + (session.duration || 0), 0),
  recentSessions: (state) => state.sessions.slice(0, 10),
  hasMorePages: (state) => state.pagination.page < state.pagination.totalPages,
  isFirstPage: (state) => state.pagination.page === 1,
  isLastPage: (state) => state.pagination.page >= state.pagination.totalPages
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}