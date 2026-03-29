import { ElMessage, ElMessageBox } from 'element-plus'
import 'element-plus/es/components/message-box/style/css'
import 'element-plus/es/components/message/style/css'
import { logError } from '../utils/error'

interface ConfirmDeleteParams {
  message: string
  request: () => Promise<unknown>
  successMessage?: string
  title?: string
  confirmButtonText?: string
  cancelButtonText?: string
  type?: 'warning' | 'info' | 'success' | 'error'
  errorContext?: string
  onSuccess?: () => void | Promise<void>
}

export const useConfirmDelete = () => {
  const confirmAndDelete = async (params: ConfirmDeleteParams) => {
    try {
      await ElMessageBox.confirm(params.message, params.title ?? '警告', {
        confirmButtonText: params.confirmButtonText ?? '确定删除',
        cancelButtonText: params.cancelButtonText ?? '取消',
        type: params.type ?? 'warning',
      })

      await params.request()
      ElMessage.success(params.successMessage ?? '删除成功')
      await params.onSuccess?.()
      return true
    } catch (error) {
      if (error === 'cancel' || error === 'close') {
        return false
      }
      logError(params.errorContext ?? '删除失败', error)
      return false
    }
  }

  return {
    confirmAndDelete,
  }
}
