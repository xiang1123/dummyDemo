// src/types/recipe.ts

// 单个食谱的数据结构
export interface Recipe {
  id: number;
  name: string; // 菜名
  ingredients: string[]; // 食材清单 (数组)
  instructions: string[]; // 烹饪步骤 (数组)
  prepTimeMinutes: number; // 准备时间(分钟)
  cookTimeMinutes: number; // 烹饪时间(分钟)
  servings: number; // 份量(适合几人食用)
  difficulty: string; // 难度 (Easy, Medium, Hard)
  cuisine: string; // 菜系 (如 Italian, Asian)
  caloriesPerServing: number; // 每份卡路里
  tags: string[]; // 标签
  userId: number; // 创作者ID
  image: string; // 菜品图片成品图
  rating: number; // 评分
  reviewCount: number; // 评论数
  mealType: string[]; // 用餐类型 (如 Dinner, Lunch, Snack)
}

// 列表接口返回类型
export interface RecipeListResponse {
  recipes: Recipe[];
  total: number;
  skip: number;
  limit: number;
}