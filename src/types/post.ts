// 单个帖子的点赞/踩 数据结构
export interface Reactions {
  likes: number;
  dislikes: number;
}

// 单个帖子的数据结构
export interface Post {
  id: number;
  title: string;
  body: string; // 文章正文
  tags: string[]; // 标签数组
  reactions: Reactions; // 互动数据
  views: number; // 浏览量
  userId: number; // 作者ID
}

// 帖子列表接口返回类型
export interface PostListResponse {
  posts: Post[];
  total: number;
  skip: number;
  limit: number;
}