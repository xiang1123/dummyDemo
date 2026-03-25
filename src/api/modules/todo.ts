// src/api/modules/todo.ts
import http from '../http'
import type { Todo, TodoListResponse } from '../../types/todo'

export const getTodosAPI = (limit: number, skip: number) => {
  return http.get<any, TodoListResponse>(`/todos?limit=${limit}&skip=${skip}`)
}

export const searchTodosAPI = async (
  query: string,
  completed: '' | 'true' | 'false',
  limit: number,
  skip: number,
) => {
  // DummyJSON todos 无通用 search 端点，这里统一做本地过滤。
  const res = await http.get<any, TodoListResponse>('/todos?limit=0')
  const keyword = query.trim().toLowerCase()

  let matched = res.todos
  if (keyword) {
    matched = matched.filter((item) => item.todo.toLowerCase().includes(keyword))
  }
  if (completed) {
    const completedFlag = completed === 'true'
    matched = matched.filter((item) => item.completed === completedFlag)
  }

  return {
    todos: matched.slice(skip, skip + limit),
    total: matched.length,
    skip,
    limit,
  } as TodoListResponse
}

export const addTodoAPI = (data: Partial<Todo>) => {
  return http.post<any, Todo>('/todos/add', data)
}

export const updateTodoAPI = (id: number, data: Partial<Todo>) => {
  return http.put<any, Todo>(`/todos/${id}`, data)
}

export const deleteTodoAPI = (id: number) => {
  return http.delete<any, Todo>(`/todos/${id}`)
}
