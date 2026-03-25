// src/types/comment.ts

export interface CommentUser {
  id: number;
  username: string;
  fullName: string;
}

export interface Comment {
  id: number;
  body: string; // 评论内容
  postId: number; // 关联的帖子ID
  likes: number; // 点赞数
  user: CommentUser; // 🌟 嵌套对象：发表评论的用户信息
}

export interface CommentListResponse {
  comments: Comment[];
  total: number;
  skip: number;
  limit: number;
}