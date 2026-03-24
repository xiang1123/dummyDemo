import { createRouter, createWebHistory } from 'vue-router'
import Layout from '../layout/index.vue'
import { useUserStore } from '../stores/user'

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
          component: () => import('../views/User.vue')
        },
        {
          path: 'products',
          name: 'Products',
          component: () => import('../views/Products.vue')
        }
      ]
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
    next()
  }
})

export default router