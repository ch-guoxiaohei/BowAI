# 射箭辅助工具 POC 文档

## 1. 项目概述

### 1.1 项目目标
开发一个射箭辅助工具，帮助射箭爱好者记录训练数据、计算成绩、记录动作，提升训练效果。

### 1.2 核心功能
1. **计数器**：记录射箭训练数据
2. **计分系统**：按弓种、距离、组数记录并计算成绩

## 2. 技术方案分析

### 2.1 小程序方案评估

#### 2.1.1 可行性分析

**功能模块可行性评估：**

| 功能模块 | 小程序可行性 | 技术挑战 | 推荐度 |
|---------|------------|---------|--------|
| 计数器 | ✅ 完全可行 | 无 | ⭐⭐⭐⭐⭐ |
| 计分系统 | ✅ 完全可行 | 无 | ⭐⭐⭐⭐⭐ |

#### 2.1.2 小程序限制分析
- 存储空间受限

**其他限制：**
- 本地存储容量有限（通常10MB）
- 复杂计算性能受限
- 多任务处理能力弱

### 2.2 推荐技术方案

基于需求分析，推荐以下技术方案：

#### 方案一：混合开发方案（推荐）⭐⭐⭐⭐⭐

**技术栈：**
- **前端框架**：Vue 3 + Vite + Electron（桌面端）+ Uni-app（移动端）
- **后端**：Node.js + Express + SQLite（本地数据库）
- **UI框架**：Element Plus（桌面端）+ uView（移动端）

**优势：**
- 桌面端功能完整
- 移动端使用Uni-app，可发布到多个平台
- 本地数据存储，无需网络
- 性能优秀，用户体验好

**适用场景：**
- 专业射箭训练
- 数据量较大的用户

#### 方案二：PWA方案 ⭐⭐⭐⭐

**技术栈：**
- **前端框架**：Vue 3 + Vite
- **PWA工具**：Workbox
- **数据库**：IndexedDB

**优势：**
- 跨平台，一次开发多端使用
- 可离线使用
- 安装简单，类似原生应用体验

**限制：**
- 性能不如原生应用
- 部分设备兼容性问题

**适用场景：**
- 轻度使用用户
- 需要多平台同步

#### 方案三：纯小程序方案 ⭐⭐⭐

**技术栈：**
- **平台**：微信小程序
- **框架**：Uni-app 或 原生小程序
- **云开发**：微信云开发

**优势：**
- 无需安装，即用即走
- 开发成本低
- 易于分享和推广
- 云端数据备份

**限制：**
- 本地存储容量小
- 功能受限较多

**适用场景：**
- 基础功能需求
- 社交分享需求强

## 3. 推荐方案详细设计（混合开发方案）

### 3.1 系统架构

```
┌─────────────────────────────────────────────────────────┐
│                      用户界面层                           │
├──────────────┬──────────────┬──────────────┬────────────┤
│  桌面端应用   │  移动端应用   │  Web端       │  小程序     │
│  (Electron)  │  (Uni-app)   │  (PWA)       │  (可选)     │
└──────────────┴──────────────┴──────────────┴────────────┘
                            │
┌─────────────────────────────────────────────────────────┐
│                      业务逻辑层                           │
├──────────────┬──────────────┬──────────────┬────────────┤
│  计数器模块   │  计分模块     │  统计模块     │  设置模块   │
└──────────────┴──────────────┴──────────────┴────────────┘
                            │
┌─────────────────────────────────────────────────────────┐
│                      数据存储层                           │
├──────────────┬──────────────┬──────────────┬────────────┤
│  SQLite      │  IndexedDB   │  文件系统     │  云存储     │
└──────────────┴──────────────┴──────────────┴────────────┘
```

### 3.2 功能模块设计

#### 3.2.1 计数器模块

**功能描述：**
- 记录训练开始时间
- 记录训练结束时间
- 记录射箭数量
- 计算训练时长
- 实时计时显示
- 简洁的计数界面
- **自定义步长功能**：用户可设置每次增加的箭数（1-50箭）
- **日期范围筛选功能**：支持按开始时间和结束时间筛选训练记录

**数据结构：**
```typescript
interface TrainingSession {
  id: string;
  startTime: Date;
  endTime: Date;
  arrowCount: number;
  duration: number;
}
```

**核心功能：**
- 开始计数（自动记录开始时间）
- 实时计数（点击按钮增加箭数）
- **自定义步长**：用户可输入1-50的数值，设置每次点击增加的箭数
- 实时计时显示
- 结束计数（自动保存并返回列表）
- 训练历史查看（显示箭数、开始时间、结束时间）
- **日期范围筛选**：可选择开始日期和结束日期，筛选该时间段内的训练记录

**步长限制：**
- 最小值：1箭
- 最大值：50箭
- 默认值：1箭
- 输入验证：自动限制在1-50范围内

