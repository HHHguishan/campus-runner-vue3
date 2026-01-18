<template>
  <div class="dashboard-container">
    <!-- 头部统计卡片 -->
    <el-row :gutter="20">
      <el-col :span="6" v-for="(item, index) in stats" :key="index">
        <div class="glass-card stat-card" ref="statCards">
          <div class="stat-icon" :style="{ background: item.color }">
            <el-icon><component :is="item.icon" /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-label">{{ item.label }}</div>
            <div class="stat-value">
               <!-- 简单的数字滚动效果 -->
               <span class="num">{{ item.value }}</span>
            </div>
            <div class="stat-trend" :class="{ 'up': item.trend > 0, 'down': item.trend < 0 }">
              {{ item.trend > 0 ? '+' : '' }}{{ item.trend }}% 较昨日
            </div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 图表第一行: 趋势与占比 -->
    <el-row :gutter="20" class="mt-20">
      <el-col :span="16">
        <div class="glass-card chart-card">
          <div class="card-header">
            <h3>近七日订单趋势</h3>
          </div>
          <div ref="lineChartRef" class="chart-box"></div>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="glass-card chart-card">
           <div class="card-header">
            <h3>今日订单状态</h3>
          </div>
          <div ref="pieChartRef" class="chart-box"></div>
        </div>
      </el-col>
    </el-row>

    <!-- 图表第二行: 热点区域与时段分析 -->
    <el-row :gutter="20" class="mt-20">
      <el-col :span="12">
        <div class="glass-card chart-card">
           <div class="card-header">
            <h3>热门配送区域 Top 5</h3>
          </div>
          <div ref="barChartRef" class="chart-box"></div>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="glass-card chart-card">
           <div class="card-header">
            <h3>高峰时段分析</h3>
          </div>
          <div ref="heatChartRef" class="chart-box"></div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { List, Money, User, Warning } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import gsap from 'gsap'
import { getDashboardStats } from '@/api/admin'
import { ElMessage } from 'element-plus'

// DOM Refs
const lineChartRef = ref(null)
const pieChartRef = ref(null)
const barChartRef = ref(null)
const heatChartRef = ref(null)

// Charts instances
let lineChart = null
let pieChart = null
let barChart = null
let heatChart = null

// Real Data
const stats = ref([])
const loading = ref(false)

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getDashboardStats()
    if (res.code === 200 && res.data) {
      const data = res.data
      
      // 1. 更新顶部卡片
      stats.value = data.stats
      
      // 2. 更新图表
      nextTick(() => {
        updateLineChart(data.lineChart)
        updatePieChart(data.pieChart)
        updateBarChart(data.barChart)
        updateHeatChart(data.heatChart)
      })
      
      // 入场动画
      gsap.from('.stat-card', { duration: 0.8, y: 30, opacity: 0, stagger: 0.1, ease: 'back.out(1.7)' })
    }
  } catch (error) {
    console.error('获取统计数据失败:', error)
    ElMessage.error('获取统计数据失败')
  } finally {
    loading.value = false
  }
}

// ECharts Dark Theme Colors (Element Plus compatible)
const chartTextColor = '#fff'
const chartGridColor = 'rgba(255,255,255,0.1)'
const toolTipBg = 'rgba(0,0,0,0.7)'

const updateLineChart = (data) => {
  if (!lineChartRef.value || !data) return
  if (!lineChart) lineChart = echarts.init(lineChartRef.value)
  
  lineChart.setOption({
    tooltip: { trigger: 'axis', backgroundColor: toolTipBg, textStyle: { color: '#fff' }, borderWidth: 0 },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true, borderColor: chartGridColor },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: data.categories,
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.3)' } },
      axisLabel: { color: 'rgba(255,255,255,0.7)' }
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: chartGridColor } },
      axisLabel: { color: 'rgba(255,255,255,0.7)' }
    },
    series: [
      {
        name: '订单量',
        type: 'line',
        smooth: true,
        data: data.data,
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(110, 69, 226, 0.5)' },
            { offset: 1, color: 'rgba(110, 69, 226, 0.01)' }
          ])
        },
        itemStyle: { color: '#6e45e2' },
        lineStyle: { width: 3 }
      }
    ]
  })
}

