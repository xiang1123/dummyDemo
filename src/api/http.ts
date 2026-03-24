// src/api/http.ts
import axios from 'axios'
import type { InternalAxiosRequestConfig } from 'axios'
import { ElMessage } from 'element-plus'
import { useUserStore } from '../stores/user'
import { refreshTokenAPI } from './modules/auth'

// ==========================================
// 核心机制：重复请求拦截 (AbortController)
// ==========================================
const pendingMap = new Map<string, AbortController>()

// 1. 生成每个请求的唯一标识 (Method + URL + 参数)
const getPendingKey = (config: InternalAxiosRequestConfig) => {
  return [
    config.method,
    config.url,
    JSON.stringify(config.params),
    JSON.stringify(config.data)
  ].join('&')
}

// 2. 移除并取消请求
const removePending = (config: InternalAxiosRequestConfig) => {
  const pendingKey = getPendingKey(config)
  if (pendingMap.has(pendingKey)) {
    const abortController = pendingMap.get(pendingKey)
    // 触发取消动作
    abortController?.abort('重复请求被自动拦截取消')
    pendingMap.delete(pendingKey)
  }
}

// 3. 将新请求加入 Map
const addPending = (config: InternalAxiosRequestConfig) => {
  const pendingKey = getPendingKey(config)
  const abortController = new AbortController()
  config.signal = abortController.signal
  pendingMap.set(pendingKey, abortController)
}
// ==========================================

const http = axios.create({
  // ✅ 优化 1：不再写死 URL，从刚才配的环境变量里动态读取
  baseURL: import.meta.env.VITE_APP_BASE_API,
  timeout: 10000
})

let isRefreshing = false
let requestsQueue: Array<() => void> = []

// ================= 请求拦截器 =================
http.interceptors.request.use(
  (config) => {
    // ✅ 优化 2：发请求前，先看看有没有一模一样的请求在跑，如果有，干掉它！
    removePending(config)
    addPending(config)

    const userStore = useUserStore()
    if (userStore.accessToken) {
      config.headers.Authorization = `Bearer ${userStore.accessToken}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ================= 响应拦截器 =================
http.interceptors.response.use(
  (response) => {
    // ✅ 优化 3：请求正常回来了，从 Map 里把这个记录清掉
    removePending(response.config)
    return response.data
  },
  async (error) => {
    // 如果是因为我们主动 abort 取消的请求，直接忽略，不弹报错提示
    if (axios.isCancel(error)) {
      console.warn('请求被取消:', error.message)
      return Promise.reject(error)
    }

    // 发生报错了，也要从 Map 里清掉
    if (error.config) removePending(error.config)

    const userStore = useUserStore()
    const originalRequest = error.config

    // 👇 下面是我们之前写好的无感刷新 Token 逻辑，保持不变 👇
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          requestsQueue.push(() => {
            originalRequest.headers.Authorization = `Bearer ${userStore.accessToken}`
            resolve(http(originalRequest))
          })
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        if (!userStore.refreshToken) throw new Error('No refresh token')
        const res = await refreshTokenAPI(userStore.refreshToken)
        userStore.setLoginData(res)
        requestsQueue.forEach((callback) => callback())
        requestsQueue = []
        originalRequest.headers.Authorization = `Bearer ${res.accessToken}`
        return http(originalRequest)
      } catch (refreshError) {
        ElMessage.error('登录状态已失效，请重新登录')
        userStore.logout()
        requestsQueue = []
        window.location.href = '/login'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    if (error.response?.status !== 401) {
      ElMessage.error(error.response?.data?.message || '网络请求失败')
    }

    return Promise.reject(error)
  }
)

export default http