import http from '../http'

// 随机名言的接口返回类型
export interface QuoteResponse {
  id: number;
  quote: string;
  author: string;
}

// 获取随机名言
export const getRandomQuoteAPI = () => {
  return http.get<any, QuoteResponse>('/quotes/random')
}