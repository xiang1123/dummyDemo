# Dummy Admin 从 0 到 1 全面总结（完整版 README）

> 项目名：`dummyDemo`  
> 基础 API：`https://dummyjson.com`  
> 技术定位：Vue 3 + TypeScript + Element Plus 的中后台实战练习项目

---

## 1. 项目是什么

这是一个围绕 **DummyJSON** 搭建的前端管理系统练习项目，目标不是做“页面堆砌”，而是完整模拟一个中后台从 0 到 1 的技术落地过程：

- 登录鉴权（Token + 刷新机制）
- 路由守卫与角色权限控制
- 列表分页、搜索、增删改
- 统一请求层与错误处理
- 通用组件封装（搜索/表格/分页）
- 业务逻辑抽离（`composables`）

这套项目非常适合：

- 刚学完 Vue3，想做结构化实战
- 想建立“组件封装 + 业务抽象”的工程意识
- 面试前需要一个可讲述、可拓展的后台项目

---

## 2. 技术栈与工程配置

### 2.1 前端框架与库

- `Vue 3.5`（Composition API + `<script setup>`）
- `TypeScript 5`
- `Vue Router 4`
- `Pinia 3`
- `Element Plus`
- `Axios`
- `ECharts`

### 2.2 构建与工具链

- `Vite`
- 自动导入：`unplugin-auto-import`、`unplugin-vue-components`
- 类型检查：`vue-tsc`
- 代码规范：`eslint` + `prettier`
- 测试入口：`vitest`（当前项目无单测用例）

### 2.3 环境变量

- `.env.development`
- `.env.production`

核心变量：

- `VITE_APP_BASE_API=https://dummyjson.com`

---

## 3. 项目目录（按职责解释）

```text
src/
├─ api/                    # 请求层
│  ├─ http.ts              # axios实例 + 拦截器 + token刷新 + 重复请求取消
│  └─ modules/             # 各业务模块 API 封装
├─ components/             # 通用组件
│  ├─ ProSearch.vue        # 列配置驱动的搜索表单
│  ├─ ProTable.vue         # 列配置 + slot 混合渲染表格
│  └─ Pagination.vue       # 统一分页器
├─ composables/            # 业务逻辑抽离
│  ├─ useTablePage.ts      # 列表页分页/加载/搜索统一
│  └─ useConfirmDelete.ts  # 删除确认与删除流程统一
├─ layout/
│  └─ index.vue            # 主框架布局（侧边栏 + 顶栏 + 内容区）
├─ router/
│  └─ index.ts             # 路由表 + 登录守卫 + 管理员权限控制
├─ stores/
│  └─ user.ts              # 用户状态、token、本地缓存、角色判断
├─ types/                  # TS 类型定义
├─ utils/
│  └─ error.ts             # 统一错误提取与日志
└─ views/                  # 业务页面
```

---

## 4. 从 0 到 1 的建设路径（完整思路）

## 4.1 第一步：先打“底盘”

1. 初始化 Vue3 + TS + Vite
2. 接入 Vue Router、Pinia、Element Plus
3. 设计主布局 `layout/index.vue`
4. 建立基础路由（登录页 / 框架页 / 404）

目标：先让应用“可跑、可导航、可扩展”。

## 4.2 第二步：统一请求层（不是各页面乱写 axios）

在 `src/api/http.ts` 中统一做了：

- `baseURL` 从环境变量读取
- 请求拦截：自动带 `Authorization`
- 重复请求取消（`AbortController` + `pendingMap`）
- 响应拦截：统一返回 `response.data`
- `401` 无感刷新 token
- 非 `401` 错误统一 `ElMessage`

这一步是后台项目的核心，后续页面都建立在它上面。

## 4.3 第三步：鉴权闭环

- `loginAPI` 登录获取 token
- `userStore` 持久化 token + 用户信息到 `localStorage`
- 路由守卫：无 token 强制跳登录
- 权限路由：`meta.requireAdmin` + `store.isAdmin` 控制

说明：当前管理员判定逻辑是演示型（`username === 'emilys'`），真实项目应改为后端 role 字段。

## 4.4 第四步：先做“可复用”再做“功能页”

先封装：

- `ProTable`：列配置 + slot
- `ProSearch`：由列配置自动生成查询控件
- `Pagination`：分页参数双向绑定 + change 事件统一

然后所有列表页统一按同一范式开发，避免重复造轮子。

## 4.5 第五步：逐个业务页落地

页面已覆盖：

- Dashboard
- User（管理员）
- Products（管理员）
- Posts
- Recipes
- Comments
- Todos

