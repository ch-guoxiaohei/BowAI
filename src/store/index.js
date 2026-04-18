import { createStore } from 'vuex'
import app from './modules/app'
import training from './modules/training'
import scoring from './modules/scoring'

export default createStore({
  modules: {
    app,
    training,
    scoring
  },
  strict: process.env.NODE_ENV !== 'production'
})