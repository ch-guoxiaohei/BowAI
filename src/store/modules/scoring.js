import Storage from '@/utils/storage'
import { generateId } from '@/utils/helpers'

const SCORING_STORAGE_KEY = 'scoring_sessions'
const DEFAULT_PAGE_SIZE = 10

const BOW_TYPES = [
  { value: 'traditional', label: '传统弓' },
  { value: 'recurve', label: '反曲弓' },
  { value: 'compound', label: '复合弓' },
  { value: 'barebow', label: '光弓' }
]

const DISTANCES = [18, 30, 50, 60, 70, 90]

const TARGET_FACES = [
  { value: '122cm', label: '122cm 靶纸' },
  { value: '80cm', label: '80cm 靶纸' },
  { value: '60cm', label: '60cm 靶纸' },
  { value: '40cm', label: '40cm 靶纸' }
]

const state = {
  currentSession: null,
  sessions: [],
  allFilteredSessions: [],
  bowTypes: BOW_TYPES,
  distances: DISTANCES,
  targetFaces: TARGET_FACES,
  isScoring: false,
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
  UPDATE_SCORE(state, { roundIndex, arrowIndex, score }) {
    if (state.currentSession && state.currentSession.scores[roundIndex]) {
      state.currentSession.scores[roundIndex][arrowIndex] = score
      state.currentSession.totalScore = calculateTotalScore(state.currentSession.scores)
    }
  },
  SET_SCORING_STATUS(state, status) {
    state.isScoring = status
  },
  SET_TIMER(state, timer) {
    state.timer = timer
  },
  SET_ELAPSED_TIME(state, time) {
    state.elapsedTime = time
  }
}

function calculateTotalScore(scores) {
  return scores.reduce((roundSum, round) => {
    return roundSum + round.reduce((arrowSum, score) => arrowSum + score, 0)
  }, 0)
}

const actions = {
  async loadSessions({ commit }) {
    try {
      const sessions = await Storage.get(SCORING_STORAGE_KEY)
      commit('SET_SESSIONS', sessions || [])
      return sessions || []
    } catch (error) {
      console.error('加载计分记录失败:', error)
      commit('SET_SESSIONS', [])
      return []
    }
  },
  async loadPaginatedSessions({ commit }, { page = 1, pageSize = DEFAULT_PAGE_SIZE, startDate, endDate } = {}) {
    try {
      let data = await Storage.get(SCORING_STORAGE_KEY) || []
      
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
              const endFilterDateWithTime = new Date(endDate)
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
      console.error('加载分页计分记录失败:', error)
      return { success: false, error: error.message }
    }
  },
  async saveSessions({ state }) {
    try {
      await Storage.set(SCORING_STORAGE_KEY, state.sessions)
      return true
    } catch (error) {
      console.error('保存计分记录失败:', error)
      return false
    }
  },
  async createSession({ commit, state }, { bowType, distance, targetFace, totalRounds, arrowsPerRound }) {
    try {
      const now = new Date()
      const currentDateTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
      
      const scores = Array(totalRounds).fill(null).map(() => 
        Array(arrowsPerRound).fill(0)
      )
      
      const session = {
        id: generateId(),
        bowType,
        distance,
        targetFace,
        totalRounds,
        arrowsPerRound,
        scores,
        totalScore: 0,
        date: new Date().toISOString(),
        startTime: currentDateTime,
        endTime: null,
        duration: 0,
        notes: ''
      }
      
      commit('SET_CURRENT_SESSION', session)
      commit('SET_SCORING_STATUS', true)
      commit('SET_ELAPSED_TIME', 0)
      
      const timer = setInterval(() => {
        commit('SET_ELAPSED_TIME', state.elapsedTime + 1)
      }, 1000)
      
      commit('SET_TIMER', timer)
      
      return { success: true, session }
    } catch (error) {
      console.error('创建计分会话失败:', error)
      return { success: false, error: error.message }
    }
  },
  async updateScore({ commit, state, dispatch }, { roundIndex, arrowIndex, score }) {
    try {
      if (!state.currentSession) {
        return { success: false, error: '没有活动的计分会话' }
      }
      
      commit('UPDATE_SCORE', { roundIndex, arrowIndex, score })
      
      const updatedSession = { ...state.currentSession }
      commit('UPDATE_SESSION', updatedSession)
      
      return { success: true, totalScore: state.currentSession.totalScore }
    } catch (error) {
      console.error('更新分数失败:', error)
      return { success: false, error: error.message }
    }
  },
  async saveSession({ commit, state, dispatch }, notes = '') {
    try {
      if (!state.currentSession) {
        return { success: false, error: '没有活动的计分会话' }
      }
      
      if (state.timer) {
        clearInterval(state.timer)
        commit('SET_TIMER', null)
      }
      
      const endTime = new Date().toISOString()
      const duration = state.elapsedTime
      
      const session = {
        ...state.currentSession,
        endTime,
        duration,
        notes: notes || ''
      }
      
      commit('ADD_SESSION', session)
      await dispatch('saveSessions')
      commit('SET_CURRENT_SESSION', null)
      commit('SET_SCORING_STATUS', false)
      
      return { success: true, session }
    } catch (error) {
      console.error('保存计分会话失败:', error)
      return { success: false, error: error.message }
    }
  },
  async cancelSession({ commit, state }) {
    try {
      if (state.timer) {
        clearInterval(state.timer)
        commit('SET_TIMER', null)
      }
      
      commit('SET_CURRENT_SESSION', null)
      commit('SET_SCORING_STATUS', false)
      return { success: true }
    } catch (error) {
      console.error('取消计分会话失败:', error)
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
      console.error('删除计分记录失败:', error)
      return { success: false, error: error.message }
    }
  },
  async updateSessionNotes({ commit, dispatch, state }, { sessionId, notes }) {
    try {
      const sessions = state.sessions.map(session => {
        if (session.id === sessionId) {
          return { ...session, notes }
        }
        return session
      })
      
      commit('SET_SESSIONS', sessions)
      await dispatch('saveSessions')
      return { success: true }
    } catch (error) {
      console.error('更新计分记录备注失败:', error)
      return { success: false, error: error.message }
    }
  }
}

