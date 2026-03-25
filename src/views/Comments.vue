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

const tableData = ref<Comment[]>([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

const searchParam = ref({
  body: '',
})

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

const fetchTableData = async () => {
  loading.value = true
  try {
    const skip = (currentPage.value - 1) * pageSize.value
    let res

    // 🌟 第 2 处修改：把 searchParam.value.name 改成 searchParam.value.body
    const keyword = searchParam.value.body?.trim()

    if (keyword) {
      res = await searchCommentsAPI(keyword, pageSize.value, skip)
    } else {
      res = await getCommentsAPI(pageSize.value, skip)
    }

    tableData.value = res.comments
    total.value = res.total
  } catch (error) {
    console.error('获取评论失败', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
  fetchTableData()
}

const handleReset = async () => {
  currentPage.value = 1
  fetchTableData()
}

const handleDelete = async (row: Comment) => {
  ElMessageBox.confirm(`确定删除评论 #${row.id} 吗？`, '警告', {
    confirmButtonText: '确定删除',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      await deleteCommentAPI(row.id)
      ElMessage.success('删除成功')
      fetchTableData()
    })
    .catch(() => {})
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
