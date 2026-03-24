<template>
  <div class="pagination-container">
    <el-pagination
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :page-sizes="[10, 20, 50]"
      background
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
  </div>
</template>

<script setup lang="ts">
// 1. 接收父组件传来的不经常变动的值 (比如总条数)
defineProps<{
  total: number
}>()

// 2. 核心：使用 defineModel 实现与父组件的双向绑定
// (这样父组件用 v-model 绑定的值，子组件修改时父组件会自动更新)
const currentPage = defineModel<number>('currentPage', { required: true })
const pageSize = defineModel<number>('pageSize', { required: true })

// 3. 定义向外抛出的事件：当页码或条数改变时，通知父组件去重新请求接口
const emit = defineEmits(['change'])

const handleSizeChange = () => {
  // 切条数时，默认回到第一页，防止数据越界
  currentPage.value = 1
  emit('change')
}

const handleCurrentChange = () => {
  emit('change')
}
</script>

<style scoped>
.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end; /* 默认靠右对齐 */
}
</style>
