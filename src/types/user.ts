// 单个用户的类型定义
export interface User {
  id: number;
  firstName: string;
  lastName: string;
  age: number;
  gender: string;
  email: string;
  phone: string;
  username: string;
  image: string; // 头像URL
  role: string;  // 角色 (admin, user 等)
}

// 用户列表接口的返回类型
export interface UserListResponse {
  users: User[];
  total: number;
  skip: number;
  limit: number;
}