const getters = {
  currentSession: (state) => state.currentSession,
  sessions: (state) => state.sessions,
  allFilteredSessions: (state) => state.allFilteredSessions,
  bowTypes: (state) => state.bowTypes,
  distances: (state) => state.distances,
  targetFaces: (state) => state.targetFaces,
  getBowTypeLabel: (state) => (value) => {
    const bowType = state.bowTypes.find(bt => bt.value === value)
    return bowType ? bowType.label : value
  },
  getTargetFaceLabel: (state) => (value) => {
    const targetFace = state.targetFaces.find(tf => tf.value === value)
    return targetFace ? targetFace.label : value
  },
  averageScore: (state) => {
    if (state.sessions.length === 0) return 0
    
    const totalScore = state.sessions.reduce((sum, session) => sum + session.totalScore, 0)
    const totalArrows = state.sessions.reduce((sum, session) => 
      sum + (session.totalRounds * session.arrowsPerRound), 0
    )
    
    return totalArrows > 0 ? (totalScore / totalArrows).toFixed(2) : 0
  },
  highestScore: (state) => {
    if (state.sessions.length === 0) return 0
    return Math.max(...state.sessions.map(s => s.totalScore))
  },
  recentSessions: (state) => state.sessions.slice(0, 10),
  isScoring: (state) => state.isScoring,
  elapsedTime: (state) => state.elapsedTime,
  totalArrows: (state) => {
    if (state.sessions.length === 0) return 0
    return state.sessions.reduce((sum, session) => 
      sum + (session.totalRounds * session.arrowsPerRound), 0
    )
  },
  totalDuration: (state) => {
    if (state.sessions.length === 0) return 0
    return state.sessions.reduce((sum, session) => sum + (session.duration || 0), 0)
  },
  pagination: (state) => state.pagination,
  isFirstPage: (state) => state.pagination.page === 1,
  isLastPage: (state) => state.pagination.page >= state.pagination.totalPages,
  formattedElapsedTime: (state) => {
    const hours = Math.floor(state.elapsedTime / 3600)
    const minutes = Math.floor((state.elapsedTime % 3600) / 60)
    const seconds = state.elapsedTime % 60
    
    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    }
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}