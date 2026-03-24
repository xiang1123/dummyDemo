# 📚 DummyJSON 完整 API 参考手册

> **基础 URL (Base URL):** `https://dummyjson.com`
> **说明:** 所有 `POST`, `PUT`, `DELETE` 请求都会返回模拟成功的响应，但不会真正修改服务器上的数据。

---

## 🔐 1. Auth (鉴权接口)

用于模拟用户登录和 JWT Token 获取。

- `POST /auth/login`：用户登录。需传递 `username` 和 `password`。
- `GET /auth/me`：获取当前登录用户信息。请求头需带 `Authorization: Bearer <token>`。
- `POST /auth/refresh`：刷新 Token。需传递 `refreshToken` 和过期时间 `expiresInMins`。

---

## 🛍️ 2. Products (商品接口)

支持通用查询参数：`?limit=10&skip=10` (分页) 和 `?select=title,price` (按需返回字段)。

- `GET /products`：获取所有商品列表。
- `GET /products/1`：获取 ID 为 1 的商品详情。
- `GET /products/search?q=phone`：根据关键词模糊搜索商品。
- `GET /products/categories`：获取所有商品分类的列表。
- `GET /products/category/smartphones`：获取指定分类（如 smartphones）下的所有商品。
- `POST /products/add`：新增一个商品。
- `PUT /products/1`：更新 ID 为 1 的商品信息。
- `DELETE /products/1`：删除 ID 为 1 的商品。

---

## 👥 3. Users (用户接口)

支持分页和字段选择参数。

- `GET /users`：获取所有用户列表。
- `GET /users/1`：获取 ID 为 1 的用户详情。
- `GET /users/search?q=John`：根据关键词模糊搜索用户。
- `GET /users/filter?key=hair.color&value=Brown`：按精确字段过滤用户（例如：头发颜色为棕色）。
- `POST /users/add`：新增一个用户。
- `PUT /users/1`：更新 ID 为 1 的用户信息。
- `DELETE /users/1`：删除 ID 为 1 的用户。

---

## 🛒 4. Carts (购物车接口)

购物车数据与商品、用户数据相互关联。

- `GET /carts`：获取所有购物车列表。
- `GET /carts/1`：获取 ID 为 1 的购物车详情。
- `GET /carts/user/5`：获取指定用户（userId=5）名下的所有购物车。
- `POST /carts/add`：新增购物车。需传递 `userId` 和包含 `id`、`quantity` 的 `products` 数组。
- `PUT /carts/1`：更新购物车（可以修改商品数量等）。
- `DELETE /carts/1`：删除购物车。

---

## 📝 5. Posts (帖子/文章接口)

支持分页和字段选择。

- `GET /posts`：获取所有帖子。
- `GET /posts/1`：获取 ID 为 1 的单篇帖子。
- `GET /posts/search?q=love`：根据关键词搜索帖子。
- `GET /posts/user/5`：获取指定用户（userId=5）发布的所有帖子。
- `GET /posts/1/comments`：获取指定帖子（postId=1）下的所有评论。
- `POST /posts/add`：新增帖子。需传递 `title`, `userId` 等字段。
- `PUT /posts/1`：更新帖子。
- `DELETE /posts/1`：删除帖子。

---

## 💬 6. Comments (评论接口)

支持分页和字段选择。

- `GET /comments`：获取所有评论。
- `GET /comments/1`：获取 ID 为 1 的评论详情。
- `GET /comments/post/1`：获取指定帖子（postId=1）下的所有评论。
- `POST /comments/add`：新增评论。需传递 `body`, `postId`, `userId`。
- `PUT /comments/1`：更新评论。
- `DELETE /comments/1`：删除评论。

---

## ✅ 7. Todos (待办事项接口)

支持分页。

- `GET /todos`：获取所有待办事项。
- `GET /todos/1`：获取 ID 为 1 的待办事项。
- `GET /todos/random`：随机获取一条待办事项。
- `GET /todos/user/5`：获取指定用户（userId=5）的所有待办事项。
- `POST /todos/add`：新增待办事项。需传递 `todo`, `completed`, `userId`。
- `PUT /todos/1`：更新待办事项（通常用于切换完成状态）。
- `DELETE /todos/1`：删除待办事项。

---

## 🍲 8. Recipes (食谱接口)

适合做图片卡片布局的复杂数据流。

- `GET /recipes`：获取所有食谱列表。
- `GET /recipes/1`：获取 ID 为 1 的食谱详情。
- `GET /recipes/search?q=Margherita`：搜索食谱。
- `GET /recipes/tags`：获取所有的食谱标签分类（如 Italian, Asian）。
- `GET /recipes/tag/pizza`：获取指定标签下的所有食谱。
- `GET /recipes/meal-type/snack`：按用餐类型（如 breakfast, lunch, snack）获取食谱。

---

## ✒️ 9. Quotes (名言警句接口)

- `GET /quotes`：获取所有名言。
- `GET /quotes/1`：获取 ID 为 1 的名言。
- `GET /quotes/random`：随机获取一条名言。

---

## 🛠️ 10. Test & HTTP (测试辅助接口)

- `GET /test`：测试接口连通性（返回 `{ "status": "ok", "method": "GET" }`）。
- `GET /http/200`：模拟返回 200 HTTP 状态码。
- `GET /http/404`：模拟返回 404 HTTP 状态码（支持自定义获取各种错误状态，用于测试 Axios 错误拦截器）。
