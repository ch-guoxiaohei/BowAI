<script setup>
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'
import { useStore } from 'vuex'

const store = useStore()

onLaunch(() => {
  console.log('App Launch')
  store.dispatch('app/init')
})

onShow(() => {
  console.log('App Show')
})

onHide(() => {
  console.log('App Hide')
})
</script>

<style lang="scss">
@use '@/styles/index.scss' as *;

page {
  background-color: #f5f5f5;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>