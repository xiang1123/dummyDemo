<template>
  <div class="login-container">
    <el-card class="login-crad">
      <template #header>
        <h2 class="login-title">Dummy Admin 登录</h2>
      </template>

      <el-form :model="form" :rules="rules" ref="formRef" label-width="0">
        <el-form-item prop="username">
          <el-input
            v-model="form.username"
            placeholder="请输入用户名 (如: emilys)"
            size="large"
          ></el-input>
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码 (如: emilyspass)"
            size="large"
            show-password
            @keyup.enter="handleLogin"
          />
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            size="large"
            class="submit-btn"
            :loading="loading"
            @click="handleLogin"
            >登录</el-button
          >
        </el-form-item>
      </el-form>

      <div class="tips">测试账号: emilys / emilyspass</div>
      <div class="tips">测试账号: michaelw / michaelwpass</div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '../stores/user'

import { loginAPI } from '../api/modules/auth'
import { logError } from '../utils/error'

const router = useRouter()
const userStore = useUserStore()
const formRef = ref()
const loading = ref(false)

const form = reactive({
  username: 'emilys', // 默认填入测试账号方便测试
  password: 'emilyspass',
})

// 表单校验规则
const rules = {
  username: [{ required: true, message: '用户名不能为空', trigger: 'blur' }],
  password: [{ required: true, message: '密码不能为空', trigger: 'blur' }],
}

const handleLogin = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      loading.value = true
      try {
        const res = await loginAPI({
          username: form.username,
          password: form.password,
          expiresInMins: 30,
        })
        userStore.setLoginData(res)
        ElMessage.success('登录成功')
        router.push('/dashboard')
      } catch (error) {
        logError('登录流程中断', error)
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style scoped>
.login-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #2d3a4b;
}
.login-card {
  width: 400px;
  border-radius: 8px;
}
.login-title {
  text-align: center;
  margin: 0;
  color: #303133;
}
.submit-btn {
  width: 100%;
}
.tips {
  font-size: 12px;
  color: #909399;
  text-align: center;
  margin-top: 10px;
}
</style>
