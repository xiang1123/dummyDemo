import http from "../http"

/**
 * 获取系统统计数据，包括产品总数、用户总数和帖子总数
 * 通过并行请求三个不同的API端点来获取数据
 * @returns {Promise<{products: number, users: number, posts: number}>} 返回包含产品、用户和帖子总数的对象
 */
export const getStatsAPI = async () => {
  // 使用Promise.all并行请求三个API，获取各自总数
  const [products, users, posts, todos] = await Promise.all([
    // 获取产品总数，限制返回1条记录以只获取总数信息
    http.get<any, { total: number }>('/products?limit=1'),
    // 获取用户总数，限制返回1条记录以只获取总数信息
    http.get<any, { total: number }>('/users?limit=1'),
    // 获取帖子总数，限制返回1条记录以只获取总数信息
    http.get<any, { total: number }>('/posts?limit=1'),
    // 获取待办总数
    http.get<any, { total: number }>('/todos?limit=1'),
  ])

  // 返回包含各类总数的结果对象
  return {
    productCount: products.total,
    userCount: users.total,
    postCount: posts.total,
    todoCount: todos.total,
  }
}

/**
 * 获取图表数据的API函数
 * 该函数通过HTTP GET请求获取产品数据，限制返回8条记录
 * @returns 返回一个Promise，解析为包含products数组的数据对象
 */
export const getChartDataAPI = () => {
  return http.get<any, { products: any[] }>('/products?limit=8')
}

export const getPostTrendAPI = () => {
  return http.get<any, { posts: any[] }>('/posts?limit=8')
}

export const getTodoOverviewAPI = () => {
  return http.get<any, { todos: any[] }>('/todos?limit=30')
}
