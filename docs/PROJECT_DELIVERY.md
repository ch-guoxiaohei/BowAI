# 射箭辅助工具 - 项目交付文档

## 项目概述

本项目是一个基于 uni-app 开发的专业射箭训练辅助工具，旨在帮助射箭爱好者记录训练数据、计算成绩、提升训练效果。

## 技术栈

- **前端框架**：Vue 3 (Composition API)
- **构建工具**：Vite
- **跨平台框架**：uni-app
- **状态管理**：Vuex 4
- **样式预处理**：SCSS
- **代码规范**：ESLint

## 支持平台

- ✅ H5 网页应用
- ✅ 微信小程序
- ✅ Android 原生应用
- ✅ iOS 原生应用

## 核心功能

### 1. 训练计数器
- 记录训练开始和结束时间
- 实时显示训练时长
- 记录射箭数量
- 支持添加训练备注
- 记录天气和地点信息

### 2. 计分系统
- 支持多种弓种（传统弓、反曲弓、复合弓、光弓）
- 支持多种距离（18m、30m、50m、60m、70m、90m）
- 支持多种靶纸（122cm、80cm、60cm、40cm）
- 自定义组数和每组箭数
- 实时计算总分
- 支持脱靶（M）记录

### 3. 历史记录
- 查看所有训练记录
- 查看所有计分记录
- 按时间排序
- 显示详细信息

### 4. 设置
- 个人信息管理
- 偏好设置
- 数据导出
- 数据清除

## 项目结构

```
archer-assistant/
├── src/
│   ├── pages/              # 页面组件
│   │   ├── index/         # 首页
│   │   ├── training/      # 训练计数器
│   │   ├── scoring/       # 计分系统
│   │   ├── history/       # 历史记录
│   │   └── settings/      # 设置
│   ├── store/             # Vuex 状态管理
│   │   ├── modules/
│   │   │   ├── app.js     # 应用状态
│   │   │   ├── training.js # 训练模块
│   │   │   └── scoring.js # 计分模块
│   │   └── index.js
│   ├── utils/             # 工具函数
│   │   ├── storage.js     # 存储工具
│   │   ├── security.js    # 安全工具
│   │   ├── helpers.js     # 辅助函数
│   │   └── index.js
│   ├── styles/            # 样式文件
│   │   ├── variables.scss # 变量
│   │   └── index.scss     # 全局样式
│   ├── App.vue            # 应用根组件
│   ├── main.js            # 入口文件
│   ├── manifest.json      # 应用配置
│   └── pages.json         # 页面配置
├── package.json
├── vite.config.js
├── .eslintrc.js
├── .gitignore
├── README.md
├── SECURITY.md
├── DEVELOPMENT.md
└── PROJECT_DELIVERY.md
```

## 安全特性

### 1. 输入验证与清理
- 所有用户输入都经过验证和清理
- 防止 XSS 攻击
- 数据类型验证

### 2. 数据安全
- 本地存储，不上传服务器
- 支持数据导出和备份
- 用户可主动清除数据

### 3. 代码安全
- 使用 ESLint 进行代码检查
- 遵循安全编码规范
- 定期依赖更新

## 快速开始

### 环境要求
- Node.js >= 18.0.0
- npm >= 9.0.0
- HBuilderX（推荐）或 VS Code

### 安装依赖

```bash
npm install
```

### 开发运行

```bash
# H5
npm run dev:h5

# 微信小程序
npm run dev:mp-weixin

# Android App
npm run dev:app

# iOS App
npm run dev:app-ios
```

### 生产构建

```bash
# H5
npm run build:h5

# 微信小程序
npm run build:mp-weixin

# Android App
npm run build:app

# iOS App
npm run build:app-ios
```

## 代码规范

### 1. 组件命名
- 组件名：PascalCase
- 文件名：kebab-case
- 变量/函数：camelCase
- 常量：UPPER_SNAKE_CASE

### 2. Vue 3 最佳实践
- 使用 `<script setup>` 语法
- 使用 Composition API
- Props 和 Emits 必须定义类型
- 使用计算属性优化性能

### 3. 安全编码
- 所有用户输入必须验证和清理
- 避免使用 `v-html`
- 使用参数化查询
- 敏感数据加密存储

## 测试建议

### 1. 功能测试
- [ ] 训练计数器功能正常
- [ ] 计分系统功能正常
- [ ] 历史记录显示正确
- [ ] 设置功能正常
- [ ] 数据持久化正常

### 2. 安全测试
- [ ] 输入验证有效
- [ ] XSS 防护有效
- [ ] 数据存储安全
- [ ] 错误处理正确

### 3. 兼容性测试
- [ ] H5 各浏览器兼容
- [ ] 微信小程序兼容
- [ ] Android 设备兼容
- [ ] iOS 设备兼容

## 部署指南

### H5 部署

1. 构建项目
```bash
npm run build:h5
```

2. 将 `dist/build/h5` 目录部署到静态服务器

### 微信小程序部署

1. 构建项目
```bash
npm run build:mp-weixin
```

2. 使用微信开发者工具打开 `dist/build/mp-weixin` 目录

3. 配置 AppID

4. 上传代码并提交审核

### App 部署

#### Android

1. 使用 HBuilderX 云打包
2. 或使用本地打包（需要 Android Studio）
3. 签名 APK
4. 上传到应用商店

#### iOS

1. 使用 HBuilderX 云打包
2. 或使用本地打包（需要 Mac 和 Xcode）
3. 配置证书和描述文件
4. 上传到 App Store

## 已知限制

1. **延迟录像功能**：由于小程序 API 限制，暂未实现完整功能
2. **数据同步**：目前仅支持本地存储，不支持云端同步
3. **社交功能**：暂未实现社交分享功能
4. **AI 分析**：暂未实现 AI 动作分析功能

## 后续优化方向

### 短期（1-2个月）
- [ ] 添加数据统计图表
- [ ] 优化 UI/UX 设计
- [ ] 添加训练计划功能
- [ ] 支持数据导入导出

### 中期（3-6个月）
- [ ] 实现延迟录像功能（桌面版）
- [ ] 添加云端数据同步
- [ ] 实现社交分享功能
- [ ] 支持多语言

### 长期（6个月以上）
- [ ] AI 动作分析
- [ ] 在线比赛功能
- [ ] 社区功能
- [ ] 教练端功能

## 维护与支持

### 1. 依赖更新
定期更新依赖包，修复安全漏洞：
```bash
npm audit
npm audit fix
npm update
```

### 2. 代码检查
运行 ESLint 检查代码质量：
```bash
npm run lint
npm run lint:fix
```

### 3. 性能监控
监控应用性能，优化加载速度和响应时间。

### 4. 用户反馈
收集用户反馈，持续改进产品。

## 文档

- [README.md](./README.md) - 项目介绍和快速开始
- [SECURITY.md](./SECURITY.md) - 安全指南
- [DEVELOPMENT.md](./DEVELOPMENT.md) - 开发指南
- [POC文档.md](./POC文档.md) - POC 文档

## 许可证

MIT License

## 联系方式

如有问题或建议，请通过以下方式联系：
- 提交 Issue
- 发送邮件

## 致谢

感谢所有为本项目做出贡献的开发者和用户。

---

**项目版本**：v1.0.0  
**交付日期**：2026-04-14  
**开发团队**：Archer Assistant Team