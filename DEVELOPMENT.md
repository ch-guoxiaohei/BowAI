# 开发指南

本文档提供了射箭辅助工具项目的开发指南，包括开发环境设置、代码规范、测试等内容。

## 目录

1. [开发环境设置](#开发环境设置)
2. [项目结构](#项目结构)
3. [开发工作流](#开发工作流)
4. [代码规范](#代码规范)
5. [组件开发](#组件开发)
6. [状态管理](#状态管理)
7. [路由管理](#路由管理)
8. [样式开发](#样式开发)
9. [调试](#调试)
10. [测试](#测试)
11. [构建与部署](#构建与部署)
12. [常见问题](#常见问题)

## 开发环境设置

### 必需工具

1. **Node.js** (>= 18.0.0)
   ```bash
   node --version
   ```

2. **npm** (>= 9.0.0)
   ```bash
   npm --version
   ```

3. **HBuilderX**（推荐）或 **VS Code**

### 安装步骤

1. 克隆项目
   ```bash
   git clone <repository-url>
   cd archer-assistant
   ```

2. 安装依赖
   ```bash
   npm install
   ```

3. 运行开发服务器
   ```bash
   # H5 开发
   npm run dev:h5

   # 微信小程序开发
   npm run dev:mp-weixin

   # App 开发
   npm run dev:app
   ```

### VS Code 插件推荐

- Volar (Vue 3 支持)
- ESLint
- Prettier
- SCSS IntelliSense
- Uni-app Snippets

## 项目结构

```
archer-assistant/
├── src/
│   ├── pages/              # 页面组件
│   │   ├── index/         # 首页
│   │   ├── training/      # 训练页面
│   │   ├── scoring/       # 计分页面
│   │   ├── history/       # 历史记录
│   │   └── settings/      # 设置页面
│   ├── components/        # 公共组件（可选）
│   ├── store/             # Vuex 状态管理
│   ├── utils/             # 工具函数
│   ├── styles/            # 全局样式
│   ├── static/            # 静态资源
│   ├── App.vue            # 根组件
│   ├── main.js            # 入口文件
│   ├── manifest.json      # 应用配置
│   └── pages.json         # 页面路由配置
├── public/                # 公共静态资源
├── package.json
├── vite.config.js
├── .eslintrc.js
└── README.md
```

## 开发工作流

### 1. 创建新功能

```bash
# 创建新分支
git checkout -b feature/your-feature-name

# 开发功能
# ...

# 提交代码
git add .
git commit -m "feat: 添加新功能描述"

# 推送到远程
git push origin feature/your-feature-name
```

### 2. 代码审查流程

1. 创建 Pull Request
2. 等待代码审查
3. 根据反馈修改代码
4. 合并到主分支

### 3. 发布流程

```bash
# 更新版本号
npm version patch/minor/major

# 构建生产版本
npm run build:h5

# 提交标签
git push origin --tags
```

## 代码规范

### JavaScript/Vue 规范

#### 1. 组件命名

```javascript
// ✅ 正确：PascalCase
export default {
  name: 'TrainingCounter'
}

// ❌ 错误：kebab-case
export default {
  name: 'training-counter'
}
```

#### 2. 文件命名

```
// ✅ 正确：kebab-case
training-counter.vue
user-profile.vue

// ❌ 错误：camelCase
trainingCounter.vue
```

#### 3. 变量命名

```javascript
// ✅ 正确：camelCase
const userName = 'John'
const getUserInfo = () => {}

// ❌ 错误：snake_case
const user_name = 'John'
const get_user_info = () => {}
```

#### 4. 常量命名

```javascript
// ✅ 正确：UPPER_SNAKE_CASE
const MAX_SCORE = 10
const DEFAULT_TIMEOUT = 5000

// ❌ 错误：camelCase
const maxScore = 10
```

### Vue 3 Composition API 规范

#### 1. 使用 `<script setup>`

```vue
<script setup>
import { ref, computed } from 'vue'

const count = ref(0)
const doubled = computed(() => count.value * 2)
</script>
```

#### 2. Props 定义

```vue
<script setup>
const props = defineProps({
  title: {
    type: String,
    required: true
  },
  count: {
    type: Number,
    default: 0,
    validator: (value) => value >= 0
  }
})
</script>
```

#### 3. Emits 定义

```vue
<script setup>
const emit = defineEmits(['update', 'delete'])

const handleUpdate = () => {
  emit('update', newValue)
}
</script>
```

### 样式规范

#### 1. 使用 SCSS

```vue
<style lang="scss" scoped>
.container {
  padding: 16px;
  
  &__title {
    font-size: 18px;
  }
}
</style>
```

#### 2. 使用 CSS 变量

```vue
<style lang="scss" scoped>
.container {
  color: var(--text-color);
  background: var(--background-color);
}
</style>
```

## 组件开发

### 创建新组件

```vue
<template>
  <view class="my-component">
    <text>{{ title }}</text>
  </view>
</template>

<script setup>
import { defineProps } from 'vue'

const props = defineProps({
  title: {
    type: String,
    required: true
  }
})
</script>

<style lang="scss" scoped>
.my-component {
  padding: 16px;
  background: #fff;
}
</style>
```

### 组件通信

#### 父传子（Props）

```vue
<!-- 父组件 -->
<template>
  <ChildComponent :message="parentMessage" />
</template>

<!-- 子组件 -->
<script setup>
const props = defineProps({
  message: String
})
</script>
```

#### 子传父（Emits）

```vue
<!-- 子组件 -->
<script setup>
const emit = defineEmits(['update'])

const handleClick = () => {
  emit('update', newValue)
}
</script>

<!-- 父组件 -->
<template>
  <ChildComponent @update="handleUpdate" />
</template>
```

#### 状态共享（Vuex）

```javascript
// 组件中使用
import { useStore } from 'vuex'

const store = useStore()
const count = computed(() => store.state.count)

const increment = () => {
  store.commit('increment')
}
```

## 状态管理

### Vuex Store 结构

```javascript
export default {
  namespaced: true,
  
  state: {
    data: []
  },
  
  getters: {
    filteredData: (state) => (filter) => {
      return state.data.filter(item => item.type === filter)
    }
  },
  
  mutations: {
    SET_DATA(state, payload) {
      state.data = payload
    }
  },
  
  actions: {
    async fetchData({ commit }) {
      const data = await api.getData()
      commit('SET_DATA', data)
    }
  }
}
```

### 在组件中使用

```javascript
import { computed } from 'vue'
import { useStore } from 'vuex'

const store = useStore()

// 访问 state
const data = computed(() => store.state.moduleName.data)

// 访问 getters
const filtered = computed(() => store.getters['moduleName/filteredData']('type'))

// 调用 actions
const fetchData = () => {
  store.dispatch('moduleName/fetchData')
}

// 调用 mutations
const updateData = (newData) => {
  store.commit('moduleName/SET_DATA', newData)
}
```

## 路由管理

### 页面配置（pages.json）

```json
{
  "pages": [
    {
      "path": "pages/index/index",
      "style": {
        "navigationBarTitleText": "首页"
      }
    }
  ],
  "tabBar": {
    "list": [
      {
        "pagePath": "pages/index/index",
        "text": "首页"
      }
    ]
  }
}
```

### 页面跳转

```javascript
// 保留当前页面，跳转到应用内的某个页面
uni.navigateTo({
  url: '/pages/detail/detail?id=1'
})

// 关闭当前页面，跳转到应用内的某个页面
uni.redirectTo({
  url: '/pages/login/login'
})

// 跳转到 tabBar 页面，并关闭其他所有非 tabBar 页面
uni.switchTab({
  url: '/pages/index/index'
})

// 关闭所有页面，打开到应用内的某个页面
uni.reLaunch({
  url: '/pages/index/index'
})

// 返回上一页面或多级页面
uni.navigateBack({
  delta: 1
})
```

## 样式开发

### 使用全局变量

```scss
@import '@/styles/variables.scss';

.my-component {
  color: $primary-color;
  padding: $spacing-md;
  border-radius: $border-radius-md;
}
```

### 响应式设计

```scss
.container {
  padding: 16px;
  
  @media (min-width: 768px) {
    padding: 24px;
  }
}
```

### 深色模式支持

```scss
.container {
  background: #fff;
  color: #333;
  
  .dark-mode & {
    background: #333;
    color: #fff;
  }
}
```

## 调试

### 1. 控制台调试

```javascript
console.log('调试信息', data)
console.error('错误信息', error)
console.warn('警告信息', warning)
```

### 2. Vue DevTools

安装 Vue DevTools 浏览器扩展，可以：
- 查看组件树
- 检查组件状态
- 调试 Vuex 状态
- 追踪事件

### 3. 断点调试

在 VS Code 中设置断点：
```javascript
const result = calculateScore(score) // 在这里设置断点
console.log(result)
```

### 4. 网络调试

使用浏览器开发者工具查看网络请求：
```javascript
// 查看所有请求
console.log('API Request', url, data)

// 查看响应
console.log('API Response', response)
```

## 测试

### 单元测试（推荐）

```javascript
import { describe, it, expect } from 'vitest'
import { calculateScore } from '@/utils/helpers'

describe('calculateScore', () => {
  it('should calculate correct score', () => {
    const scores = [10, 9, 8, 7, 6, 5]
    const result = calculateScore(scores)
    expect(result).toBe(45)
  })
})
```

### 手动测试清单

- [ ] 所有页面正常加载
- [ ] 所有按钮可点击
- [ ] 表单验证正常工作
- [ ] 数据正确保存和读取
- [ ] 页面跳转正常
- [ ] 错误处理正确
- [ ] 在不同设备上测试

## 构建与部署

### 构建 H5 版本

```bash
npm run build:h5
```

构建产物在 `dist/build/h5` 目录。

### 构建微信小程序

```bash
npm run build:mp-weixin
```

构建产物在 `dist/build/mp-weixin` 目录。

### 构建 App

#### 使用 HBuilderX

1. 用 HBuilderX 打开项目
2. 点击"发行" -> "原生App-云打包"
3. 选择平台（Android/iOS）
4. 配置证书
5. 点击打包

#### 使用本地打包

```bash
npm run build:app
```

然后使用 Android Studio 或 Xcode 打开生成的项目进行打包。

### 部署 H5

将 `dist/build/h5` 目录部署到任何静态文件服务器：
- Nginx
- Apache
- Vercel
- Netlify

## 常见问题

### 1. 依赖安装失败

```bash
# 清除缓存
npm cache clean --force

# 删除 node_modules
rm -rf node_modules

# 重新安装
npm install
```

### 2. 构建失败

```bash
# 检查 Node.js 版本
node --version

# 更新依赖
npm update

# 清除构建缓存
rm -rf dist
```

### 3. 样式不生效

- 检查 `scoped` 属性
- 检查样式优先级
- 检查 SCSS 语法
- 清除浏览器缓存

### 4. 状态不更新

- 检查 Vuex 模块是否正确注册
- 检查 mutation/action 路径
- 检查是否使用 `computed` 访问状态
- 检查是否正确调用 `commit/dispatch`

### 5. 页面跳转失败

- 检查页面路径是否正确
- 检查 `pages.json` 配置
- 检查跳转方法是否正确
- 检查参数编码

## 性能优化

### 1. 代码分割

```javascript
// 动态导入组件
const HeavyComponent = defineAsyncComponent(() => 
  import('@/components/HeavyComponent.vue')
)
```

### 2. 图片优化

- 使用合适的图片格式
- 压缩图片
- 使用懒加载

### 3. 列表优化

```vue
<template>
  <view v-for="item in list" :key="item.id">
    {{ item.name }}
  </view>
</template>
```

### 4. 防抖和节流

```javascript
import { debounce, throttle } from '@/utils/helpers'

const handleInput = debounce((value) => {
  // 处理输入
}, 300)

const handleScroll = throttle(() => {
  // 处理滚动
}, 100)
```

## 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 许可证

MIT License

---

**最后更新：** 2026-04-14