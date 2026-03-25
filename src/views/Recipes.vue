<template>
  <div class="recipe-container">
    <ProSearch
      :columns="tableColumns"
      v-model:search-param="searchParam"
      @search="handleSearch"
      @reset="handleReset"
    >
      <template #action>
        <el-button type="success" @click="handleAdd">+ 新增食谱</el-button>
      </template>
    </ProSearch>

    <el-card class="table-card" shadow="never">
      <ProTable :data="tableData" :loading="loading" :columns="tableColumns">
        <template #image="{ row }">
          <el-image
            style="width: 60px; height: 60px; border-radius: 8px"
            :src="row.image"
            :preview-src-list="[row.image]"
            preview-teleported
            fit="cover"
          />
        </template>

        <template #mealType="{ row }">
          <div class="tags-wrapper">
            <el-tag
              v-for="meal in row.mealType"
              :key="meal"
              size="small"
              type="warning"
              effect="light"
            >
              {{ meal }}
            </el-tag>
          </div>
        </template>

        <template #action="{ row }">
          <el-button
            size="small"
            type="success"
            link
            @click="handleViewDetail(row)"
            >查看步骤</el-button
          >
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

    <el-drawer
      v-model="drawerVisible"
      :title="currentRecipe ? currentRecipe.name : '食谱详情'"
      size="45%"
      destroy-on-close
    >
      <div v-if="currentRecipe" class="recipe-detail-content">
        <el-image
          class="detail-hero-image"
          :src="currentRecipe.image"
          fit="cover"
        />

        <div class="detail-meta-grid">
          <div class="meta-item">
            <span class="label">🔪 准备时间</span>
            <span class="value">{{ currentRecipe.prepTimeMinutes }} 分钟</span>
          </div>
          <div class="meta-item">
            <span class="label">🍳 烹饪时间</span>
            <span class="value">{{ currentRecipe.cookTimeMinutes }} 分钟</span>
          </div>
          <div class="meta-item">
            <span class="label">🍽️ 建议份量</span>
            <span class="value">{{ currentRecipe.servings }} 人份</span>
          </div>
          <div class="meta-item">
            <span class="label">🔥 卡路里</span>
            <span class="value"
              >{{ currentRecipe.caloriesPerServing }} kcal/份</span
            >
          </div>
        </div>

        <el-divider border-style="dashed" />

        <div class="section-block">
          <h3 class="section-title">🛒 备菜清单 (Ingredients)</h3>
          <ul class="ingredient-list">
            <li v-for="(item, index) in currentRecipe.ingredients" :key="index">
              {{ item }}
            </li>
          </ul>
        </div>

        <div class="section-block">
          <h3 class="section-title">👨‍🍳 烹饪步骤 (Instructions)</h3>
          <ol class="instruction-list">
            <li
              v-for="(step, index) in currentRecipe.instructions"
              :key="index"
            >
              {{ step }}
            </li>
          </ol>
        </div>
      </div>
    </el-drawer>

    <el-drawer
      v-model="formDrawerVisible"
      :title="isEdit ? '编辑食谱' : '新增食谱'"
      size="50%"
      destroy-on-close
      :close-on-click-modal="false"
    >
      <el-form :model="formData" label-width="100px" class="recipe-form">
        <el-divider content-position="left">基础信息</el-divider>

        <el-form-item label="菜谱名称" required>
          <el-input v-model="formData.name" placeholder="请输入菜谱名称" />
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="菜系">
              <el-input
                v-model="formData.cuisine"
                placeholder="例如：Italian, Asian"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="难度">
              <el-select
                v-model="formData.difficulty"
                placeholder="请选择难度"
                style="width: 100%"
              >
                <el-option label="简单 (Easy)" value="Easy" />
                <el-option label="中等 (Medium)" value="Medium" />
                <el-option label="困难 (Hard)" value="Hard" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="准备时间">
              <el-input-number v-model="formData.prepTimeMinutes" :min="0" />
              <span class="unit">分钟</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="烹饪时间">
              <el-input-number v-model="formData.cookTimeMinutes" :min="0" />
              <span class="unit">分钟</span>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="封面图链接">
          <el-input
            v-model="formData.image"
            placeholder="请输入图片 URL (https://...)"
          />
        </el-form-item>

        <el-divider content-position="left">食材清单 (Ingredients)</el-divider>
        <div
          v-for="(_, index) in formData.ingredients"
          :key="'ing' + index"
          class="dynamic-item"
        >
          <el-input
            v-model="formData.ingredients[index]"
            placeholder="例如：2个西红柿"
          />
          <el-button
            type="danger"
            circle
            plain
            @click="removeIngredient(index)"
            :disabled="formData.ingredients.length <= 1"
          >
            <el-icon><Delete /></el-icon>
          </el-button>
        </div>
        <el-button type="primary" plain class="add-btn" @click="addIngredient">
          + 添加一项食材
        </el-button>

        <el-divider content-position="left">烹饪步骤 (Instructions)</el-divider>
        <div
          v-for="(_, index) in formData.instructions"
          :key="'inst' + index"
          class="dynamic-item"
        >
          <el-input
            v-model="formData.instructions[index]"
            type="textarea"
            :rows="2"
            :placeholder="`第 ${index + 1} 步...`"
          />
          <el-button
            type="danger"
            circle
            plain
            @click="removeInstruction(index)"
            :disabled="formData.instructions.length <= 1"
          >
            <el-icon><Delete /></el-icon>
          </el-button>
        </div>
        <el-button type="primary" plain class="add-btn" @click="addInstruction">
          + 添加一个步骤
        </el-button>
      </el-form>

      <template #footer>
        <div style="flex: auto">
          <el-button @click="formDrawerVisible = false">取消</el-button>
          <el-button
            type="primary"
            :loading="submitLoading"
            @click="submitForm"
          >
            保存提交
          </el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { Delete } from '@element-plus/icons-vue'
