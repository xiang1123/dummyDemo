import axios from 'axios'

export const getErrorMessage = (error: unknown, fallback = '操作失败') => {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message
    if (typeof message === 'string' && message.trim()) return message
  }
  if (error instanceof Error && error.message) return error.message
  return fallback
}

export const logError = (context: string, error: unknown) => {
  console.error(`[${context}]`, getErrorMessage(error, context), error)
}
