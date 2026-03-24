import http from '../http'
import type { User, UserListResponse } from '../../types/user'

// 1. 获取用户列表
export const getUsersAPI = (limit: number, skip: number) => {
  return http.get<any, UserListResponse>(`/users?limit=${limit}&skip=${skip}`)
}

// 2. 搜索用户
export const searchUsersAPI = (query: string, limit: number, skip: number) => {
  return http.get<any, UserListResponse>(`/users/search?q=${query}&limit=${limit}&skip=${skip}`)
}

// 3. 新增用户
export const addUserAPI = (data: Partial<User>) => {
  return http.post<any, User>('/users/add', data)
}

// 4. 修改用户 (坚持使用 PATCH 局部更新)
export const updateUserAPI = (id: number, data: Partial<User>) => {
  return http.patch<any, User>(`/users/${id}`, data)
}

// 5. 删除用户
export const deleteUserAPI = (id: number) => {
  return http.delete<any, User>(`/users/${id}`)
}