**日期筛选功能：**
- 支持选择开始日期和结束日期
- 筛选条件：训练开始时间在选定日期范围内
- 支持清除筛选条件，显示所有记录
- 筛选结果与分页功能结合使用

#### 3.2.2 计分系统模块

**功能描述：**
- 选择弓种（传统弓、反曲弓、复合弓、光弓）
- 选择距离（18米、30米、50米、70米等）
- 设置组数和每组箭数
- 选择靶纸类型
- 记录每箭得分
- 自动计算总分
- **实时计时功能**：记录每次计分的训练总时间
- 保存计分记录

**数据结构：**
```typescript
interface ScoringSession {
  id: string;
  bowType: 'traditional' | 'recurve' | 'compound' | 'barebow';
  distance: number;
  targetFace: '122cm' | '80cm' | '60cm' | '40cm';
  totalRounds: number;
  arrowsPerRound: number;
  scores: number[][];
  totalScore: number;
  date: Date;
  startTime: Date;
  endTime?: Date;
  duration: number;
  notes?: string;
}
```

**核心功能：**
- 创建计分会话
- 快速输入分数
- 实时计算总分
- **实时计时显示**：显示计分过程中的训练时长
- 历史记录查询
- 成绩统计分析
- **计分时长记录**：保存每次计分的总时间

### 3.3 数据库设计

#### 3.3.1 SQLite表结构

**训练记录表**
```sql
CREATE TABLE training_sessions (
  id TEXT PRIMARY KEY,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  arrow_count INTEGER DEFAULT 0,
  duration INTEGER NOT NULL,
  created_at INTEGER DEFAULT (strftime('%s', 'now'))
);
```

**计分记录表**
```sql
CREATE TABLE scoring_sessions (
  id TEXT PRIMARY KEY,
  bow_type TEXT NOT NULL,
  distance INTEGER NOT NULL,
  target_face TEXT NOT NULL,
  total_rounds INTEGER NOT NULL,
  arrows_per_round INTEGER NOT NULL,
  scores TEXT NOT NULL,
  total_score INTEGER NOT NULL,
  session_date INTEGER NOT NULL,
  notes TEXT,
  created_at INTEGER DEFAULT (strftime('%s', 'now'))
);
```

### 3.4 用户界面设计

#### 3.4.1 主要页面

1. **首页**
   - 快速开始训练
   - 最近记录概览
   - 统计数据展示

2. **计数器页面**
   - 大号箭数显示
   - 实时计时器
   - **步长输入框**：用户可输入1-50的数值
   - "+ X 箭" 计数按钮（X为用户设置的步长）
   - "结束计数" 按钮（保存并返回）
   - 简洁的渐变背景设计

3. **计分页面**
   - 弓种选择
   - 距离设置
   - 靶纸选择
   - 分数输入
   - 实时总分显示
   - **实时计时显示**：显示计分过程中的训练时长

4. **历史记录页面**
   - **日期范围筛选器**：开始日期选择、结束日期选择、清除筛选按钮
   - 计分记录
   - 统计分析

5. **设置页面**
   - 偏好设置（深色模式、消息通知、语言）
   - 数据管理（导出数据、清除数据）

#### 3.4.2 UI/UX设计原则

- 简洁明了，易于操作
- 大按钮设计，适合训练场景
- 深色模式支持
- 响应式设计

#### 3.4.3 计数器用户流程

**流程图：**
```
首页 → 计数器列表页 → 开始计数 → 计数页面
                                    ↓
                               计数中（点击+1箭）
                                    ↓
                               结束计数
                                    ↓
                            自动保存并返回列表页
```

**详细步骤：**
1. 用户从首页点击"计数器"进入计数器列表页
2. 点击"开始计数"按钮，进入计数页面
3. 系统自动记录开始时间，开始计时
4. 用户在步长输入框中输入想要每次增加的箭数（1-50）
5. 用户点击"+ X 箭"按钮增加箭数（X为用户设置的步长）
6. 实时显示当前箭数和训练时长
7. 用户可随时修改步长值
8. 点击"结束计数"按钮
9. 系统自动计算并记录结束时间、训练时长
10. 保存记录到本地存储
11. 自动返回计数器列表页
12. 列表页显示新记录（箭数、开始时间、结束时间）

**界面特点：**
- 计数页面采用紫色渐变背景，视觉突出
- 箭数显示超大字体（120rpx），易于查看
- 计时器显示清晰（64rpx）
- **步长输入框**：白色背景，居中显示，支持1-50输入
- "+ X 箭"按钮白色背景，紫色文字，动态显示当前步长
- "结束计数"按钮半透明白色背景，次级操作
- 列表页卡片简洁，只显示核心信息
- **日期筛选器**：位于页面顶部，包含开始日期、结束日期选择器和清除按钮
- **日期选择器**：使用uni-app的picker组件，支持日期选择
- **筛选状态显示**：显示当前筛选条件（如有）和筛选结果数量

