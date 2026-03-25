<template>
  <div class="comments-container">
    <ProSearch
      :columns="tableColumns"
      v-model:search-param="searchParam"
      @search="handleSearch"
      @reset="handleReset"
    />

    <el-card class="table-card" shadow="never">
      <ProTable :data="tableData" :loading="loading" :columns="tableColumns">
        <template #action="{ row }">
          <el-button size="small" type="danger" link @click="handleDelete(row)">
            <el-icon><Delete /></el-icon> 删除违规
          </el-button>
        </template>
      </ProTable>

      <Pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        @change="fetchTableData"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import {
  getCommentsAPI,
  searchCommentsAPI,
  deleteCommentAPI,
} from '../api/modules/comment'
import { Delete } from '@element-plus/icons-vue'
import type { Comment } from '../types/comment'
import { logError } from '../utils/error'
import { useTablePage } from '../composables/useTablePage'
import { useConfirmDelete } from '../composables/useConfirmDelete'

const searchParam = ref({
  body: '',
})
const { loading, tableData, currentPage, pageSize, total, fetchTableData, handleSearch } =
  useTablePage<Comment>({
    loadData: async ({ currentPage, pageSize }) => {
      const skip = (currentPage - 1) * pageSize
      const keyword = searchParam.value.body?.trim()
      let res

      try {
        if (keyword) {
          res = await searchCommentsAPI(keyword, pageSize, skip)
        } else {
          res = await getCommentsAPI(pageSize, skip)
        }

        return {
          list: res.comments,
          total: res.total,
        }
      } catch (error) {
        logError('获取评论失败', error)
        return { list: [], total: 0 }
      }
    },
  })
const { confirmAndDelete } = useConfirmDelete()

const tableColumns = [
  { prop: 'id', label: 'ID', width: 80 },

  // 🌟 核心技巧：直接用 user.username 穿透读取嵌套对象的数据！
  { prop: 'user.username', label: '评论人', width: 120 },

  // 评论内容很长，配合你封装 ProTable 时的 tooltip 功能，超出自动省略号
  {
    prop: 'body',
    label: '评论内容',
    minWidth: 300,
    search: { type: 'input' }, // 让 ProSearch 自动画出搜索框
  },

  { prop: 'postId', label: '所属帖子ID', width: 120 },
  { prop: 'likes', label: '点赞数', width: 100 },

  { label: '操作', width: 150, fixed: 'right', slot: 'action' },
]

const handleReset = async () => {
  handleSearch()
}

const handleDelete = (row: Comment) => {
  confirmAndDelete({
    message: `确定删除评论 #${row.id} 吗？`,
    title: '警告',
    request: () => deleteCommentAPI(row.id),
    onSuccess: fetchTableData,
    errorContext: '删除失败',
  })
}

onMounted(() => {
  fetchTableData()
})
</script>

<style scoped>
.comments-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  /* 给页面底部留点呼吸空间 */
  padding-bottom: 20px;
}

/* 让卡片内的表格部分更贴合，去除默认的多余边距 */
.table-card {
  border-radius: 8px;
}
</style>
