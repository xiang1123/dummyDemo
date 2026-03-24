import axios from 'axios'
import { ElMessage } from 'element-plus'
import { useUserStore } from '../stores/user'
import { refreshTokenAPI } from './modules/auth'

const http = axios.create({
  baseURL: 'https://dummyjson.com',
  timeout: 10000,
})

/**
 * 全局变量，用于标记当前是否正在刷新访问令牌
 * 当值为true时，表示正在刷新令牌；当值为false时，表示未在刷新令牌
 */
let isRefreshing = false
let requestsQueue: Array<() => void> = []

/**
 * 请求拦截器
 * 在发送请求前对请求配置进行处理
 */
http.interceptors.request.use(
  (config) => {
    const userStore = useUserStore() // 获取用户状态管理store
    if (userStore.accessToken) {
      // 如果存在token
      config.headers.Authorization = `Bearer ${userStore.accessToken}` // 在请求头中添加Authorization字段，值为Bearer token
    }
    return config // 返回处理后的配置
  },
  (error) => Promise.reject(error), // 如果请求出错，则拒绝Promise并返回错误
)

/**
 * HTTP响应拦截器，用于处理响应数据和错误
 * 包括token刷新逻辑和错误处理
 */
http.interceptors.response.use(
  // 成功响应的处理函数
  (response) => {
    return response.data  // 只返回响应数据部分
  },

  // 错误响应的处理函数
  async (error) => {
    const userStore = useUserStore()  // 获取用户状态管理

    const originalRequest = error.config  // 获取原始请求配置

    // 处理401未授权错误，且该请求未重试过
    if (error.response?.status === 401 && !originalRequest._retry) {
      // 如果正在刷新token，将请求加入队列等待
      if (isRefreshing) {
        return new Promise((resolve) => {
          requestsQueue.push(() => {
            originalRequest.headers.Authorization = `Bearer ${userStore.accessToken}`
            resolve(http(originalRequest))
          })
        })
      }
      // 标记请求已重试，开始刷新token
      originalRequest._retry = true
      isRefreshing = true
      try {
        // 检查refreshToken是否存在
        if (!userStore.refreshToken) throw new Error('refreshToken不存在')
        // 调用刷新token接口
        const res = await refreshTokenAPI(userStore.refreshToken)
        userStore.setLoginData(res)  // 更新用户登录信息
        // 执行队列中的所有请求
        requestsQueue.forEach((cb) => cb())
        requestsQueue = []
        // 使用新token重新发起原始请求
        originalRequest.headers.Authorization = `Bearer ${userStore.accessToken}`
        return http(originalRequest)
      } catch (refreshError) {
        // 刷新token失败，提示用户重新登录
        ElMessage.error('登录已过期，请重新登录')
        userStore.logout()  // 清除用户登录状态
        requestsQueue = []  // 清空请求队列
        window.location.href = '/login'  // 跳转到登录页
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false  // 重置刷新状态
      }
    }

    // 处理非401错误
    if (error.response?.status !== 401) {
      ElMessage.error(error.response?.data.message || '请求失败')
    }
    return Promise.reject(error) // 将错误继续传递下去
  },
)

export default http
