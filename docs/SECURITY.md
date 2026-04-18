# 安全指南

本文档说明了射箭辅助工具项目中的安全措施和最佳实践。

## 1. 输入验证与清理

### 1.1 用户输入清理

所有用户输入都通过 `Security.sanitize()` 方法进行清理：

```javascript
import { Security } from '@/utils/security'

const sanitizedData = Security.sanitize(userData)
```

**清理内容：**
- HTML 标签转义
- 特殊字符转义
- 防止 XSS 攻击

### 1.2 输入验证

使用 `Security.validateInput()` 进行输入验证：

```javascript
const validation = Security.validateInput(input, {
  required: true,
  maxLength: 100,
  minLength: 1,
  type: 'email', // 'email', 'phone', 'number'
  pattern: /regex/
})

if (!validation.valid) {
  console.error(validation.errors)
}
```

### 1.3 特定数据验证

**分数验证：**
```javascript
if (!Security.validateScore(score)) {
  throw new Error('无效的分数')
}
```

**箭数验证：**
```javascript
if (!Security.validateArrowCount(count)) {
  throw new Error('无效的箭数')
}
```

## 2. 数据存储安全

### 2.1 本地存储

所有数据存储在设备本地，不上传到服务器：

```javascript
import { Storage } from '@/utils/storage'

// 安全地存储数据
await Storage.set('key', sanitizedData)

// 安全地读取数据
const data = await Storage.get('key')
```

### 2.2 敏感数据处理

- 不存储密码等敏感信息
- 个人信息经过清理后存储
- 支持用户主动清除数据

### 2.3 数据导出

数据导出功能允许用户备份自己的数据：

```javascript
const data = {
  userInfo: sanitizedUserInfo,
  settings: sanitizedSettings,
  trainingSessions: sessions,
  scoringSessions: sessions
}

const jsonData = JSON.stringify(data, null, 2)
```

## 3. XSS 防护

### 3.1 HTML 转义

所有显示在页面上的用户输入都经过转义：

```javascript
const safeHtml = Security.escapeHtml(userInput)
```

### 3.2 Vue 自动转义

Vue 3 默认对插值表达式进行转义：

```vue
<template>
  <!-- 自动转义，安全 -->
  <div>{{ userInput }}</div>
  
  <!-- 需要手动转义 -->
  <div v-html="safeHtml"></div>
</template>
```

### 3.3 避免使用 v-html

尽量避免使用 `v-html`，如果必须使用，确保内容已经过转义：

```vue
<template>
  <div v-html="Security.escapeHtml(content)"></div>
</template>
```

## 4. JSON 处理安全

### 4.1 安全解析

使用 `Security.safeParseJSON()` 防止 JSON 解析错误：

```javascript
const data = Security.safeParseJSON(jsonString, defaultValue)
```

### 4.2 安全序列化

使用 `Security.safeStringify()` 防止序列化错误：

```javascript
const json = Security.safeStringify(obj, '{}')
```

## 5. 状态管理安全

### 5.1 Vuex Store 安全

- 在 mutation 中验证数据
- 使用严格模式（开发环境）
- 敏感操作添加权限检查

```javascript
const mutations = {
  SET_USER_INFO(state, userInfo) {
    // 验证数据
    if (!isValidUserInfo(userInfo)) {
      throw new Error('无效的用户信息')
    }
    state.userInfo = userInfo
  }
}
```

### 5.2 异步操作安全

所有异步操作都包含错误处理：

```javascript
const actions = {
  async saveData({ commit }, data) {
    try {
      const sanitized = Security.sanitize(data)
      await Storage.set('key', sanitized)
      return { success: true }
    } catch (error) {
      console.error('保存失败:', error)
      return { success: false, error: error.message }
    }
  }
}
```

## 6. 路由安全

### 6.1 页面跳转验证

在页面跳转前验证参数：

```javascript
const goToDetail = (id) => {
  if (!isValidId(id)) {
    uni.showToast({
      title: '无效的参数',
      icon: 'none'
    })
    return
  }
  
  uni.navigateTo({
    url: `/pages/detail?id=${encodeURIComponent(id)}`
  })
}
```