**步长功能特点：**
- 默认步长为1箭
- 用户可随时修改步长值
- 输入框自动验证，限制在1-50范围内
- 按钮文字动态更新显示当前步长
- 适合不同训练场景（单箭计数、组箭计数）

**日期筛选功能特点：**
- 默认显示所有记录
- 开始日期和结束日期可独立选择
- 筛选条件：训练开始时间 >= 开始日期 AND 训练开始时间 <= 结束日期
- 支持只设置开始日期或结束日期进行单边筛选
- 清除按钮重置所有筛选条件
- 筛选结果实时更新，与分页功能配合使用

## 4. POC实施计划

### 4.1 第一阶段：核心功能开发（2-3周）

**目标：** 实现基本的计数器和计分功能

**任务清单：**
- [x] 搭建项目基础架构
- [x] 实现训练计数器功能（简化版）
- [ ] 实现基础计分功能
- [ ] 设计并实现数据库
- [x] 完成基础UI界面

**已完成功能：**
- ✅ 计数器列表页（显示箭数、开始时间、结束时间）
- ✅ 计数页面（大号箭数显示、实时计时、+1箭按钮、结束计数按钮）
- ✅ 自动保存计数记录
- ✅ 计数结束后自动返回列表页
- ✅ 本地存储持久化
- ✅ 自定义步长功能（1-50箭）
- ✅ 日期范围筛选功能
- ✅ 可配置分页大小（10/20/50/100）
- ✅ 传统分页导航（首页/上一页/下一页/末页）
- ✅ 日期验证逻辑
- ✅ 筛选与分页结合
- ✅ 简化的卡片布局（日期范围+箭数）
- ✅ 训练趋势图表（折线图显示箭数变化）
- ✅ 计分系统列表页（显示弓种、距离、靶纸、总分、时间）
- ✅ 计分当前页面（实时计分、计时、分数输入）
- ✅ 计分记录详情页（组别分数图表、详细记录）
- ✅ 计分日期范围筛选功能
- ✅ 计分记录分页功能（默认10条/页）
- ✅ 计分趋势图表（柱状图显示组别分数变化）
- ✅ 设置页面（偏好设置、数据管理）

**待完成功能：**
- ⏳ 数据统计

**已知限制：**
- ⚠️ 深色模式切换功能已实现，但全局主题应用需要在后续版本中完善
- ⚠️ 语言切换功能已实现，但多语言翻译需要在后续版本中完善

**交付物：**
- 可运行的Web应用
- 基本计数功能可用
- 数据持久化

### 4.2 第二阶段：移动端适配（1-2周）

**目标：** 开发移动端应用

**任务清单：**
- [ ] 使用Uni-app开发移动端
- [ ] 适配移动端UI
- [ ] 移动端功能优化

**交付物：**
- 移动端应用

### 4.3 第三阶段：优化和完善（1周）

**目标：** 优化用户体验，完善功能

**任务清单：**
- [ ] 性能优化
- [ ] UI/UX优化
- [ ] 测试和bug修复
- [ ] 文档编写

**交付物：**
- 完整的产品
- 用户文档
- 技术文档

## 5. 技术选型对比

### 5.1 桌面端框架对比

| 框架 | 优势 | 劣势 | 推荐度 |
|------|------|------|--------|
| Electron | 生态成熟，功能强大 | 体积大 | ⭐⭐⭐⭐⭐ |
| Tauri | 体积小，性能好 | 生态相对较小 | ⭐⭐⭐⭐ |
| NW.js | 成熟稳定 | 相对老旧 | ⭐⭐⭐ |

### 5.2 移动端框架对比

| 框架 | 优势 | 劣势 | 推荐度 |
|------|------|------|--------|
| Uni-app | 一套代码多端运行 | 性能相对一般 | ⭐⭐⭐⭐⭐ |
| React Native | 性能好，生态大 | 学习成本高 | ⭐⭐⭐⭐ |
| Flutter | 性能优秀 | 生态相对较小 | ⭐⭐⭐⭐ |

## 6. 风险评估

### 6.1 技术风险

| 风险 | 可能性 | 影响 | 应对措施 |
|------|--------|------|----------|
| 跨平台兼容性问题 | 中 | 中 | 充分测试，提供降级方案 |

### 6.2 业务风险

| 风险 | 可能性 | 影响 | 应对措施 |
|------|--------|------|----------|
| 用户需求变化 | 中 | 中 | 采用敏捷开发，快速迭代 |
| 竞品出现 | 低 | 中 | 专注核心功能，提升用户体验 |

## 7. 成本估算

### 7.1 开发成本

- **开发人员**：1-2名全栈开发工程师
- **开发周期**：5-8周
- **人力成本**：根据地区和经验水平

### 7.2 基础设施成本

- **开发工具**：免费（VS Code等）
- **测试设备**：中等

## 8. 后续扩展方向

### 8.1 功能扩展

- AI动作分析
- 社交分享功能
- 在线比赛功能
- 数据可视化增强
- 训练计划推荐

