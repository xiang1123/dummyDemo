<template>
  <div class="post-container">
    <ProSearch
      :columns="tableColumns"
      v-model:search-param="searchParam"
      @search="handleSearch"
      @reset="handleSearch"
    >
      <template #action>
        <el-button type="primary">+ 发布新帖</el-button>
      </template>
    </ProSearch>

    <el-card class="table-card" shadow="never">
      <ProTable :data="tableData" :loading="loading" :columns="tableColumns">
        <template #tags="{ row }">
          <div style="display: flex; gap: 5px; flex-wrap: wrap">
            <el-tag
              v-for="tag in row.tags"
              :key="tag"
              size="small"
              effect="plain"
            >
              #{{ tag }}
            </el-tag>
          </div>
        </template>

        <template #reactions="{ row }">
          <div
            style="
              display: flex;
              gap: 10px;
              align-items: center;
              color: #606266;
            "
          >
            <span style="color: #67c23a"> 👍 {{ row.reactions.likes }} </span>
            <span style="color: #f56c6c">
              👎 {{ row.reactions.dislikes }}
            </span>
          </div>
        </template>

        <template #action="{ row }">
          <el-button
            size="small"
            type="primary"
            link
            @click="handleViewDetail(row)"
            >查看详情</el-button
          >
          <el-button size="small" type="danger" link @click="handleDelete(row)"
            >删除</el-button
          >
        </template>
      </ProTable>

      <Pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        @change="fetchTableData"
      />
    </el-card>

    <el-drawer
      v-model="drawerVisible"
      title="帖子详情"
      size="50%"
      destroy-on-close
    >
      <div v-if="currentPost" class="post-detail-content">
        <h2 class="detail-title">{{ currentPost.title }}</h2>

        <div class="detail-meta">
          <span class="author">作者 ID: {{ currentPost.userId }}</span>
          <span class="views">👁️ {{ currentPost.views }} 次浏览</span>
        </div>

        <div class="detail-tags">
          <el-tag
            v-for="tag in currentPost.tags"
            :key="tag"
            size="small"
            effect="light"
          >
            #{{ tag }}
          </el-tag>
        </div>

        <el-divider />

        <div class="detail-body">
          {{ currentPost.body }}
        </div>

        <el-divider />

        <div class="detail-footer">
          <el-statistic
            title="点赞数 (Likes)"
            :value="currentPost.reactions.likes"
          />
          <el-statistic
            title="被踩数 (Dislikes)"
            :value="currentPost.reactions.dislikes"
          />
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { getPostsAPI, searchPostsAPI, deletePostAPI } from '../api/modules/post'
import type { Post } from '../types/post'
import { logError } from '../utils/error'
import { useTablePage } from '../composables/useTablePage'

const searchParam = ref({
  title: '',
})
const { loading, tableData, currentPage, pageSize, total, fetchTableData, handleSearch } =
  useTablePage<Post>({
    loadData: async ({ currentPage, pageSize }) => {
      const skip = (currentPage - 1) * pageSize
      const keyword = searchParam.value.title?.trim()
      let res
      try {
        if (keyword) {
          res = await searchPostsAPI(keyword, pageSize, skip)
        } else {
          res = await getPostsAPI(pageSize, skip)
        }
        return { list: res.posts, total: res.total }
      } catch (error) {
        logError('获取帖子失败', error)
        return { list: [], total: 0 }
      }
    },
  })
const drawerVisible = ref(false)
const currentPost = ref<Post | null>(null)

const handleViewDetail = (row: Post) => {
  currentPost.value = row
  drawerVisible.value = true
}

const tableColumns = [
  { prop: 'id', label: 'ID', width: 80 },
  { prop: 'title', label: '标题', minWidth: 200, tooltip: true, search: { type: 'input' } },
  { label: '标签 (Tags)', minWidth: 150, slot: 'tags' },
  { label: '互动 (Reactions)', width: 150, slot: 'reactions' },
  { prop: 'views', label: '浏览量', width: 100 },
  { label: '操作', width: 150, fixed: 'right', slot: 'action' },
]

const handleDelete = async (row: Post) => {
  ElMessageBox.confirm(`确定要删除文章 "${row.title}" 吗？`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      await deletePostAPI(row.id)
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
.post-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* --- 抽屉内部样式 --- */
.post-detail-content {
  padding: 0 10px;
}

.detail-title {
  font-size: 24px;
  color: #303133;
  margin-bottom: 15px;
  line-height: 1.4;
}

.detail-meta {
  font-size: 13px;
  color: #909399;
  display: flex;
  gap: 20px;
  margin-bottom: 15px;
}

.detail-tags {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
}

.detail-body {
  font-size: 16px;
  color: #606266;
  line-height: 1.8;
  letter-spacing: 0.5px;
  white-space: pre-wrap; /* 保留文本里的换行符 */
}

.detail-footer {
  display: flex;
  justify-content: space-around;
  margin-top: 30px;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
}
</style>
