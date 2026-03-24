// src/types/product.ts

// 1. 尺寸信息
export interface Dimensions {
  width: number;
  height: number;
  depth: number;
}

// 2. 评价信息
export interface Review {
  rating: number;
  comment: string;
  date: string;
  reviewerName: string;
  reviewerEmail: string;
}

// 3. 元数据
export interface Meta {
  createdAt: string;
  updatedAt: string;
  barcode: string;
  qrCode: string;
}

// 4. 完整的单条商品定义 (100% 还原后端字段)
export interface Product {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  tags: string[];
  brand: string;
  sku: string;
  weight: number;
  dimensions: Dimensions;
  warrantyInformation: string;
  shippingInformation: string;
  availabilityStatus: string;
  reviews: Review[];
  returnPolicy: string;
  minimumOrderQuantity: number;
  meta: Meta;
  thumbnail: string;
  images: string[];
}

// 5. 列表接口的返回类型
export interface ProductListResponse {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
}