### 8.2 平台扩展

- iOS/Android原生应用
- Web版本
- 小程序版本（功能简化版）

## 9. 结论

### 9.1 方案推荐

**推荐采用混合开发方案**，原因如下：

1. **功能完整性**：能够完整实现所有需求功能
2. **用户体验**：桌面端提供专业体验，移动端提供便捷体验
3. **技术成熟度**：技术栈成熟稳定
4. **扩展性**：便于后续功能扩展
5. **成本效益**：开发成本可控，维护成本较低

### 9.2 实施建议

1. **优先开发桌面端**：首先实现核心功能，验证产品概念
2. **快速迭代**：采用敏捷开发，根据用户反馈快速调整
3. **分阶段发布**：先发布MVP版本，再逐步完善功能
4. **重视用户反馈**：收集用户使用反馈，持续优化产品

## 10. 附录

### 10.1 实现细节

#### 10.1.1 计数器模块实现

**文件结构：**
```
src/
├── pages/
│   └── training/
│       ├── training.vue      # 计数器列表页
│       └── current.vue       # 计数页面
├── store/
│   └── modules/
│       └── training.js       # 计数器状态管理
└── pages.json                # 页面配置
```

**核心代码说明：**

1. **计数页面**
   - 使用 Vue 3 Composition API
   - 实时箭数显示（120rpx 字体）
   - 实时计时器（每秒更新）
   - **步长输入框**：支持1-50的自定义步长
   - **步长验证**：自动限制在1-50范围内
   - "+ X 箭"按钮：点击增加指定步长的箭数
   - "结束计数"按钮：保存记录并返回

2. **列表页面**
   - 显示所有计数记录
   - 每条记录显示：箭数、开始时间、结束时间
   - "开始计数"按钮：跳转到计数页面
   - **日期范围筛选**：支持开始日期和结束日期选择
   - **可配置分页大小**：10/20/50/100条记录每页
   - **传统分页导航**：首页/上一页/下一页/末页按钮
   - **日期验证**：防止开始日期大于结束日期
   - **简化的卡片布局**：单行显示日期范围和箭数

3. **状态管理**
   - Vuex store 管理计数状态
   - 本地存储持久化
   - addSession action：保存新记录
   - loadPaginatedSessions action：支持分页和日期筛选

**技术特点：**
- Uni-app 框架，支持多端部署
- Vuex 状态管理
- 本地存储（localStorage）
- 响应式设计
- 渐变背景 UI 设计

#### 10.1.2 列表页面详细实现

**页面结构：**

```vue
<template>
  <view class="container">
    <!-- 开始计数按钮 -->
    <view class="header">
      <button class="btn btn-primary btn-block" @tap="startNewCounter">
        开始计数
      </button>
    </view>

    <!-- 列表内容区域 -->
    <view v-if="hasActiveFilter || sessions.length > 0" class="list-content">
      
      <!-- 日期筛选器 -->
      <view v-if="sessions.length > 0 || hasActiveFilter" class="date-filter">
        <view class="filter-row">
          <view class="filter-item">
            <text class="filter-label">开始日期</text>
            <picker mode="date" :value="filterStartDate" @change="onStartDateChange">
              <view class="picker-value">
                {{ filterStartDate || '选择日期' }}
              </view>
            </picker>
          </view>
          <view class="filter-item">
            <text class="filter-label">结束日期</text>
            <picker mode="date" :value="filterEndDate" @change="onEndDateChange">
              <view class="picker-value">
                {{ filterEndDate || '选择日期' }}
              </view>
            </picker>
          </view>
        </view>
        <view v-if="hasActiveFilter" class="filter-actions">
          <button class="clear-filter-btn" @tap="clearFilter">
            清除筛选
          </button>
          <text class="filter-result">
            筛选结果：{{ pagination.total }} 条记录
          </text>
        </view>
      </view>

      <!-- 分页大小选择器 -->
      <view v-if="sessions.length > 0" class="page-size-selector">
        <text class="selector-label">每页显示:</text>
        <view class="selector-buttons">
          <button v-for="size in pageSizes" :key="size" 
                  class="size-btn" 
                  :class="{ active: currentPageSize === size }"
                  @tap="changePageSize(size)">
            {{ size }}
          </button>
        </view>
      </view>

      <!-- 训练记录卡片 -->
      <view v-if="sessions.length > 0" 
            class="record-card" 
            v-for="session in sessions" 
            :key="session.id">
        <view class="card-content">
          <view class="date-range">
            <text class="date-text">{{ formatDateTime(session.startTime) }}</text>
            <text class="date-separator">-</text>
            <text class="date-text">{{ formatDateTime(session.endTime) }}</text>
          </view>
          <text class="arrow-count">{{ session.arrowCount }} 箭</text>
        </view>
      </view>

      <!-- 无筛选结果提示 -->
      <view v-if="sessions.length === 0 && hasActiveFilter" class="no-filter-results">
        <text class="no-results-icon">📅</text>
        <text class="no-results-text">该日期范围内没有训练记录</text>
        <button class="clear-filter-btn-large" @tap="clearFilter">
          清除筛选
        </button>
      </view>

      <!-- 分页导航 -->
      <view v-if="sessions.length > 0 && pagination.totalPages > 1" class="pagination">
        <button :disabled="isFirstPage" @tap="goToPage(1)">首页</button>
        <button :disabled="isFirstPage" @tap="prevPage">上一页</button>
        <text class="page-info">{{ pagination.page }} / {{ pagination.totalPages }}</text>
        <button :disabled="isLastPage" @tap="nextPage">下一页</button>
        <button :disabled="isLastPage" @tap="goToPage(pagination.totalPages)">末页</button>
      </view>

      <!-- 分页信息 -->
      <view class="pagination-info" v-if="pagination.totalPages > 0">
        <text class="pagination-text">总计 {{ pagination.total }} 条记录</text>
      </view>
    </view>

    <!-- 空状态 -->
    <view v-else class="empty-state">
      <text class="empty-icon">📝</text>
      <text class="empty-text">No records</text>
    </view>
  </view>
</template>
```