### 6.2 URL 参数编码

所有 URL 参数都进行编码：

```javascript
const url = `/pages/detail?id=${encodeURIComponent(id)}&name=${encodeURIComponent(name)}`
```

## 7. 组件安全

### 7.1 Props 验证

为组件 props 添加验证：

```javascript
const props = defineProps({
  score: {
    type: Number,
    required: true,
    validator: (value) => value >= 0 && value <= 10
  },
  notes: {
    type: String,
    default: '',
    validator: (value) => value.length <= 200
  }
})
```

### 7.2 事件处理

事件处理函数添加参数验证：

```javascript
const handleScoreChange = (score) => {
  if (!Security.validateScore(score)) {
    return
  }
  // 处理分数变化
}
```

## 8. 错误处理

### 8.1 全局错误处理

在应用入口添加全局错误处理：

```javascript
// main.js
app.config.errorHandler = (err, vm, info) => {
  console.error('全局错误:', err)
  // 上报错误（可选）
}
```

### 8.2 异步错误处理

所有异步操作都包含错误处理：

```javascript
try {
  await someAsyncOperation()
} catch (error) {
  console.error('操作失败:', error)
  uni.showToast({
    title: '操作失败',
    icon: 'none'
  })
}
```

## 9. 依赖安全

### 9.1 定期更新依赖

```bash
# 检查过时的依赖
npm outdated

# 更新依赖
npm update

# 审计安全漏洞
npm audit
npm audit fix
```

### 9.2 使用锁定文件

使用 `package-lock.json` 确保依赖版本一致。

## 10. 代码质量

### 10.1 ESLint 检查

项目配置了 ESLint 进行代码检查：

```bash
# 运行 ESLint
npm run lint

# 自动修复
npm run lint:fix
```

### 10.2 安全规则

ESLint 配置包含安全相关规则：
- 禁止使用 `eval()`
- 禁止使用 `v-html`（警告）
- 检测未使用的变量
- 检测潜在的安全问题

## 11. 最佳实践

### 11.1 永不信任用户输入

```javascript
// ❌ 错误：直接使用用户输入
const html = `<div>${userInput}</div>`

// ✅ 正确：清理用户输入
const html = `<div>${Security.escapeHtml(userInput)}</div>`
```

### 11.2 使用参数化查询

虽然本项目使用本地存储，但如果将来使用数据库，应使用参数化查询防止 SQL 注入。

### 11.3 最小权限原则

- 只请求必要的权限
- 及时释放不再需要的权限
- 不存储不必要的敏感信息

### 11.4 安全的默认值

```javascript
// ✅ 使用安全的默认值
const score = Number(userInput) || 0

// ❌ 不安全的默认值
const score = userInput
```

## 12. 测试安全

### 12.1 安全测试

建议添加安全测试用例：
- XSS 攻击测试
- SQL 注入测试（如果使用数据库）
- 输入验证测试
- 权限测试

### 12.2 渗透测试

在发布前进行渗透测试，发现潜在的安全漏洞。

## 13. 隐私保护

### 13.1 数据最小化

只收集和存储必要的数据：
- 不收集不必要的个人信息
- 不收集设备指纹等敏感信息

### 13.2 用户控制

用户可以：
- 查看所有存储的数据
- 导出自己的数据
- 删除所有数据

### 13.3 透明度

在设置中明确告知用户：
- 数据存储位置
- 数据使用方式
- 用户权利

## 14. 更新与维护

### 14.1 定期安全审计

定期进行安全审计：
- 代码审查
- 依赖检查
- 漏洞扫描

### 14.2 安全更新

及时更新：
- 依赖包
- 框架版本
- 安全补丁

## 15. 应急响应

### 15.1 安全事件响应

如果发现安全漏洞：
1. 立即评估影响范围
2. 修复漏洞
3. 通知用户（如必要）
4. 发布更新

### 15.2 漏洞报告

提供漏洞报告渠道，鼓励用户报告安全问题。

---

**重要提示：** 本项目专注于本地数据存储，不涉及网络通信，因此主要安全风险集中在输入验证和数据存储方面。如果将来添加网络功能，需要额外考虑网络安全、加密传输等问题。