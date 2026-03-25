<template>
  <div class="todos-container">
    <ProSearch
      :columns="tableColumns"
      v-model:search-param="searchParam"
      @search="handleSearch"
      @reset="handleReset"
    >
      <template #action>
        <el-button type="primary" @click="openAddDialog">+ 新增待办</el-button>
      </template>
    </ProSearch>

    <el-card class="table-card" shadow="never">
      <ProTable :data="tableData" :loading="loading" :columns="tableColumns">
        <template #completed="{ row }">
          <el-switch
            :model-value="row.completed"
            @change="handleToggle(row, $event)"
          />
        </template>

        <template #action="{ row }">
          <el-button size="small" type="primary" link @click="handleEdit(row)">
            编辑
          </el-button>
          <el-button size="small" type="danger" link @click="handleDelete(row)">
            删除
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

    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增待办' : '编辑待办'"
      width="520px"
    >
      <el-form :model="formData" label-width="90px">
        <el-form-item label="待办内容" required>
          <el-input v-model="formData.todo" placeholder="请输入待办内容" />
        </el-form-item>

        <el-form-item label="所属用户ID" required>
          <el-input-number
            v-model="formData.userId"
            :min="1"
            :step="1"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="完成状态">
          <el-switch v-model="formData.completed" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="submitForm">
          保存
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import type { Todo } from '../types/todo'
import {
  getTodosAPI,
  searchTodosAPI,
  addTodoAPI,
  updateTodoAPI,
  deleteTodoAPI,
} from '../api/modules/todo'
import { logError } from '../utils/error'

const loading = ref(false)
const tableData = ref<Todo[]>([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

const searchParam = ref({
  todo: '',
  completed: '',
})

const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const submitLoading = ref(false)
const editingId = ref<number | null>(null)

const formData = ref({
  todo: '',
  completed: false,
  userId: 1,
})

const tableColumns = [
  { prop: 'id', label: 'ID', width: 80 },
  {
    prop: 'todo',
    label: '待办内容',
    minWidth: 360,
    search: { type: 'input' },
  },
  {
    label: '是否完成',
    width: 140,
    slot: 'completed',
    search: {
      type: 'select',
      options: [
        { label: '已完成', value: 'true' },
        { label: '未完成', value: 'false' },
      ],
    },
  },
  { prop: 'userId', label: '用户ID', width: 100 },
  { label: '操作', width: 150, fixed: 'right', slot: 'action' },
]

const fetchTableData = async () => {
  loading.value = true
  try {
    const skip = (currentPage.value - 1) * pageSize.value
    const keyword = searchParam.value.todo?.trim() || ''
    const completed = (searchParam.value.completed || '') as '' | 'true' | 'false'

    let res
    if (keyword || completed) {
      res = await searchTodosAPI(keyword, completed, pageSize.value, skip)
    } else {
      res = await getTodosAPI(pageSize.value, skip)
    }

    tableData.value = res.todos
    total.value = res.total
  } catch (error) {
    logError('获取待办失败', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
  fetchTableData()
}

const handleReset = () => {
  currentPage.value = 1
  fetchTableData()
}

const resetForm = () => {
  formData.value = {
    todo: '',
    completed: false,
    userId: 1,
  }
}

const openAddDialog = () => {
  dialogType.value = 'add'
  editingId.value = null
  resetForm()
  dialogVisible.value = true
}

const handleEdit = (row: Todo) => {
  dialogType.value = 'edit'
  editingId.value = row.id
  formData.value = {
    todo: row.todo,
    completed: row.completed,
    userId: row.userId,
  }
  dialogVisible.value = true
}

const submitForm = async () => {
  if (!formData.value.todo.trim()) return ElMessage.warning('待办内容不能为空')

  submitLoading.value = true
  try {
    if (dialogType.value === 'add') {
      await addTodoAPI(formData.value)
      ElMessage.success('新增待办成功')
    } else {
      if (editingId.value === null) {
        ElMessage.error('缺少待编辑的待办 ID')
        return
      }
      await updateTodoAPI(editingId.value, formData.value)
      ElMessage.success('更新待办成功')
    }

    dialogVisible.value = false
    fetchTableData()
  } catch (error) {
    logError('提交待办失败', error)
  } finally {
    submitLoading.value = false
  }
}

const handleToggle = async (row: Todo, value: string | number | boolean) => {
  const nextCompleted = Boolean(value)
  try {
    await updateTodoAPI(row.id, { completed: nextCompleted })
    row.completed = nextCompleted
    ElMessage.success('状态更新成功')
  } catch (error) {
    logError('切换状态失败', error)
    fetchTableData()
  }
}

const handleDelete = async (row: Todo) => {
  ElMessageBox.confirm(`确定删除待办 #${row.id} 吗？`, '警告', {
    confirmButtonText: '确定删除',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      await deleteTodoAPI(row.id)
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
.todos-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-bottom: 20px;
}

.table-card {
  border-radius: 8px;
}
</style>