**核心功能实现：**

1. **日期筛选功能**
```javascript
const filterStartDate = ref('')
const filterEndDate = ref('')
const hasActiveFilter = computed(() => filterStartDate.value || filterEndDate.value)

const onStartDateChange = (e) => {
  const newStartDate = e.detail.value
  
  // 日期验证：开始日期不能大于结束日期
  if (filterEndDate.value && newStartDate > filterEndDate.value) {
    uni.showToast({
      title: '开始日期不能大于结束日期',
      icon: 'none',
      duration: 2000
    })
    return
  }
  
  filterStartDate.value = newStartDate
  loadSessions(1)
}

const onEndDateChange = (e) => {
  const newEndDate = e.detail.value
  
  // 日期验证：结束日期不能小于开始日期
  if (filterStartDate.value && newEndDate < filterStartDate.value) {
    uni.showToast({
      title: '结束日期不能小于开始日期',
      icon: 'none',
      duration: 2000
    })
    return
  }
  
  filterEndDate.value = newEndDate
  loadSessions(1)
}
```

2. **分页功能**
```javascript
const currentPageSize = ref(20)
const pageSizes = [10, 20, 50, 100]

const loadSessions = async (page = 1) => {
  await store.dispatch('training/loadPaginatedSessions', { 
    page, 
    pageSize: currentPageSize.value,
    startDate: filterStartDate.value,
    endDate: filterEndDate.value
  })
}

const changePageSize = (size) => {
  currentPageSize.value = size
  loadSessions(1) // 改变页面大小时重置到第一页
}
```

3. **日期格式化**
```javascript
const formatDateTime = (dateTime) => {
  if (!dateTime) return ''
  
  if (dateTime.includes(' ')) {
    return dateTime // 已经格式化的直接返回
  }
  
  const date = new Date(dateTime)
  if (isNaN(date.getTime())) {
    return dateTime // 无效日期直接返回
  }
  
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}
```

**UI设计特点：**

1. **卡片布局**
   - 单行显示：日期范围 - 箭数
   - 简洁高效，易于浏览
   - 箭数使用渐变背景突出显示

2. **日期筛选器**
   - 始终可见（有记录时）
   - 清晰的日期选择器
   - 实时筛选结果反馈
   - 清除筛选按钮

3. **分页控制**
   - 可配置页面大小（10/20/50/100）
   - 传统分页按钮（首页/上一页/下一页/末页）
   - 当前页/总页数显示
   - 按钮禁用状态（首页/末页）

4. **响应式设计**
   - 使用 rpx 单位适配不同屏幕
   - 灵活的 flex 布局
   - 渐变色和阴影效果

**状态管理集成：**

```javascript
// store/modules/training.js
async loadPaginatedSessions({ commit }, { page = 1, pageSize = DEFAULT_PAGE_SIZE, startDate, endDate } = {}) {
  try {
    let data = await Storage.get(TRAINING_STORAGE_KEY) || []
    
    // 日期筛选
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
    
    // 分页处理
    const total = data.length
    const totalPages = Math.ceil(total / pageSize)
    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + pageSize
    const paginatedData = data.slice(startIndex, endIndex)

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
}
```

**用户体验优化：**

1. **智能显示逻辑**
   - 有记录时显示列表和筛选器
   - 有筛选时显示筛选结果和清除按钮
   - 无结果时显示友好提示
   - 无记录时显示空状态

2. **即时反馈**
   - 日期选择后立即筛选
   - 页面大小改变后立即重新加载
   - 分页导航即时响应
   - 日期验证错误提示

3. **错误处理**
   - 无效日期格式处理
   - 筛选无结果提示
   - 分页边界检查
   - Toast 消息提示
- 渐变背景 UI 设计

#### 10.1.2 数据存储