const updatePieChart = (data) => {
  if (!pieChartRef.value || !data) return
  if (!pieChart) pieChart = echarts.init(pieChartRef.value)
  
  pieChart.setOption({
    tooltip: { trigger: 'item', backgroundColor: toolTipBg, textStyle: { color: '#fff' }, borderWidth: 0 },
    legend: { bottom: '0%', left: 'center', textStyle: { color: chartTextColor } },
    series: [
      {
        name: '订单状态',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 10, borderColor: '#1e1e2f', borderWidth: 2 },
        label: { show: false, position: 'center' },
        emphasis: { label: { show: true, fontSize: 16, fontWeight: 'bold', color: '#fff' } },
        data: data
      }
    ]
  })
}

const updateBarChart = (data) => {
  if (!barChartRef.value || !data) return
  if (!barChart) barChart = echarts.init(barChartRef.value)
  
  barChart.setOption({
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, backgroundColor: toolTipBg, textStyle: { color: '#fff' }, borderWidth: 0 },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: chartGridColor } },
      axisLabel: { color: 'rgba(255,255,255,0.7)' }
    },
    yAxis: {
      type: 'category',
      data: data.categories,
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.3)' } },
      axisLabel: { color: 'rgba(255,255,255,0.7)' }
    },
    series: [
      {
        name: '单量',
        type: 'bar',
        data: data.data,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [
            { offset: 0, color: '#88d3ce' },
            { offset: 1, color: '#6e45e2' }
          ]),
          borderRadius: [0, 10, 10, 0]
        }
      }
    ]
  })
}

const updateHeatChart = (data) => {
  if (!heatChartRef.value || !data) return
  if (!heatChart) heatChart = echarts.init(heatChartRef.value)
  
  heatChart.setOption({
     tooltip: { trigger: 'axis', backgroundColor: toolTipBg, textStyle: { color: '#fff' }, borderWidth: 0 },
     grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
     xAxis: {
       type: 'category',
       data: data.categories,
       axisLabel: { color: 'rgba(255,255,255,0.7)' }
     },
     yAxis: {
       type: 'value',
       splitLine: { lineStyle: { color: chartGridColor } },
       axisLabel: { color: 'rgba(255,255,255,0.7)' }
     },
     series: [
       {
         name: '接单活跃度',
         type: 'bar',
         data: data.activityData,
         itemStyle: { color: '#f39c12', borderRadius: [5, 5, 0, 0] }
       },
       {
         name: '平均耗时(分)',
         type: 'line',
         yAxisIndex: 0,
         data: data.avgTimeData,
         itemStyle: { color: '#e74c3c' }
       }
     ]
  })
}

// Window resize handler
const handleResize = () => {
  lineChart?.resize()
  pieChart?.resize()
  barChart?.resize()
  heatChart?.resize()
}

onMounted(() => {
  fetchData()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  lineChart?.dispose()
  pieChart?.dispose()
  barChart?.dispose()
  heatChart?.dispose()
})
</script>

<style lang="scss" scoped>
.mt-20 { margin-top: 20px; }

.stat-card {
  padding: 25px;
  display: flex;
  align-items: center;
  gap: 20px;
  transition: transform 0.3s;
  
  &:hover {
    transform: translateY(-5px);
  }
  
  .stat-icon {
    width: 50px;
    height: 50px;
    border-radius: 12px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 24px;
    color: white;
  }
  
  .stat-info {
    flex: 1;
    .stat-label {
      font-size: 0.9rem;
      color: rgba(255, 255, 255, 0.6);
    }
    
    .stat-value {
      font-size: 1.6rem;
      font-weight: bold;
      margin: 5px 0;
      color: #fff;
    }

    .stat-trend {
        font-size: 0.8rem;
        display: flex;
        align-items: center;
        
        &.up { color: #2ecc71; }
        &.down { color: #e74c3c; }
    }
  }
}

.chart-card {
  padding: 20px;
  height: 380px;
  display: flex;
  flex-direction: column;
  
  .card-header {
      margin-bottom: 15px;
      h3 {
          margin: 0;
          font-size: 1.1rem;
          color: rgba(255,255,255,0.9);
          border-left: 4px solid #6e45e2;
          padding-left: 10px;
      }
  }

  .chart-box {
    flex: 1;
    width: 100%;
    min-height: 0; // Fix flex overflow issue
  }
}
</style>