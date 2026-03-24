import http from "../http";
import type { ProductListResponse } from "../../types/product";

export const getProductsAPI = (limit: number, skip: number) => {
  return http.get<any, ProductListResponse>(`/products?limit=${limit}&skip=${skip}`)
}

export const searchProductsAPI = (query: string, limit: number, skip: number) => {
  return http.get<any, ProductListResponse>(`/products/search?q=${query}&limit=${limit}&skip=${skip}`)
}
