<template>
  <div class="dashboard-container">
    <el-row :gutter="20">
      <el-col :span="8">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-title">总计商品 (Products)</div>
          <div class="stat-value">{{ stats.productCount }}</div>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-title">注册用户 (Users)</div>
          <div class="stat-value text-success">{{ stats.userCount }}</div>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-title">全网发帖 (Posts)</div>
          <div class="stat-value text-warning">{{ stats.postCount }}</div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="mt-20">
      <el-col :span="24">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>热门商品库存状态分析</span>
            </div>
          </template>
          <div ref="chartRef" style="height: 400px; width: 100%"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, reactive } from 'vue'
import * as echarts from 'echarts'
import { getStatsAPI, getChartDataAPI } from '../api/modules/dashboard'

const stats = reactive({
  productCount: 0,
  userCount: 0,
  postCount: 0,
})

const chartRef = ref<HTMLElement | null>(null)
let myChart: echarts.ECharts | null = null

const initData = async () => {
  try {
    const res = await getStatsAPI()
    stats.productCount = res.productCount
    stats.userCount = res.userCount
    stats.postCount = res.postCount

    const chartRes = await getChartDataAPI()
    renderChart(chartRes.products)
  } catch (error) {
    console.error('获取大盘数据失败', error)
  }
}

const renderChart = async (products: any[]) => {
  if (!chartRef.value) return

  myChart = echarts.init(chartRef.value)

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
  myChart.setOption(option)
}

const handleResize = () => {
  myChart?.resize()
}

onMounted(() => {
  initData()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  myChart?.dispose()
})
</script>

<style scoped>
.dashboard-container {
  /* 基础的内边距已经在 layout 里写了，这里按需调整 */
}

.stat-card {
  text-align: center;
  padding: 10px 0;
}

.stat-title {
  color: #909399;
  font-size: 14px;
  margin-bottom: 12px;
}

.stat-value {
  font-size: 32px;
  font-weight: bold;
  color: #303133;
}

.text-success {
  color: #67c23a;
}
.text-warning {
  color: #e6a23c;
}

.mt-20 {
  margin-top: 20px;
}
</style>