**存储方式：**
- 使用 uni-app 的本地存储 API
- 存储键：`counter_sessions`
- 数据格式：JSON 数组

**数据示例：**
```json
[
  {
    "id": "1713356400000",
    "startTime": "2026-04-17 14:00:00",
    "endTime": "2026-04-17 14:30:00",
    "arrowCount": 60,
    "duration": 1800
  }
]
```

#### 10.1.3 训练趋势图表实现

**功能描述：**
- 在列表页显示训练趋势折线图
- 展示选定日期范围内的箭数变化
- 支持日期筛选时动态更新
- 使用 @qiun/ucharts 组件实现

**技术实现：**

1. **图表组件**
```vue
<view v-if="chartData.length > 0" class="chart-container">
  <view class="chart-header">
    <text class="chart-title">训练趋势</text>
    <text class="chart-subtitle">箭数变化</text>
  </view>
  <view class="chart-wrapper">
    <qiun-ucharts 
      type="line"
      :opts="chartOpts"
      :chartData="chartData"
      :canvas2d="true"
      :canvasId="chartId"
    />
  </view>
</view>
```

2. **图表配置**
```javascript
const chartOpts = {
  color: ['#667eea'],
  padding: [15, 15, 0, 5],
  enableScroll: false,
  legend: {
    show: false
  },
  xAxis: {
    disableGrid: true,
    itemCount: 7
  },
  yAxis: {
    gridType: 'dash',
    dashLength: 2,
    data: [{
      min: 0
    }]
  },
  extra: {
    line: {
      type: 'curve',
      width: 2,
      activeType: 'hollow'
    }
  }
}
```

3. **数据处理**
```javascript
const chartData = computed(() => {
  if (allFilteredSessions.value.length === 0) {
    return []
  }
  
  const dateMap = new Map()
  
  allFilteredSessions.value.forEach(session => {
    const date = new Date(session.startTime)
    const dateKey = `${date.getMonth() + 1}/${date.getDate()}`
    
    if (dateMap.has(dateKey)) {
      dateMap.set(dateKey, dateMap.get(dateKey) + session.arrowCount)
    } else {
      dateMap.set(dateKey, session.arrowCount)
    }
  })
  
  const sortedDates = Array.from(dateMap.entries()).sort((a, b) => {
    const [monthA, dayA] = a[0].split('/').map(Number)
    const [monthB, dayB] = b[0].split('/').map(Number)
    return monthA - monthB || dayA - dayB
  })
  
  return {
    categories: sortedDates.map(item => item[0]),
    series: [{
      name: '箭数',
      data: sortedDates.map(item => item[1])
    }]
  }
})
```

**UI设计特点：**
- 白色卡片背景，圆角设计
- 图表标题和副标题清晰展示
- 400rpx 高度的图表区域
- 紫色主题与整体设计一致
- 曲线线条，平滑视觉效果
- Tooltip 显示详细数据

**依赖包：**
- @qiun/ucharts: 图表渲染库

**用户体验：**
- 自动按时间排序数据
- 日期格式化为月/日显示
- 鼠标悬停显示详细信息
- 响应式设计，适配不同屏幕

#### 10.1.4 计分系统实现

**功能描述：**
- 计分列表页：显示所有计分记录，支持日期筛选和分页
- 计分当前页：实时计分、计时、分数输入
- 计分详情页：显示组别分数图表和详细记录
- 支持点击记录查看详情

**文件结构：**
```
src/
├── pages/
│   └── scoring/
│       ├── scoring.vue       # 计分列表页
│       ├── current.vue       # 计分当前页
│       └── details.vue      # 计分详情页
├── store/
│   └── modules/
│       └── scoring.js       # 计分状态管理
└── pages.json             # 页面配置
```

**核心功能实现：**

1. **计分列表页**
   - 显示所有计分记录（弓种、距离、靶纸、总分、时间）
   - 日期范围筛选功能
   - 分页功能（默认10条/页）
   - 点击记录跳转到详情页
   - 卡片式布局，简洁明了

2. **计分当前页**
   - 弓种、距离、靶纸选择
   - 组数和每组箭数设置
   - 实时分数输入
   - 实时计时显示
   - 实时总分计算
   - 保存计分记录

3. **计分详情页**
   - 显示计分会话详细信息
   - 组别分数柱状图（X轴为组号）
   - 详细记录展示（每组每箭分数）
   - 返回列表按钮

**数据结构：**
```typescript
interface ScoringSession {
  id: string;
  bowType: 'traditional' | 'recurve' | 'compound' | 'barebow';
  distance: number;
  targetFace: '122cm' | '80cm' | '60cm' | '40cm';
  totalRounds: number;
  arrowsPerRound: number;
  scores: number[][];
  totalScore: number;
  date: Date;
  startTime: Date;
  endTime?: Date;
  duration: number;
  notes?: string;
}
```

