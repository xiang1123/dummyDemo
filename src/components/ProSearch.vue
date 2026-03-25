<template>
  <el-card
    class="pro-search-card"
    shadow="never"
    v-if="searchColumns.length > 0"
  >
    <el-form :model="searchParam" inline class="pro-search-form">
      <el-form-item
        v-for="col in searchColumns"
        :key="col.prop"
        :label="col.label"
      >
        <el-input
          v-if="!col.search?.type || col.search?.type === 'input'"
          v-model="searchParam[col.prop]"
          :placeholder="`请输入${col.label}`"
          clearable
          @keyup.enter="handleSearch"
        />

        <el-select
          v-if="col.search?.type === 'select'"
          v-model="searchParam[col.prop]"
          :placeholder="`请选择${col.label}`"
          clearable
          style="width: 180px"
        >
          <el-option
            v-for="opt in col.search.options"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item class="action-group">
        <el-button type="primary" @click="handleSearch">
          <el-icon><Search /></el-icon> 搜索
        </el-button>
        <el-button @click="handleReset">
          <el-icon><Refresh /></el-icon> 重置
        </el-button>
        <slot name="action"></slot>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Search, Refresh } from '@element-plus/icons-vue'

// 1. 接收表格列配置 (单向传递即可)
const props = defineProps<{
  columns: any[]
}>()

// 2. 🌟 核心修复：使用 defineModel 完美接管 v-model:search-param
// 这保证了内部的 el-select 和外部页面的 ref 对象保持 100% 的响应式同步
const searchParam = defineModel<Record<string, any>>('searchParam', {
  default: () => ({}),
})

// 3. 定义组件向外抛出的事件
const emit = defineEmits(['search', 'reset'])

// 4. 计算属性：只过滤出配置了 search 属性的列
const searchColumns = computed(() => {
  return props.columns.filter((col) => col.search)
})

// --- 核心操作方法 ---

// 触发搜索
const handleSearch = () => {
  emit('search')
}

// 触发重置
const handleReset = () => {
  // 遍历 searchParam，将所有绑定的值清空
  // 注意：defineModel 返回的是一个 ref，所以要在 JS 里操作它，必须加 .value
  Object.keys(searchParam.value).forEach((key) => {
    searchParam.value[key] = ''
  })
  emit('reset')
}
</script>

<style scoped>
.pro-search-card {
  margin-bottom: 16px;
}
.pro-search-form {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
/* 覆盖 el-form-item 的默认底边距，让排版更紧凑 */
.el-form-item {
  margin-bottom: 0;
  margin-right: 16px;
}
.action-group {
  margin-left: auto; /* 让按钮组自动靠右，紧跟在搜索条件后面 */
}
</style>
