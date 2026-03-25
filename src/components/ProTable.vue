<template>
  <el-table
    :data="data"
    v-loading="loading"
    border
    stripe
    style="width: 100%"
    height="calc(100vh - 320px)"
  >
    <template v-for="col in columns" :key="col.prop || col.label">
      <el-table-column
        v-if="col.slot"
        :label="col.label"
        :width="col.width"
        :min-width="col.minWidth"
        :align="col.align || 'center'"
        :fixed="col.fixed"
      >
        <template #default="scope">
          <slot :name="col.slot" :row="scope.row" :$index="scope.$index"></slot>
        </template>
      </el-table-column>

      <el-table-column
        v-else
        :prop="col.prop"
        :label="col.label"
        :width="col.width"
        :min-width="col.minWidth"
        :align="col.align || 'center'"
        :show-overflow-tooltip="col.tooltip !== false"
      />
    </template>
  </el-table>
</template>

<script setup lang="ts">
import type { TableColumn } from '../types/table'

// 定义接收的属性
defineProps<{
  data: Record<string, unknown>[] // 表格数据
  loading?: boolean // 加载状态
  columns: TableColumn[] // 核心：列配置数组
}>()
</script>
