<template>
  <el-container class="layout-container">
    <el-aside width="200px" class="aside">
      <div class="logo">
        <h2>Dummy Admin</h2>
      </div>
      <el-menu
        :default-active="$route.path"
        class="el-menu-vertical"
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
        router
      >
        <el-menu-item index="/dashboard">
          <el-icon><DataLine /></el-icon>
          <span>数据大盘</span>
        </el-menu-item>
        <el-menu-item v-if="userStore.isAdmin" index="/products">
          <el-icon><Goods /></el-icon>
          <span>商品管理</span>
        </el-menu-item>
        <el-menu-item v-if="userStore.isAdmin" index="/users">
          <el-icon><User /></el-icon>
          <span>用户管理</span>
        </el-menu-item>
        <el-menu-item index="/posts">
          <el-icon><Document /></el-icon>
          <span>内容管理</span>
        </el-menu-item>
        <el-menu-item index="/recipes">
          <el-icon><KnifeFork /></el-icon>
          <span>食谱管理</span>
        </el-menu-item>
        <el-menu-item index="/comments">
          <el-icon><ChatDotRound /></el-icon>
          <span>评论管理</span>
        </el-menu-item>
        <el-menu-item index="/todos">
          <el-icon><Checked /></el-icon>
          <span>待办管理</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="header">
        <div class="header-left">
          <span class="welcome-text">欢迎回来！</span>
          <span class="quote-text" v-if="dailyQuote.quote">
            "{{ dailyQuote.quote }}" —— {{ dailyQuote.author }}
          </span>
        </div>

        <div class="header-right">
          <el-dropdown trigger="click">
            <span class="user-profile">
              <el-avatar :size="32" :src="userStore.userInfo.image" />
              <span class="username">
                {{ userStore.userInfo.firstName }}
                {{ userStore.userInfo.lastName }}
                <el-tag
                  :type="userStore.isAdmin ? 'danger' : 'info'"
                  size="small"
                  class="role-tag"
                >
                  {{ userStore.isAdmin ? 'Admin' : 'Editor' }}
                </el-tag>
              </span>
            </span>

            <template #dropdown>
              <el-dropdown-menu>
                <!-- <el-dropdown-item>个人中心</el-dropdown-item>
                <el-dropdown-item>修改密码</el-dropdown-item> -->
                <el-dropdown-item
                  divided
                  @click="handleLogout"
                  style="color: #f56c6c"
                >
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <el-main class="main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { useUserStore } from '../stores/user'
import { getRandomQuoteAPI } from '../api/modules/system'
import { logError } from '../utils/error'
import {
  DataLine,
  Goods,
  User,
  Document,
  KnifeFork,
  ChatDotRound,
  Checked,
} from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()

// 名言状态
const dailyQuote = ref({ quote: '', author: '' })

// 退出登录逻辑
const handleLogout = () => {
  userStore.logout()
  router.push('/login')
}

// 页面加载时获取名言
onMounted(async () => {
  try {
    const res = await getRandomQuoteAPI()
    dailyQuote.value = res
  } catch (error) {
    logError('获取名言失败', error)
  }
})
</script>

<style scoped>
.layout-container {
  height: 100vh;
}
.aside {
  background-color: #304156;
}
.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  border-bottom: 1px solid #1f2d3d;
}
.el-menu-vertical {
  border-right: none;
}

/* 🌟 顶部导航样式优化 */
.header {
  background-color: #fff;
  border-bottom: 1px solid #e6e6e6;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}

.header-left {
  display: flex;
  align-items: baseline;
  gap: 15px;
}

.welcome-text {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
}

.quote-text {
  font-size: 13px;
  color: #909399;
  font-style: italic;
  max-width: 500px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-profile {
  display: flex;
  align-items: center;
  cursor: pointer;
  gap: 10px;
  padding: 2px 8px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.user-profile:hover {
  background-color: #f5f7fa;
}

.username {
  font-size: 14px;
  color: #606266;
  display: flex;
  align-items: center;
  gap: 8px;
}

.main {
  background-color: #f0f2f5;
  padding: 20px;
}
</style>
