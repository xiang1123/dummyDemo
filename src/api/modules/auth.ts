import http from "../http";
import type { LoginData, LoginResponse } from "../../types/auth";

export const loginAPI = (data: LoginData) => {
  return http.post<any, LoginResponse>('/auth/login', data)
}

export const refreshTokenAPI = (refreshToken: string) => {
  return http.post<any, LoginResponse>('/auth/refresh', {
    refreshToken,
    expiresInMins: 180
  })
}