import type { Recipe } from '../types/recipe'
import {
  getRecipesAPI,
  searchRecipesAPI,
  addRecipeAPI,
  updateRecipeAPI,
  deleteRecipeAPI,
} from '../api/modules/recipe'

const loading = ref(false)
const tableData = ref<Recipe[]>([])
const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const drawerVisible = ref(false)
const currentRecipe = ref<Recipe | null>(null)
const formDrawerVisible = ref(false)
const isEdit = ref(false)
const submitLoading = ref(false)
const editingId = ref<number | null>(null)

const searchParam = ref({
  name: '',
  difficulty: '',
})

// 🌟 核心：表单数据模型
const formData = ref({
  id: 0,
  name: '',
  cuisine: '',
  difficulty: 'Easy',
  prepTimeMinutes: 0,
  cookTimeMinutes: 0,
  image: '',
  ingredients: [''], // 默认给一个空输入框
  instructions: [''], // 默认给一个空输入框
})

// 定义表格列配置
const tableColumns = [
  { prop: 'id', label: 'ID', width: 80 },
  { label: '菜品主图', width: 100, slot: 'image' },
  {
    prop: 'name',
    label: '菜名',
    minWidth: 160,
    // 🌟 加上这个，ProSearch 就会自动生成一个名称输入框！
    search: { type: 'input' },
  },
  { prop: 'cuisine', label: '菜系', width: 120 },
  {
    prop: 'difficulty',
    label: '难度',
    width: 100,
    // 🌟 加上这个，ProSearch 就会自动生成一个下拉框！
    search: {
      type: 'select',
      options: [
        { label: '简单', value: 'Easy' },
        { label: '中等', value: 'Medium' },
        { label: '困难', value: 'Hard' },
      ],
    },
  },
  { label: '餐食类型', minWidth: 160, slot: 'mealType' },
  { label: '操作', width: 220, fixed: 'right', slot: 'action' },
]

