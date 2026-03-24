import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { LoginResponse } from '../types/auth'

export const useUserStore = defineStore('user', () => {
  const accessToken = ref(localStorage.getItem('dummy_access_token') || '')
  const refreshToken = ref(localStorage.getItem('dummy_refresh_token') || '')

  const userInfo = ref<Partial<LoginResponse>>(
    JSON.parse(localStorage.getItem('dummy_user') || '{}'),
  )

  const setLoginData = (data: LoginResponse) => {
    accessToken.value = data.accessToken
    refreshToken.value = data.refreshToken
    userInfo.value = data
    localStorage.setItem('dumy_token', data.accessToken)
    localStorage.setItem('dummy_refresh_token', data.refreshToken)
    localStorage.setItem('dummy_user', JSON.stringify(data))
  }

  const logout = () => {
    accessToken.value = ''
    refreshToken.value = ''
    userInfo.value = {}
    localStorage.removeItem('dumy_token')
    localStorage.removeItem('dummy_refresh_token')
    localStorage.removeItem('dummy_user')
  }

  return { accessToken, refreshToken, userInfo, setLoginData, logout }
})
