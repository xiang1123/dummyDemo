<template>
  <div class="dashboard-container">
    <el-row :gutter="16">
      <el-col :xs="12" :sm="12" :md="6" :lg="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-title">商品总量</div>
          <div class="stat-value text-primary">{{ stats.productCount }}</div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="12" :md="6" :lg="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-title">用户总量</div>
          <div class="stat-value text-success">{{ stats.userCount }}</div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="12" :md="6" :lg="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-title">帖子总量</div>
          <div class="stat-value text-warning">{{ stats.postCount }}</div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="12" :md="6" :lg="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-title">待办总量</div>
          <div class="stat-value text-danger">{{ stats.todoCount }}</div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16" class="mt-16">
      <el-col :xs="24" :sm="24" :md="14" :lg="14">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <span>热门商品库存排行</span>
          </template>
          <div ref="stockChartRef" class="chart-box"></div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="24" :md="10" :lg="10">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <span>商品分类占比</span>
          </template>
          <div ref="categoryChartRef" class="chart-box"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16" class="mt-16">
      <el-col :xs="24" :sm="24" :md="14" :lg="14">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <span>帖子浏览趋势（Top 8）</span>
          </template>
          <div ref="postTrendChartRef" class="chart-box"></div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="24" :md="10" :lg="10">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <span>待办完成率</span>
          </template>
          <div ref="todoChartRef" class="chart-box"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import * as echarts from 'echarts'
import {
  getStatsAPI,
  getChartDataAPI,
  getPostTrendAPI,
  getTodoOverviewAPI,
} from '../api/modules/dashboard'
import { logError } from '../utils/error'

const stats = reactive({
  productCount: 0,
  userCount: 0,
  postCount: 0,
  todoCount: 0,
})

const stockChartRef = ref<HTMLElement | null>(null)
const categoryChartRef = ref<HTMLElement | null>(null)
const postTrendChartRef = ref<HTMLElement | null>(null)
const todoChartRef = ref<HTMLElement | null>(null)

const chartInstances: echarts.ECharts[] = []

const initData = async () => {
  try {
    const [statsRes, productRes, postRes, todoRes] = await Promise.all([
      getStatsAPI(),
      getChartDataAPI(),
      getPostTrendAPI(),
      getTodoOverviewAPI(),
    ])

    stats.productCount = statsRes.productCount
    stats.userCount = statsRes.userCount
    stats.postCount = statsRes.postCount
    stats.todoCount = statsRes.todoCount

    renderStockChart(productRes.products)
    renderCategoryChart(productRes.products)
    renderPostTrendChart(postRes.posts)
    renderTodoChart(todoRes.todos)
  } catch (error) {
    logError('获取大盘数据失败', error)
  }
}

const createChart = (el: HTMLElement | null) => {
  if (!el) return null
  const chart = echarts.init(el)
  chartInstances.push(chart)
  return chart
}

const renderStockChart = (products: any[]) => {
  const chart = createChart(stockChartRef.value)
  if (!chart) return

  const xData = products.map((p) => p.title.substring(0, 10) + '...') // 名字太长截断
  const yData = products.map((p) => p.stock)

  const option: echarts.EChartsOption = {
    tooltip: {
      trigger: 'axis',
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: xData,
      axisLabel: { rotate: 30 }, // 标签倾斜，防止字体重叠
    },
    yAxis: {
      type: 'value',
      name: '库存量 (件)',
    },
    series: [
      {
        name: '当前库存',
        type: 'bar',
        barWidth: '40%',
        data: yData,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#83bff6' },
            { offset: 0.5, color: '#188df0' },
            { offset: 1, color: '#188df0' },
          ]),
        },
      },
    ],
  }
  chart.setOption(option)
}

const renderCategoryChart = (products: any[]) => {
  const chart = createChart(categoryChartRef.value)
  if (!chart) return

  const map = new Map<string, number>()
  products.forEach((item) => {
    map.set(item.category, (map.get(item.category) || 0) + 1)
  })

  const data = Array.from(map.entries()).map(([name, value]) => ({ name, value }))

  chart.setOption({
    tooltip: { trigger: 'item' },
    legend: { bottom: 0 },
    series: [
      {
        name: '分类占比',
        type: 'pie',
        radius: ['40%', '70%'],
        itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
        data,
      },
    ],
  })
}

const renderPostTrendChart = (posts: any[]) => {
  const chart = createChart(postTrendChartRef.value)
  if (!chart) return

  const xData = posts.map((p) => p.title.substring(0, 8) + '...')
  const views = posts.map((p) => p.views)

  chart.setOption({
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      data: xData,
      axisLabel: { rotate: 20 },
    },
    yAxis: { type: 'value', name: '浏览量' },
    series: [
      {
        type: 'line',
        smooth: true,
        data: views,
        areaStyle: {},
      },
    ],
  })
}

const renderTodoChart = (todos: any[]) => {
  const chart = createChart(todoChartRef.value)
  if (!chart) return

  const completedCount = todos.filter((item) => item.completed).length
  const pendingCount = todos.length - completedCount

  chart.setOption({
    tooltip: { trigger: 'item' },
    series: [
      {
        type: 'pie',
        radius: ['45%', '72%'],
        label: { formatter: '{b}\n{d}%' },
        data: [
          { name: '已完成', value: completedCount },
          { name: '未完成', value: pendingCount },
        ],
      },
    ],
  })
}

const handleResize = () => {
  chartInstances.forEach((item) => item.resize())
}

onMounted(() => {
  initData()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  chartInstances.forEach((item) => item.dispose())
})
</script>

<style scoped>
.stat-card {
  border-radius: 10px;
  text-align: left;
  padding: 6px 4px;
}

.stat-title {
  color: #8a8f98;
  font-size: 13px;
  margin-bottom: 10px;
}

.stat-value {
  font-size: 30px;
  font-weight: 700;
  line-height: 1;
}

.text-primary {
  color: #409eff;
}
.text-success {
  color: #67c23a;
}
.text-warning {
  color: #e6a23c;
}
.text-danger {
  color: #f56c6c;
}

.chart-card {
  border-radius: 10px;
}

.chart-box {
  width: 100%;
  height: 340px;
}

.mt-16 {
  margin-top: 16px;
}
</style>