每页都有真实的列表拉取、分页、搜索、删除，部分页面有新增/编辑。

## 4.6 第六步：二次重构（关键）

为解决“多页面同构逻辑重复”问题，抽了 composables：

1. `useTablePage`
- 统一 `loading/tableData/currentPage/pageSize/total`
- 统一 `fetchTableData / handleSearch`

2. `useConfirmDelete`
- 统一删除弹窗确认
- 统一删除成功提示
- 统一删除失败日志

这样代码更短、更一致、更容易维护。

---

## 5. 页面功能说明（最终状态）

## 5.1 Login

- 用户名密码登录
- 成功后写入 store 与 localStorage
- 跳转 `/dashboard`

## 5.2 Dashboard

- 拉取产品/用户/帖子总数
- ECharts 展示热门商品库存柱状图

## 5.3 User（管理员）

- 列表分页、关键词搜索
- 新增员工
- 编辑员工
- 删除员工（统一删除流程）

## 5.4 Products（管理员）

- 列表分页、关键词搜索
- 新增商品
- 编辑商品
- 删除商品（统一删除流程）

## 5.5 Posts

- 列表分页、标题搜索
- 查看帖子详情抽屉
- 删除帖子

## 5.6 Recipes

- 列表分页、名称搜索、难度筛选
- 查看食谱详情抽屉（食材/步骤）
- 新增、编辑、删除
- 对 DummyJSON 更新异常做了前端兜底

## 5.7 Comments

- 列表分页、评论内容搜索
- 删除评论
- 由于后端无 `comments/search`，改为本地过滤方案

## 5.8 Todos

- 列表分页、关键词 + 完成状态组合筛选
- 新增/编辑/删除
- `el-switch` 切换完成状态
- 由于后端无通用 `todos/search`，改为本地过滤方案

---

## 6. 核心难点与解决方案（项目最有价值的部分）

## 6.1 回车触发刷新页面

问题：`el-form` 在搜索框回车会触发原生 submit 导致刷新。  
解决：

- `@submit.prevent`
- `@keyup.enter.prevent`
- 按钮 `native-type="button"`

## 6.2 后端搜索接口缺失（Comments / Todos）

问题：DummyJSON 并非每个模块都支持 `/search`。  
解决：

- 拉全量（`limit=0`）
- 前端本地 `filter`
- 再做 `slice(skip, skip+limit)` 模拟分页

## 6.3 Recipes 更新报 “id not found”

问题：演示 API 行为不稳定，某些 id 更新失败。  
解决：

- 独立保存 `editingId`
- 更新失败时 `not found` 做本地数据回退更新

## 6.4 重复请求并发问题

问题：快速点击/输入触发重复请求，结果乱序。  
解决：`http.ts` 中用 `AbortController` + `pendingMap` 自动取消同 key 请求。

## 6.5 Token 过期体验

问题：过期直接踢登录体验差。  
解决：拦截器内 `401` 自动刷新 token，队列重放请求，实现“无感刷新”。

---

## 7. 关键代码（建议重点阅读）

- 请求拦截 + 刷新 token：`src/api/http.ts`
- 路由守卫与角色权限：`src/router/index.ts`
- 用户状态持久化：`src/stores/user.ts`
- 可配置搜索组件：`src/components/ProSearch.vue`
- 可配置表格组件：`src/components/ProTable.vue`
- 分页组件：`src/components/Pagination.vue`
- 列表逻辑抽离：`src/composables/useTablePage.ts`
- 删除逻辑抽离：`src/composables/useConfirmDelete.ts`
- 统一错误输出：`src/utils/error.ts`

---

## 8. 运行方式

## 8.1 安装依赖

```bash
pnpm install
# 或 npm install
```

## 8.2 开发运行

```bash
pnpm dev
```

## 8.3 打包与检查

```bash
pnpm typecheck
pnpm lint
pnpm build
```

## 8.4 代码格式

```bash
pnpm format
pnpm format:check
```

---

## 9. 当前已知说明

1. DummyJSON 写操作（POST/PUT/PATCH/DELETE）是模拟成功，不会真实持久化。
2. `Comments`/`Todos` 搜索为前端过滤策略。
3. `test` 命令在某些 Windows 环境可能出现 `spawn EPERM`（与本机权限/安全策略相关）。
4. 当前 lint 脚本配置只扫描 `src/**/*.ts`，`.vue` 全量 lint 可后续升级。

---

## 10. 项目 API 封装清单（按代码实际）

## 10.1 Auth

