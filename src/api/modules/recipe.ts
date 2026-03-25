import type { Recipe, RecipeListResponse } from './../../types/recipe';
import http from "../http";


export const getRecipesAPI = (limit: number, skip: number) => {
  return http.get<any, RecipeListResponse>(`/recipes?limit=${limit}&skip=${skip}`)
}

export const searchRecipesAPI = (query: string, limit: number, skip: number) => {
  return http.get<any, RecipeListResponse>(`/recipes/search?q=${query}&limit=${limit}&skip=${skip}`)
}

export const addRecipeAPI = (data: Partial<Recipe>) => {
  return http.post<any, Recipe>(`/recipes/add`, data)
}

export const updateRecipeAPI = (id: number, data: Partial<Recipe>) => {
  return http.patch<any, Recipe>(`/recipes/${id}`, data)
}

export const deleteRecipeAPI = (id: number) => {
  return http.delete<any, Recipe>(`/recipes/${id}`)
} 