**图表实现：**
```vue
<view v-if="chartData" class="chart-container">
  <view class="chart-header">
    <text class="chart-title">得分趋势</text>
    <text class="chart-subtitle">组别分数变化</text>
  </view>
  <view class="chart-wrapper">
    <canvas 
      canvas-id="roundChart" 
      id="roundChart" 
      class="chart-canvas"
      @touchstart="touchChart"
      @touchmove="moveChart"
      @touchend="touchEndChart"
    ></canvas>
  </view>
</view>
```

```javascript
const chartData = computed(() => {
  if (!session.value || !session.value.scores) {
    return null
  }
  
  const roundScores = session.value.scores.map((round, index) => ({
    roundNumber: index + 1,
    score: round.reduce((sum, score) => sum + score, 0)
  }))
  
  return {
    categories: roundScores.map(r => `第${r.roundNumber}组`),
    data: roundScores.map(r => r.score)
  }
})

const initChart = () => {
  const canvasContext = uni.createCanvasContext('roundChart')
  
  const chartConfig = {
    type: 'column',
    canvasId: 'roundChart',
    context: canvasContext,
    width: uni.upx2px(750),
    height: uni.upx2px(400),
    categories: chartData.value.categories,
    series: [{
      name: '分数',
      data: chartData.value.data,
      color: '#667eea'
    }],
    animation: true,
    background: '#FFFFFF',
    color: ['#667eea'],
    padding: [15, 15, 0, 5],
    enableScroll: false,
    legend: {
      show: false
    },
    xAxis: {
      disableGrid: true,
      itemCount: 7
    },
    yAxis: {
      gridType: 'dash',
      dashLength: 2,
      data: [{
        min: 0
      }]
    },
    extra: {
      column: {
        width: 30,
        activeType: 'hollow',
        activeWidth: 35,
        linearType: 'custom',
        linearOpacity: 0.8,
        barBorderCircle: true
      }
    }
  }

  uChartsInstance = new uCharts(chartConfig)
}
```

**UI设计特点：**
- 紫色渐变背景的会话信息卡片
- 2x2网格布局的统计信息（总分、组数、总箭数、平均分）
- 柱状图显示组别分数变化
- 详细记录卡片展示每组每箭分数
- 返回按钮使用渐变背景，带阴影效果

**用户体验：**
- 点击记录卡片跳转到详情页
- 详情页显示完整的计分信息
- 柱状图直观展示各组分数变化
- 详细记录网格布局，易于查看每箭得分
- 返回按钮支持两种导航方式（navigateBack/redirectTo）

**存储方式：**
- 使用 uni-app 的本地存储 API
- 存储键：`scoring_sessions`
- 数据格式：JSON 数组

**依赖包：**
- @qiun/ucharts: 图表渲染库

**状态管理：**
- Vuex store 管理计分状态
- loadSessions: 加载所有计分记录
- loadPaginatedSessions: 加载分页和筛选后的记录
- createSession: 创建新计分会话
- updateScore: 更新分数
- saveSession: 保存计分记录

#### 10.1.5 设置系统实现

**功能描述：**
- 偏好设置：深色模式、消息通知、语言切换
- 数据管理：导出数据、清除所有数据
- 关于信息：版本信息、关于我们、隐私政策

**文件结构：**
```
src/
├── pages/
│   └── settings/
│       └── settings.vue      # 设置页面
└── store/
    └── modules/
        └── app.js           # 应用状态管理
```

**核心功能实现：**

1. **偏好设置**
   - 深色模式切换：支持实时切换深色/浅色主题
   - 消息通知开关：控制消息通知功能
   - 语言选择：支持简体中文/English切换

2. **数据管理**
   - 导出数据：导出所有数据为JSON格式
   - 清除数据：清除所有训练和计分记录

3. **关于信息**
   - 版本信息：显示当前应用版本
   - 关于我们：应用介绍
   - 隐私政策：数据隐私说明

**数据结构：**
```typescript
interface Settings {
  darkMode: boolean;
  language: 'zh-CN' | 'en-US';
  notifications: boolean;
}
```

**核心代码实现：**

1. **深色模式切换**
```javascript
const onDarkModeChange = (e) => {
  settings.value.darkMode = e.detail.value
  isDarkMode.value = e.detail.value
  applyThemeImmediately()
}

const applyThemeImmediately = async () => {
  try {
    await store.dispatch('app/saveSettings', { darkMode: settings.value.darkMode })
    
    // 更新导航栏颜色
    if (typeof uni !== 'undefined' && uni.setNavigationBarColor) {
      uni.setNavigationBarColor({
        frontColor: settings.value.darkMode ? '#ffffff' : '#000000',
        backgroundColor: settings.value.darkMode ? '#1a1a1a' : '#F8F8F8'
      })
    }
    
    uni.showToast({
      title: settings.value.darkMode ? '已切换到深色模式' : '已切换到浅色模式',
      icon: 'success'
    })
  } catch (error) {
    console.error('应用主题失败:', error)
  }
}
```

