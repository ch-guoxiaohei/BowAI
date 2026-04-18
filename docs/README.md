# 射箭辅助工具

基于 uni-app 开发的专业射箭训练辅助工具，帮助射箭爱好者记录训练数据、计算成绩、提升训练效果。

## 功能特性

### 核心功能
- **训练计数器**：记录训练时间、射箭数量、训练环境信息
- **计分系统**：支持多种弓种、距离、靶纸类型，自动计算总分
- **历史记录**：查看训练和计分历史，统计分析数据
- **个人设置**：个性化配置，数据管理

### 技术特点
- 基于 Vue 3 + Vite + uni-app 开发
- 支持 Android/iOS 原生应用
- 支持微信小程序
- 本地数据存储，保护隐私
- 响应式设计，适配多种设备

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

## 项目结构

```
archer-assistant/
├── src/
│   ├── pages/              # 页面
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
└── README.md
```

## 安全特性

### 输入验证
- 所有用户输入都经过验证和清理
- 防止 XSS 攻击
- 数据类型验证

### 数据安全
- 本地存储，不上传服务器
- 数据加密存储（可选）
- 支持数据导出和备份

### 代码安全
- 使用 ESLint 进行代码检查
- 遵循安全编码规范
- 定期依赖更新

## 开发规范

### 代码风格
- 使用 ESLint 进行代码检查
- 遵循 Vue 3 Composition API 规范
- 使用 SCSS 编写样式

### 命名规范
- 组件：PascalCase
- 文件：kebab-case
- 变量/函数：camelCase
- 常量：UPPER_SNAKE_CASE

### Git 提交规范
```
feat: 新功能
fix: 修复bug
docs: 文档更新
style: 代码格式调整
refactor: 重构
test: 测试相关
chore: 构建/工具相关
```

## 功能说明

### 训练计数器
- 记录训练开始和结束时间
- 实时显示训练时长
- 记录射箭数量
- 支持添加训练备注
- 记录天气和地点信息

### 计分系统
- 支持多种弓种（传统弓、反曲弓、复合弓、光弓）
- 支持多种距离（18m、30m、50m、60m、70m、90m）
- 支持多种靶纸（122cm、80cm、60cm、40cm）
- 自定义组数和每组箭数
- 实时计算总分
- 支持脱靶（M）记录

### 历史记录
- 查看所有训练记录
- 查看所有计分记录
- 按时间排序
- 显示详细信息

### 设置
- 个人信息管理
- 偏好设置
- 数据导出
- 数据清除

## 待实现功能

- [ ] 延迟录像功能
- [ ] 数据统计分析图表
- [ ] 训练计划制定
- [ ] 社交分享功能
- [ ] 云端数据同步
- [ ] AI 动作分析
- [ ] 多语言支持

## 常见问题

### 如何打包成 APK？
1. 使用 HBuilderX 打开项目
2. 点击"发行" -> "原生App-云打包"
3. 选择 Android 平台
4. 等待打包完成

### 如何发布到微信小程序？
1. 在 `manifest.json` 中配置微信小程序 AppID
2. 运行 `npm run build:mp-weixin`
3. 使用微信开发者工具打开生成的 `dist/dev/mp-weixin` 目录
4. 在微信开发者工具中上传代码

### 数据存储在哪里？
所有数据都存储在设备的本地存储中，不会上传到任何服务器。

## 贡献指南

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License

## 联系方式

如有问题或建议，请通过以下方式联系：
- 提交 Issue
- 发送邮件

---

**版本**：v1.0.0  
**更新日期**：2026-04-14