- `POST /auth/login`
- `POST /auth/refresh`

## 10.2 Dashboard

- `GET /products?limit=1`
- `GET /users?limit=1`
- `GET /posts?limit=1`
- `GET /products?limit=8`（图表）

## 10.3 System

- `GET /quotes/random`

## 10.4 Users

- `GET /users?limit=&skip=`
- `GET /users/search?q=&limit=&skip=`
- `POST /users/add`
- `PATCH /users/:id`
- `DELETE /users/:id`

## 10.5 Products

- `GET /products?limit=&skip=`
- `GET /products/search?q=&limit=&skip=`
- `POST /products/add`
- `PATCH /products/:id`
- `DELETE /products/:id`

## 10.6 Posts

- `GET /posts?limit=&skip=`
- `GET /posts/search?q=&limit=&skip=`
- `DELETE /posts/:id`

## 10.7 Recipes

- `GET /recipes?limit=&skip=`
- `GET /recipes/search?q=&limit=&skip=`
- `POST /recipes/add`
- `PATCH /recipes/:id`
- `DELETE /recipes/:id`

## 10.8 Comments

- `GET /comments?limit=&skip=`
- 搜索：本地过滤（先 `GET /comments?limit=0`）
- `DELETE /comments/:id`

## 10.9 Todos

- `GET /todos?limit=&skip=`
- 搜索：本地过滤（先 `GET /todos?limit=0`）
- `POST /todos/add`
- `PUT /todos/:id`
- `DELETE /todos/:id`

---

## 11. DummyJSON API 参考（保留版，便于继续扩展）

> 基础 URL：`https://dummyjson.com`  
> 说明：`POST/PUT/DELETE` 多为模拟成功返回，不会真实改库。

### 11.1 Auth

- `POST /auth/login`
- `GET /auth/me`
- `POST /auth/refresh`

### 11.2 Products

- `GET /products`
- `GET /products/1`
- `GET /products/search?q=phone`
- `GET /products/categories`
- `GET /products/category/smartphones`
- `POST /products/add`
- `PUT /products/1`
- `DELETE /products/1`

### 11.3 Users

- `GET /users`
- `GET /users/1`
- `GET /users/search?q=John`
- `GET /users/filter?key=hair.color&value=Brown`
- `POST /users/add`
- `PUT /users/1`
- `DELETE /users/1`

### 11.4 Carts

- `GET /carts`
- `GET /carts/1`
- `GET /carts/user/5`
- `POST /carts/add`
- `PUT /carts/1`
- `DELETE /carts/1`

### 11.5 Posts

- `GET /posts`
- `GET /posts/1`
- `GET /posts/search?q=love`
- `GET /posts/user/5`
- `GET /posts/1/comments`
- `POST /posts/add`
- `PUT /posts/1`
- `DELETE /posts/1`

### 11.6 Comments

- `GET /comments`
- `GET /comments/1`
- `GET /comments/post/1`
- `POST /comments/add`
- `PUT /comments/1`
- `DELETE /comments/1`

### 11.7 Todos

- `GET /todos`
- `GET /todos/1`
- `GET /todos/random`
- `GET /todos/user/5`
- `POST /todos/add`
- `PUT /todos/1`
- `DELETE /todos/1`

### 11.8 Recipes

- `GET /recipes`
- `GET /recipes/1`
- `GET /recipes/search?q=Margherita`
- `GET /recipes/tags`
- `GET /recipes/tag/pizza`
- `GET /recipes/meal-type/snack`

### 11.9 Quotes

- `GET /quotes`
- `GET /quotes/1`
- `GET /quotes/random`

### 11.10 Test & HTTP

- `GET /test`
- `GET /http/200`
- `GET /http/404`

---

## 12. 下一步可扩展方向（如果继续迭代）

1. 抽 `useCrudDialog`，统一弹窗增改提交流程。  
2. 升级 ESLint 到 `.vue` 全量检查。  
3. 新增测试用例（store、composables、关键页面交互）。  
4. 接入真实后端（替换 DummyJSON 模拟写接口）。  
5. 增加操作审计日志与更细粒度 RBAC。

---

如果你是把这个项目用于面试汇报，建议重点讲 4 件事：

1. 统一请求层（拦截器 + 刷新 token + 重复请求取消）  
2. 组件与业务抽象（ProSearch/ProTable/Pagination + composables）  
3. 后端能力不足时的前端补偿策略（Comments/Todos 本地搜索、Recipes 更新兜底）  
4. 从“能跑”到“可维护”的重构路径（去重复、统一错误处理、统一删除流程）
