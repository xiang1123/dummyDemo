import { createRouter, createWebHistory } from 'vue-router'
import Layout from '../layout/index.vue'
import { useUserStore } from '../stores/user'
import { ElMessage } from 'element-plus'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('../views/Login.vue')
    },
    {
      path: '/',
      component: Layout,
      redirect: '/dashboard', // 访问根路径自动跳到大盘
      children: [
        {
          path: 'dashboard',
          name: 'Dashboard',
          component: () => import('../views/Dashboard.vue')
        },
        {
          path: 'users',
          name: 'users',
          component: () => import('../views/User.vue'),
          meta: { requireAdmin: true }
        },
        {
          path: 'products',
          name: 'Products',
          component: () => import('../views/Products.vue'),
          meta: { requireAdmin: true }
        },
        {
          path: 'posts',
          name: 'Posts',
          component: () => import('../views/Posts.vue')
        },
        {
          path: 'recipes',
          name: 'Recipes',
          component: () => import('../views/Recipes.vue')
        },
        {
          path: 'comments',
          name: 'Comments',
          component: () => import('../views/Comments.vue')
        },
        {
          path: 'todos',
          name: 'Todos',
          component: () => import('../views/Todos.vue')
        },
      ]
    },
    {
      path: '/:pathMatch(.*)*', // 正则匹配所有未定义的路径
      name: 'NotFound',
      component: () => import('../views/NotFound.vue') // 我们马上建这个文件
    }
  ]
})

router.beforeEach((to, _from, next) => {
  const userStore = useUserStore()
  const token = userStore.accessToken

  if (to.path === '/login') {
    next()
  } else if (!token) {
    next('/login')
  } else {
    if (to.meta.requireAdmin && !userStore.isAdmin) {
      ElMessage.error('无权限访问')
      next('/dashboard')
    } else {
      next()
    }
  }
})

export default router
