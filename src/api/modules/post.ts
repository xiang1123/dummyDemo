import http from '../http'
import type { Post, PostListResponse } from '../../types/post'

// 1. 获取帖子列表
export const getPostsAPI = (limit: number, skip: number) => {
  return http.get<any, PostListResponse>(`/posts?limit=${limit}&skip=${skip}`)
}

// 2. 搜索帖子
export const searchPostsAPI = (query: string, limit: number, skip: number) => {
  return http.get<any, PostListResponse>(`/posts/search?q=${query}&limit=${limit}&skip=${skip}`)
}


// 3. 删除帖子
export const deletePostAPI = (id: number) => {
  return http.delete<any, Post>(`/posts/${id}`)
}