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
      <ProTable :data="tableData" :loading="loading" :columns="tableColumns">
        <template #image="{ row }">
          <el-image
            style="width: 50px; height: 50px; border-radius: 4px"
            :src="row.thumbnail"
            :preview-src-list="row.images"
            preview-teleported
            fit="cover"
          />
        </template>

        <template #price="{ row }">
          <span style="color: #f56c6c; font-weight: bold"
            >${{ row.price }}</span
          >
        </template>

        <template #stock="{ row }">
          <el-tag :type="row.stock > 20 ? 'success' : 'danger'">
            {{ row.stock }}
          </el-tag>
        </template>

        <template #action="{ row }">
          <el-button size="small" type="primary" link @click="handleEdit(row)"
            >编辑</el-button
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

    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增商品' : '编辑商品'"
      width="500px"
      @close="resetForm"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="80px"
      >
        <el-form-item label="商品名称" prop="title">
          <el-input v-model="formData.title" placeholder="请输入商品名称" />
        </el-form-item>

        <el-form-item label="分类" prop="category">
          <el-select
            v-model="formData.category"
            placeholder="请选择分类"
            style="width: 100%"
          >
            <el-option label="美妆 (Beauty)" value="beauty" />
            <el-option label="香水 (Fragrances)" value="fragrances" />
            <el-option label="家具 (Furniture)" value="furniture" />
            <el-option label="杂货 (Groceries)" value="groceries" />
          </el-select>
        </el-form-item>

        <el-form-item label="价格" prop="price">
          <el-input-number
            v-model="formData.price"
            :min="0"
            :precision="2"
            :step="0.1"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="库存" prop="stock">
          <el-input-number
            v-model="formData.stock"
            :min="0"
            :step="1"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="品牌" prop="brand">
          <el-input v-model="formData.brand" placeholder="请输入品牌名称" />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="submitLoading" @click="submitForm"
            >确定</el-button
          >
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import {
  getProductsAPI,
  searchProductsAPI,
  addProductAPI,
  updateProductAPI,
  deleteProductAPI,
} from '../api/modules/product'
import type { Product } from '../types/product'

// 定义表格的列配置 (区分纯文本和自定义UI)
const tableColumns = [
  { prop: 'id', label: 'ID', width: 80 }, // 纯文本，用 prop
  { label: '商品图片', width: 100, slot: 'image' }, // 需要用 el-image，用 slot
  { prop: 'title', label: '商品名称', minWidth: 180 }, // 纯文本，用 prop
  { prop: 'category', label: '分类', width: 120 }, // 纯文本，用 prop
  { prop: 'brand', label: '品牌', width: 120 }, // 纯文本，用 prop
  { label: '价格 ($)', width: 120, slot: 'price' }, // 需要红色加粗，用 slot
  { label: '库存', width: 100, slot: 'stock' }, // 需要不同颜色的 el-tag，用 slot
  { label: '操作', width: 180, fixed: 'right', slot: 'action' }, // 需要按钮，用 slot
]

// === 列表状态定义 ===
const loading = ref(false)
const tableData = ref<Product[]>([])
const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// === 弹窗与表单状态定义 ===
const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const submitLoading = ref(false)
const formRef = ref()

// 表单数据绑定 (Partial 允许只填部分字段)
const formData = ref<Partial<Product>>({
  title: '',
  category: '',
  price: 0,
  stock: 0,
  brand: '',
})

// 表单必填校验规则
const formRules = {
  title: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
  category: [{ required: true, message: '请选择分类', trigger: 'change' }],
  price: [{ required: true, message: '请输入价格', trigger: 'blur' }],
  stock: [{ required: true, message: '请输入库存', trigger: 'blur' }],
}

// === 核心方法：获取表格数据 ===
const fetchTableData = async () => {
  loading.value = true
  try {
    const skip = (currentPage.value - 1) * pageSize.value
    let res
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

// === 分页与搜索事件 ===
const handleSearch = () => {
  currentPage.value = 1
  fetchTableData()
}

// === 增删改核心逻辑 ===

// 1. 打开新增弹窗
const openAddDialog = () => {
  dialogType.value = 'add'
  // 清空表单
  formData.value = { title: '', category: '', price: 0, stock: 0, brand: '' }
  dialogVisible.value = true
}

// 2. 打开编辑弹窗
const handleEdit = (row: Product) => {
  dialogType.value = 'edit'
  // 重点：使用深拷贝，防止在弹窗里输入时直接修改了底层表格的数据
  formData.value = JSON.parse(JSON.stringify(row))
  dialogVisible.value = true
}

// 3. 删除商品
const handleDelete = (row: Product) => {
  ElMessageBox.confirm(`确定要删除商品 "${row.title}" 吗？`, '高危操作', {
    confirmButtonText: '确定删除',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      try {
        await deleteProductAPI(row.id)
        ElMessage.success('商品删除成功！')
        fetchTableData() // 删除后刷新列表
      } catch (error) {
        console.error('删除失败', error)
      }
    })
    .catch(() => {
      /* 取消删除 */
    })
}

// 4. 提交表单 (新增 或 修改)
const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      submitLoading.value = true
      try {
        const updatePayload = {
          title: formData.value.title,
          category: formData.value.category,
          price: formData.value.price,
          stock: formData.value.stock,
          brand: formData.value.brand,
        }
        if (dialogType.value === 'add') {
          await addProductAPI(updatePayload)
          ElMessage.success('新增商品成功！')
        } else {
          // 这里 formData.value.id 必然存在，因为是从表格点击编辑进来的
          await updateProductAPI(formData.value.id!, updatePayload)
          ElMessage.success('修改商品成功！')
        }
        dialogVisible.value = false
        fetchTableData() // 刷新列表
      } catch (error) {
        console.error('提交失败', error)
      } finally {
        submitLoading.value = false
      }
    }
  })
}

// 5. 弹窗关闭时重置表单红色的校验提示
const resetForm = () => {
  if (formRef.value) {
    formRef.value.clearValidate()
  }
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
