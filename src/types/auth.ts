// src/types/auth.ts

export interface LoginData {
  username: string;
  password: string;
  expiresInMins?: number;
}

export interface LoginResponse {
  accessToken: string;  // ✅ 更新为真实字段
  refreshToken: string; // ✅ 新增字段
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  gender: string;
  image: string;
}