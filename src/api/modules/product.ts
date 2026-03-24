// src/api/modules/product.ts
import http from '../http'
import type { Product, ProductListResponse } from '../../types/product'

// 1. 获取商品列表
export const getProductsAPI = (limit: number, skip: number) => {
  return http.get<any, ProductListResponse>(`/products?limit=${limit}&skip=${skip}`)
}

// 2. 搜索商品
export const searchProductsAPI = (query: string, limit: number, skip: number) => {
  return http.get<any, ProductListResponse>(`/products/search?q=${query}&limit=${limit}&skip=${skip}`)
}

// ====== 👇 本次新增的接口 👇 ======

// 3. 新增商品 (Partial 表示允许传入商品对象的部分字段)
export const addProductAPI = (data: Partial<Product>) => {
  return http.post<any, Product>('/products/add', data)
}

// 4. 修改商品
export const updateProductAPI = (id: number, data: Partial<Product>) => {
  return http.patch<any, Product>(`/products/${id}`, data)
}

// 5. 删除商品
export const deleteProductAPI = (id: number) => {
  return http.delete<any, Product>(`/products/${id}`)
}