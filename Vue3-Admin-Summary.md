# 🚀 企业级 Vue3 + Element Plus 中后台架构实战总结

## 📝 整体回顾

本项目是一个基于 Vue3 + TypeScript + Vite + Element Plus 构建的企业级中后台管理系统。今天完成了从基础业务 CRUD 到高级工程化基建的全面演进。核心涵盖了**无感刷新鉴权**、**RBAC 权限控制**、**高级组件抽象**以及**全自动按需构建**。

---

## 模块一：核心网络与安全基建 (Network & Security)

### 1. Token 无感刷新与并发队列拦截

- **思路**：使用 AccessToken (短效) + RefreshToken (长效) 双令牌机制。当请求返回 401 过期时，拦截器暂停后续请求，使用 RefreshToken 换取新 Token，随后重发被暂停的请求。
- **实现步骤**：
  1. 在 `Pinia` 的 UserStore 中持久化存储 `accessToken` 和 `refreshToken`。
  2. 在 Axios 响应拦截器中捕获 `401 Unauthorized` 错误。
  3. 引入 `isRefreshing` 状态锁，防止多个 401 请求触发多次刷新接口。
  4. 引入 `requestsQueue` 数组，将锁定期内的其他失败请求的 Promise `resolve` 回调存入队列。
  5. 刷新成功后，更新本地 Token，遍历执行队列中的请求，实现用户全程无感知。

### 2. Axios 全局请求防抖 (防止重复提交)

- **思路**：利用原生 `AbortController`，在发出新请求前，检查是否已有相同（Method + URL + 参数）的请求处于 Pending 状态。如果有，则强行取消旧请求。
- **实现步骤**：
  1. 创建 `pendingMap` (Map 数据结构) 存储当前执行中的请求。
  2. 编写 `getPendingKey` 函数，根据请求配置生成唯一标识 Key。
  3. 在请求拦截器中，实例化 `new AbortController()` 注入到 `config.signal`，并存入 Map。
  4. 每次发请求前调用 `removePending` 取消并移除同名请求；请求响应结束后（无论成功失败）从 Map 中清除该请求。

---

## 模块二：RBAC 动态权限控制 (Role-Based Access Control)

- **思路**：前端权限分为“视觉层拦截（菜单隐藏）”和“物理层拦截（路由守卫）”。根据登录用户的身份标识（Role/Username），动态决定其访问权限。
- **实现步骤**：
  1. **状态定义**：在 Pinia 中定义 `isAdmin` 计算属性（依据业务规则，如指定 username 为 admin）。
  2. **菜单动态渲染**：在 `Layout.vue` 的侧边栏 `<el-menu-item>` 中，使用 `v-if="userStore.isAdmin"` 动态隐藏非权限菜单。
  3. **路由元信息标识**：在 `router/index.ts` 中，为受保护的路由添加 `meta: { requireAdmin: true }`。
  4. **全局前置守卫**：在 `router.beforeEach` 中，判断 `to.meta.requireAdmin && !userStore.isAdmin`，若越权则使用 `ElMessage` 报错并拦截回首页。

---

## 模块三：高级组件抽象封装 (Component Abstraction)

### 1. 高级表格组件 `<ProTable>`

- **思路**：践行“数据驱动视图”与“约定大于配置”的理念。通过传入一份 JSON 配置数组，由底层组件自动遍历渲染常规文本列，利用 Vue 作用域插槽将复杂 UI 的渲染权交还给父组件。
- **实现步骤**：
  1. 封装 `ProTable.vue`，接收 `data` 和 `columns` 属性。
  2. 使用 `v-for` 遍历 `columns`，判断列配置中是否存在 `slot` 属性。
  3. 若无 `slot`，直接渲染原生 `<el-table-column :prop="col.prop">`。
  4. 若有 `slot`，使用 `<slot :name="col.slot" :row="scope.row">` 暴露出当前行数据。
  5. 父组件中仅需维护极为干净的 `tableColumns` 数组和对应的 `<template #slotName>`。

### 2. 双向绑定分页组件 `<Pagination>`

- **思路**：抽离重复的分页逻辑，利用 Vue3 的 `defineModel` 宏实现父子组件数据状态的实时同步。
- **实现步骤**：
  1. 在 `Pagination.vue` 中定义 `defineModel('currentPage')` 和 `defineModel('pageSize')`。
  2. 监听页码和条数变化，重置越界页码（如切条数时归位第一页），并向外 `emit('change')` 事件。
  3. 业务页面仅需使用 `<Pagination v-model:current-page="..." @change="fetchData" />` 即可接入。

---

## 模块四：业务闭环 (Business Modules)

### 1. 三层架构规范 (Types -> API -> Views)

每个业务模块严格遵循解耦规范：

1. **Types** (`src/types/*.ts`)：定义请求入参、响应实体、分页结构，享受极致的 TS 智能提示。
2. **API** (`src/api/modules/*.ts`)：专注封装网络请求，隔离底层 Http 逻辑。
3. **Views** (`src/views/*.vue`)：专注 UI 渲染与状态调度。

### 2. 已落地模块

- **数据大盘 (Dashboard)**：对接 ECharts，实现自适应尺寸的柱状图与统计卡片。
- **商品管理 (Products)**：包含服务端分页、动态搜索、骨架屏加载，解决表单 DTO 痛点（提交时剥离 `id` 等只读字段，使用 `PATCH` 局部更新）。
- **用户管理 (Users)**：基于 ProTable 实现带头像和状态标签的员工列表。
- **内容管理 (Posts)**：处理复杂的嵌套对象渲染（如 Tags 数组展示为多个 `<el-tag>`，Reactions 对象拆分展示点赞/踩图标）。

---

## 模块五：工程化体验与部署优化 (DevOps & UX)

### 1. API 与组件全自动按需导入 (解放双手)

- **实现**：引入 `unplugin-auto-import` 和 `unplugin-vue-components` Vite 插件。
- **效果**：全局无需再手写 `import { ref, onMounted } from 'vue'`，也无需手写引入 Element Plus 组件与自定义公共组件，极大提升开发心流，同时自动做到 Tree-shaking 减小打包体积。

### 2. 环境变量隔离

- **实现**：建立 `.env.development` 和 `.env.production`，抽离 `VITE_APP_BASE_API`。
- **效果**：在 `http.ts` 中通过 `import.meta.env` 读取，实现本地开发与线上部署接口域名的自动切换。

### 3. 极致用户体验 (UX)

- **NProgress 顶部进度条**：在 Router 守卫中挂载 `start()` 和 `done()`，缓解接口等待焦虑。
- **优雅的 Layout**：集成名言 API 实现动态每日格言，结合 El-Dropdown 封装带有真实头像的用户下拉控制台。
- **全局 404 兜底**：正则匹配路由 `/:pathMatch(.*)*`，拦截全部异常路径访问。

---

> **架构师寄语：** 代码是抄不完的，但思路是通用的。本项目展现的是处理复杂前端工程的底层逻辑，掌握这套逻辑，便具备了独立架构中大型 B 端系统的能力。
