<template>
  <div class="product-container">
    <el-card class="action-card" shadow="never">
      <div class="action-bar">
        <div class="search-box">
          <el-input
            v-model="searchKeyword"
            placeholder="请输入商品名称搜索..."
            clearable
            @clear="handleSearch"
            @keyup.enter="handleSearch"
            style="width: 300px"
          >
            <template #append>
              <el-button @click="handleSearch">搜索</el-button>
            </template>
          </el-input>
        </div>
        <el-button type="primary" @click="openAddDialog">
          + 新增商品
        </el-button>
      </div>
    </el-card>

    <el-card class="table-card" shadow="never">
      <el-table
        :data="tableData"
        v-loading="loading"
        border
        stripe
        style="width: 100%"
        height="calc(100vh - 320px)"
      >
        <el-table-column prop="id" label="ID" width="80" align="center" />

        <el-table-column label="商品图片" width="100" align="center">
          <template #default="{ row }">
            <el-image
              style="width: 50px; height: 50px; border-radius: 4px"
              :src="row.thumbnail"
              :preview-src-list="row.images"
              preview-teleported
              fit="cover"
            />
          </template>
        </el-table-column>

        <el-table-column
          prop="title"
          label="商品名称"
          min-width="180"
          show-overflow-tooltip
        />
        <el-table-column prop="category" label="分类" width="120" />

        <el-table-column label="价格 ($)" width="120" sortable prop="price">
          <template #default="{ row }">
            <span style="color: #f56c6c; font-weight: bold"
              >${{ row.price }}</span
            >
          </template>
        </el-table-column>

        <el-table-column prop="stock" label="库存" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.stock > 20 ? 'success' : 'danger'">
              {{ row.stock }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="180" align="center" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" link>编辑</el-button>
            <el-button size="small" type="danger" link>删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrapper">
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
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getProductsAPI, searchProductsAPI } from '../api/modules/product'
import type { Product } from '../types/product'
import { ElMessage } from 'element-plus'

// === 状态定义 ===
const loading = ref(false)
const tableData = ref<Product[]>([])
const searchKeyword = ref('')

// 分页相关状态
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// === 核心方法 ===
// 获取表格数据 (融合了搜索和普通列表的逻辑)
const fetchTableData = async () => {
  loading.value = true
  try {
    // 核心思路：后端分页的 skip = (当前页码 - 1) * 每页条数
    const skip = (currentPage.value - 1) * pageSize.value
    let res

    // 如果搜索框有值，就调搜索接口；否则调普通的列表接口
    if (searchKeyword.value.trim()) {
      res = await searchProductsAPI(searchKeyword.value, pageSize.value, skip)
    } else {
      res = await getProductsAPI(pageSize.value, skip)
    }

    tableData.value = res.products
    total.value = res.total
  } catch (error) {
    console.error('获取商品列表失败', error)
  } finally {
    loading.value = false
  }
}

// 搜索按钮点击事件
const handleSearch = () => {
  // 每次触发搜索，一定要把页码重置为第一页，否则会查不到数据
  currentPage.value = 1
  fetchTableData()
}

// 分页：每页条数变化时触发
const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  fetchTableData()
}

// 分页：点击页码时触发
const handleCurrentChange = (page: number) => {
  currentPage.value = page
  fetchTableData()
}

// 留给下一步的方法
const openAddDialog = () => {
  ElMessage.info('新增商品功能即将在下一步完成！')
}

// 初始化加载
onMounted(() => {
  fetchTableData()
})
</script>

<style scoped>
.product-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
