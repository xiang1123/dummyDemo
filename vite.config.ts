import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// 引入自动导入插件
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

export default defineConfig({
  plugins: [
    vue(),

    // 1. 自动导入 Vue 的 Composition API 和相关库
    AutoImport({
      // 告诉插件，我们要自动导入哪些库里的 API
      imports: ['vue', 'vue-router', 'pinia'],
      // 自动解析 Element Plus 的 API (如 ElMessage, ElMessageBox)
      resolvers: [ElementPlusResolver()],
      // 在 src 目录下自动生成 TypeScript 声明文件，防止 TS 标红报错
      dts: 'src/auto-imports.d.ts',
    }),

    // 2. 自动导入 Vue 组件
    Components({
      // 自动解析 Element Plus 组件 (如 el-button, el-dialog)
      resolvers: [ElementPlusResolver()],
      // 自动扫描并导入 src/components 下的所有自定义组件 (如 ProTable, Pagination)
      dirs: ['src/components'],
      dts: 'src/components.d.ts',
    }),
  ],
})