2. **语言切换**
```javascript
const onLanguageChange = (e) => {
  languageIndex.value = e.detail.value
  settings.value.language = e.detail.value === 0 ? 'zh-CN' : 'en-US'
  saveLanguageSettings()
}

const saveLanguageSettings = async () => {
  try {
    await store.dispatch('app/saveSettings', { 
      language: settings.value.language 
    })
    
    uni.showToast({
      title: '语言已切换',
      icon: 'success'
    })
  } catch (error) {
    uni.showToast({
      title: '保存失败',
      icon: 'none'
    })
  }
}
```

**UI设计特点：**
- 卡片式布局，分组清晰
- 开关控件使用uni-app switch组件
- 选择器使用uni-app picker组件
- 深色模式样式完整支持
- 平滑的主题切换过渡效果

**深色模式配色方案：**
- **背景色**: `#1a1a1a` (深色) vs `#f5f5f5` (浅色)
- **卡片背景**: `#2a2a2a` (深色) vs `#fff` (浅色)
- **文字颜色**: `#e0e0e0` (深色) vs `#333` (浅色)
- **边框颜色**: `#3a3a3a` (深色) vs `#f0f0f0` (浅色)
- **导航栏**: 深色主题使用白色文字，浅色主题使用黑色文字

**用户体验：**
- 设置项点击提供即时反馈
- 主题切换显示成功提示
- 语言切换显示成功提示
- 所有设置更改立即保存到本地存储
- 深色模式支持完整的样式过渡

**存储方式：**
- 使用 uni-app 的本地存储 API
- 存储键：`settings`
- 数据格式：JSON 对象

**状态管理：**
- Vuex store 管理应用状态
- loadSettings: 加载设置
- saveSettings: 保存设置
- updateUserInfo: 更新用户信息（已移除）

**已知限制：**
- 深色模式切换功能已实现，但全局主题应用需要在后续版本中完善
- 语言切换功能已实现，但多语言翻译需要在后续版本中完善
- 当前仅支持设置页面的深色模式样式，其他页面需要后续添加

### 10.2 参考资料

- [Electron官方文档](https://www.electronjs.org/)
- [Uni-app官方文档](https://uniapp.dcloud.io/)
- [World Archery规则](https://www.worldarchery.org/)

### 10.2 术语表

- **POC**：概念验证（Proof of Concept）
- **MVP**：最小可行产品（Minimum Viable Product）
- **PWA**：渐进式Web应用（Progressive Web App）

---

**文档版本**：v1.7  
**创建日期**：2026-04-14  
**最后更新**：2026-04-18  
**更新内容**：
- v1.1 更新计数器模块设计，简化为只记录箭数、开始时间、结束时间
- v1.1 添加计数器用户流程详细说明
- v1.1 更新数据库表结构，移除可选字段
- v1.1 添加实现细节章节，包含文件结构、核心代码说明
- v1.1 更新项目进度，标记已完成功能
- v1.2 新增自定义步长功能：用户可设置每次增加的箭数（1-50箭）
- v1.2 添加步长输入框：支持实时修改步长值
- v1.2 添加步长验证：自动限制在1-50范围内
- v1.2 动态按钮文字：按钮显示当前步长值
- v1.3 新增日期范围筛选功能：支持按开始时间和结束时间筛选训练记录
- v1.3 添加日期选择器：使用uni-app的picker组件实现日期选择
- v1.3 添加筛选状态显示：显示当前筛选条件和筛选结果数量
- v1.3 筛选与分页结合：日期筛选结果支持分页显示
- v1.4 新增训练趋势图表：折线图显示箭数变化趋势
- v1.4 添加@qiun/ucharts依赖：图表渲染库
- v1.4 图表动态更新：支持日期筛选时实时更新图表
- v1.4 图表样式优化：紫色主题与整体设计一致
- v1.5 新增计分系统：完整的计分功能实现
- v1.5 添加计分列表页：显示所有计分记录，支持日期筛选和分页
- v1.5 添加计分当前页：实时计分、计时、分数输入
- v1.5 添加计分详情页：组别分数柱状图和详细记录
- v1.5 计分记录分页：默认10条/页，支持分页导航
- v1.5 计分日期筛选：支持日期范围筛选计分记录
- v1.5 组别分数图表：柱状图显示各组分数变化，X轴为组号
- v1.5 详细记录展示：网格布局显示每组每箭分数
- v1.5 返回按钮优化：支持多种导航方式，渐变背景设计
- v1.6 新增设置系统：偏好设置和数据管理功能
- v1.6 添加深色模式切换：支持实时切换深色/浅色主题
- v1.6 添加语言切换功能：支持简体中文/English切换
- v1.6 添加数据导出功能：导出所有数据为JSON格式
- v1.6 添加数据清除功能：清除所有训练和计分记录
- v1.6 移除历史记录页面：功能整合到各模块中
- v1.6 移除个人信息功能：简化设置页面，聚焦核心功能