const fetchTableData = async () => {
  loading.value = true
  try {
    const skip = (currentPage.value - 1) * pageSize.value
    let res

    const keyword = searchParam.value.name?.trim()

    if (keyword) {
      res = await searchRecipesAPI(keyword, pageSize.value, skip)
    } else {
      res = await getRecipesAPI(pageSize.value, skip)
    }

    // 🌟 拿到后端返回的原始数组
    let finalData = res.recipes

    // 🌟 核心魔法：前端弥补后端的不足！
    // 检查用户是不是在下拉框里选了“难度”
    const selectedDifficulty = searchParam.value.difficulty
    if (selectedDifficulty) {
      // 用 JS 把不符合难度的数据强行筛掉！
      finalData = finalData.filter(
        (item) => item.difficulty === selectedDifficulty,
      )
    }

    // 🌟 最后把过滤完的数据喂给表格
    tableData.value = finalData
    total.value = res.total // (注：由于前端过滤了数组，这里的总条数可能会有些许误差，企业实战中最好还是逼后端改接口)
  } catch (error) {
    console.error('获取食谱失败', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
  // 在真实项目中，你会把 searchParam.value 传给后端的 API
  console.log('当前搜索条件：', searchParam.value)
  fetchTableData()
}

const handleReset = () => {
  currentPage.value = 1
  fetchTableData()
}

const addIngredient = () => formData.value.ingredients.push('')
const removeIngredient = (index: number) =>
  formData.value.ingredients.splice(index, 1)

const addInstruction = () => formData.value.instructions.push('')
const removeInstruction = (index: number) =>
  formData.value.instructions.splice(index, 1)

// --- 打开新增抽屉 ---
const handleAdd = () => {
  isEdit.value = false
  editingId.value = null
  // 重置表单为空状态
  formData.value = {
    id: 0,
    name: '',
    cuisine: '',
    difficulty: 'Easy',
    prepTimeMinutes: 0,
    cookTimeMinutes: 0,
    image: '',
    ingredients: [''],
    instructions: [''],
  }
  formDrawerVisible.value = true
}

const handleEdit = (recipe: Recipe) => {
  isEdit.value = true
  editingId.value = recipe.id
  formData.value = { ...recipe }
  if (!formData.value.ingredients?.length) formData.value.ingredients = ['']
  if (!formData.value.instructions?.length) formData.value.instructions = ['']
  formDrawerVisible.value = true
}

const submitForm = async () => {
  if (!formData.value.name) return ElMessage.warning('菜名不能为空')
  const cleanedData = {
    ...formData.value,
    ingredients: formData.value.ingredients.filter(
      (item) => item.trim() !== '',
    ),
    instructions: formData.value.instructions.filter(
      (item) => item.trim() !== '',
    ),
  }

  submitLoading.value = true
  try {
    if (isEdit.value) {
      if (editingId.value === null) {
        ElMessage.error('缺少待编辑的食谱 ID')
        return
      }

      const { id: _id, ...updatePayload } = cleanedData
      await updateRecipeAPI(editingId.value, updatePayload)
      ElMessage.success('修改成功')
    } else {
      await addRecipeAPI(cleanedData)
      ElMessage.success('添加成功')
    }
    formDrawerVisible.value = false
    fetchTableData()
  } catch (error) {
    const message = (error as any)?.response?.data?.message || ''
    if (
      isEdit.value &&
      message.includes('not found') &&
      editingId.value !== null
    ) {
      // 演示接口未命中时，回退为本地更新，保证交互连续。
      tableData.value = tableData.value.map((item) =>
        item.id === editingId.value ? { ...item, ...cleanedData } : item,
      )
      formDrawerVisible.value = false
      ElMessage.warning('接口未找到该 ID，已在本地列表更新')
      return
    }
    console.error('保存失败', error)
  } finally {
    submitLoading.value = false
  }
}

const handleDelete = async (recipe: Recipe) => {
  ElMessageBox.confirm(`确定要删除该${recipe.name}食谱吗？`, '警告', {
    confirmButtonText: '确定删除',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      await deleteRecipeAPI(recipe.id)
      ElMessage.success('删除成功')
      fetchTableData()
    })
    .catch(() => {})
}

const handleViewDetail = (recipe: Recipe) => {
  currentRecipe.value = recipe
  drawerVisible.value = true
}

onMounted(() => {
  fetchTableData()
})
</script>

<style scoped>
/* 页面整体布局 */
.recipe-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.tags-wrapper {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
  justify-content: center;
}

/* --- 抽屉内部样式 --- */
.recipe-detail-content {
  padding: 0 10px 30px;
}

.detail-hero-image {
  width: 100%;
  height: 240px;
  border-radius: 12px;
  margin-bottom: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.detail-meta-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  background-color: #f5f7fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.meta-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.meta-item .label {
  font-size: 13px;
  color: #909399;
}

.meta-item .value {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
}

.section-block {
  margin-bottom: 30px;
}

.section-title {
  font-size: 18px;
  color: #303133;
  margin-bottom: 15px;
  border-left: 4px solid #e6a23c; /* 橙色左边框点缀 */
  padding-left: 10px;
}

/* 列表美化 */
.ingredient-list {
  padding-left: 20px;
  line-height: 1.8;
  color: #606266;
  font-size: 15px;
}

.ingredient-list li {
  margin-bottom: 8px;
}

.instruction-list {
  padding-left: 20px;
  line-height: 1.8;
  color: #606266;
  font-size: 15px;
}

.instruction-list li {
  margin-bottom: 12px;
  padding-left: 5px;
}
.instruction-list li::marker {
  font-weight: bold;
  color: #e6a23c;
}

/* --- 表单样式 --- */
.unit {
  margin-left: 10px;
  color: #909399;
}

.dynamic-item {
  display: flex;
  gap: 10px;
  margin-bottom: 12px;
  align-items: flex-start;
}

.add-btn {
  margin-left: 100px; /* 和 label 保持对齐 */
  margin-bottom: 20px;
}
</style>
