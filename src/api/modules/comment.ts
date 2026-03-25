// src/api/modules/comment.ts
import http from '../http';
import type { Comment, CommentListResponse } from '../../types/comment';

// 获取评论列表
export const getCommentsAPI = (limit: number, skip: number) => {
  return http.get<any, CommentListResponse>(`/comments?limit=${limit}&skip=${skip}`);
}

// 搜索评论 (DummyJSON 支持按评论内容搜索)
export const searchCommentsAPI = async (query: string, limit: number, skip: number) => {
  // DummyJSON comments 无 /comments/search 端点，这里改为拉全量后本地过滤。
  const res = await http.get<any, CommentListResponse>('/comments?limit=0');
  const keyword = query.trim().toLowerCase();
  const matched = res.comments.filter((item) =>
    item.body.toLowerCase().includes(keyword),
  );

  return {
    comments: matched.slice(skip, skip + limit),
    total: matched.length,
    skip,
    limit,
  } as CommentListResponse;
}

// 删除评论
export const deleteCommentAPI = (id: number) => {
  return http.delete<any, Comment>(`/comments/${id}`);
}
