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

// DOM Refs
const lineChartRef = ref(null)
const pieChartRef = ref(null)
const barChartRef = ref(null)
const heatChartRef = ref(null)
const statCards = ref([])

// Charts instances
let lineChart = null
let pieChart = null
let barChart = null
let heatChart = null

// Mock Data for Stats
const stats = [
  { label: '今日订单', value: '1,284', icon: 'List', color: 'linear-gradient(135deg, #6e45e2 0%, #a18cd1 100%)', trend: 12.5 },
  { label: '今日营收', value: '4,580', icon: 'Money', color: 'linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)', trend: 8.2 },
  { label: '活跃骑手', value: '126', icon: 'User', color: 'linear-gradient(135deg, #f1c40f 0%, #f39c12 100%)', trend: -2.4 },
  { label: '异常订单', value: '3', icon: 'Warning', color: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)', trend: -50.0 }
]

// ECharts Dark Theme Colors (Element Plus compatible)
const chartTextColor = '#fff'
const chartGridColor = 'rgba(255,255,255,0.1)'
const toolTipBg = 'rgba(0,0,0,0.7)'

const initCharts = () => {
  // 1. Line Chart (Order Trend)
  if (lineChartRef.value) {
    lineChart = echarts.init(lineChartRef.value)
    lineChart.setOption({
      tooltip: { trigger: 'axis', backgroundColor: toolTipBg, textStyle: { color: '#fff' }, borderWidth: 0 },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true, borderColor: chartGridColor },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
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
          data: [820, 932, 901, 934, 1290, 1330, 1320],
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

  // 2. Pie Chart (Order Status)
  if (pieChartRef.value) {
    pieChart = echarts.init(pieChartRef.value)
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
          emphasis: { label: { show: true, fontSize: 20, fontWeight: 'bold', color: '#fff' } },
          data: [
            { value: 1048, name: '已完成', itemStyle: { color: '#2ecc71' } },
            { value: 300, name: '配送中', itemStyle: { color: '#3498db' } },
            { value: 42, name: '异常/取消', itemStyle: { color: '#e74c3c' } },
            { value: 120, name: '待接单', itemStyle: { color: '#f1c40f' } }
          ]
        }
      ]
    })
  }

  // 3. Bar Chart (Hot Zones)
  if (barChartRef.value) {
    barChart = echarts.init(barChartRef.value)
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
        data: ['行政楼', '图书馆', '女寝A栋', '男寝3号', '二食堂'],
        axisLine: { lineStyle: { color: 'rgba(255,255,255,0.3)' } },
        axisLabel: { color: 'rgba(255,255,255,0.7)' }
      },
      series: [
        {
          name: '单量',
          type: 'bar',
          data: [120, 200, 350, 420, 580],
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

  // 4. Line/Bar Mix (Peak Hours)
  if (heatChartRef.value) {
    heatChart = echarts.init(heatChartRef.value)
    heatChart.setOption({
       tooltip: { trigger: 'axis', backgroundColor: toolTipBg, textStyle: { color: '#fff' }, borderWidth: 0 },
       grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
       xAxis: {
         type: 'category',
         data: ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'],
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
           data: [20, 50, 180, 80, 60, 210, 150, 90],
           itemStyle: { color: '#f39c12', borderRadius: [5, 5, 0, 0] }
         },
         {
           name: '平均耗时(分)',
           type: 'line',
           yAxisIndex: 0,
           data: [15, 18, 35, 20, 18, 40, 25, 20],
           itemStyle: { color: '#e74c3c' }
         }
       ]
    })
  }
}

// Window resize handler
const handleResize = () => {
  lineChart?.resize()
  pieChart?.resize()
  barChart?.resize()
  heatChart?.resize()
}

onMounted(() => {
  // GSAP Entry Animation
  gsap.from('.stat-card', { duration: 0.8, y: 30, opacity: 0, stagger: 0.1, ease: 'back.out(1.7)' })
  gsap.from('.chart-card', { duration: 0.8, y: 50, opacity: 0, stagger: 0.2, delay: 0.3, ease: 'power2.out' })

  nextTick(() => {
    initCharts()
    window.addEventListener('resize', handleResize)
  })
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