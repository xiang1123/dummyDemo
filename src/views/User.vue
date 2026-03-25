<template>
  <div class="user-container">
    <ProSearch
      :columns="tableColumns"
      v-model:search-param="searchParam"
      @search="handleSearch"
      @reset="handleSearch"
    >
      <template #action>
        <el-button type="primary" @click="openAddDialog">
          + 新增员工
        </el-button>
      </template>
    </ProSearch>

    <el-card class="table-card" shadow="never">
      <ProTable :data="tableData" :loading="loading" :columns="tableColumns">
        <template #avatar="{ row }">
          <el-avatar :size="40" :src="row.image" />
        </template>

        <template #name="{ row }">
          <strong>{{ row.firstName }} {{ row.lastName }}</strong>
        </template>

        <template #role="{ row }">
          <el-tag :type="row.role === 'admin' ? 'danger' : 'info'">
            {{ row.role === 'admin' ? '管理员' : '普通员工' }}
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
      :title="dialogType === 'add' ? '新增员工' : '编辑员工资料'"
      width="500px"
      @close="resetForm"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="80px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="名 (First)" prop="firstName">
              <el-input v-model="formData.firstName" placeholder="请输入名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="姓 (Last)" prop="lastName">
              <el-input v-model="formData.lastName" placeholder="请输入姓" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="登录账号" prop="username">
          <el-input
            v-model="formData.username"
            placeholder="请输入系统登录账号"
          />
        </el-form-item>

        <el-form-item label="联系邮箱" prop="email">
          <el-input v-model="formData.email" placeholder="请输入邮箱地址" />
        </el-form-item>

        <el-form-item label="角色分配" prop="role">
          <el-radio-group v-model="formData.role">
            <el-radio label="user">普通员工</el-radio>
            <el-radio label="admin">管理员</el-radio>
          </el-radio-group>
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
  getUsersAPI,
  searchUsersAPI,
  addUserAPI,
  updateUserAPI,
  deleteUserAPI,
} from '../api/modules/user'
import type { User } from '../types/user'
import { logError } from '../utils/error'
import { useTablePage } from '../composables/useTablePage'

const tableColumns = [
  { prop: 'id', label: 'ID', width: 80 },
  // 特殊列：使用 avatar 插槽
  { label: '头像', width: 80, slot: 'avatar' },
  // 特殊列：使用 name 插槽
  { prop: 'firstName', label: '姓名', minWidth: 150, slot: 'name', search: { type: 'input' } },
  { prop: 'username', label: '登录账号', width: 120 },
  { prop: 'email', label: '邮箱', minWidth: 200 },
  { prop: 'phone', label: '联系电话', width: 150 },
  // 特殊列：使用 role 插槽
  { label: '系统角色', width: 100, slot: 'role' },
  // 特殊列：使用 action 插槽 (固定在右侧)
  { label: '操作', width: 180, fixed: 'right', slot: 'action' },
]

const searchParam = ref({
  firstName: '',
})
const { loading, tableData, currentPage, pageSize, total, fetchTableData, handleSearch } =
  useTablePage<User>({
    loadData: async ({ currentPage, pageSize }) => {
      const skip = (currentPage - 1) * pageSize
      const keyword = searchParam.value.firstName?.trim()
      let res
      try {
        if (keyword) {
          res = await searchUsersAPI(keyword, pageSize, skip)
        } else {
          res = await getUsersAPI(pageSize, skip)
        }
        return { list: res.users, total: res.total }
      } catch (error) {
        logError('获取用户列表失败', error)
        return { list: [], total: 0 }
      }
    },
  })

// 弹窗与表单状态
const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const submitLoading = ref(false)
const formRef = ref()

const formData = ref<Partial<User>>({
  firstName: '',
  lastName: '',
  username: '',
  email: '',
  role: 'user', // 默认是普通员工
})

// 表单校验规则（带了邮箱格式正则校验）
const formRules = {
  firstName: [{ required: true, message: '名不能为空', trigger: 'blur' }],
  lastName: [{ required: true, message: '姓不能为空', trigger: 'blur' }],
  username: [{ required: true, message: '账号不能为空', trigger: 'blur' }],
  email: [
    { required: true, message: '邮箱不能为空', trigger: 'blur' },
    {
      type: 'email',
      message: '请输入正确的邮箱格式',
      trigger: ['blur', 'change'],
    },
  ],
}

// 新增/编辑/删除逻辑
const openAddDialog = () => {
  dialogType.value = 'add'
  formData.value = {
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    role: 'user',
  }
  dialogVisible.value = true
}

const handleEdit = (row: User) => {
  dialogType.value = 'edit'
  formData.value = JSON.parse(JSON.stringify(row))
  dialogVisible.value = true
}

const handleDelete = (row: User) => {
  ElMessageBox.confirm(
    `确定要移除员工 "${row.firstName} ${row.lastName}" 吗？`,
    '高危操作',
    {
      confirmButtonText: '确定开除',
      cancelButtonText: '取消',
      type: 'warning',
    },
  )
    .then(async () => {
      try {
        await deleteUserAPI(row.id)
        ElMessage.success('员工已成功移除！')
        fetchTableData()
      } catch (error) {
        logError('删除失败', error)
      }
    })
    .catch(() => {})
}

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      submitLoading.value = true
      try {
        const updatePayload = {
          firstName: formData.value.firstName,
          lastName: formData.value.lastName,
          username: formData.value.username,
          email: formData.value.email,
          role: formData.value.role,
        }

        if (dialogType.value === 'add') {
          await addUserAPI(updatePayload)
          ElMessage.success('新增员工成功！')
        } else {
          await updateUserAPI(formData.value.id!, updatePayload)
          ElMessage.success('员工资料修改成功！')
        }
        dialogVisible.value = false
        fetchTableData()
      } catch (error) {
        logError('提交失败', error)
      } finally {
        submitLoading.value = false
      }
    }
  })
}

const resetForm = () => {
  if (formRef.value) formRef.value.clearValidate()
}

onMounted(() => {
  fetchTableData()
})
</script>

<style scoped>
.user-container {
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
