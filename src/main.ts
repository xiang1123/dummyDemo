import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

// 1. 引入 Element Plus 和样式


// 2. 引入路由
import router from './router'

// 3. 引入 Pinia
import { createPinia } from 'pinia'

const app = createApp(App)


app.use(router)
app.use(createPinia())

app.mount('#app')