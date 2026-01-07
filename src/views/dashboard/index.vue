<template>
  <div class="dashboard-container">
    <el-row :gutter="20">
      <el-col :span="6" v-for="(item, index) in stats" :key="index">
        <div class="glass-card stat-card" ref="statCards">
          <div class="stat-icon" :style="{ background: item.color }">
            <el-icon><component :is="item.icon" /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-label">{{ item.label }}</div>
            <div class="stat-value">{{ item.value }}</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="mt-20">
      <el-col :span="16">
        <div class="glass-card chart-placeholder">
          <h3>订单趋势分析</h3>
          <div class="mock-chart">
            <!-- 实际开发时可接入 ECharts -->
            <div class="bar" v-for="n in 12" :key="n" :style="{ height: Math.random() * 100 + '%' }"></div>
          </div>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="glass-card activity-list">
          <h3>最近审核活动</h3>
          <div class="activity-item" v-for="n in 5" :key="n">
            <el-avatar :size="30" src="" />
            <div class="details">
              <p>管理员审核了骑手 <strong>张三</strong> 的申请</p>
              <span>10分钟前</span>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import gsap from 'gsap'

const statCards = ref([])

const stats = [
  { label: '总订单量', value: '1,284', icon: 'List', color: 'linear-gradient(135deg, #6e45e2 0%, #a18cd1 100%)' },
  { label: '今日收益', value: '¥ 458.00', icon: 'Money', color: 'linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)' },
  { label: '待审核骑手', value: '12', icon: 'Stamp', color: 'linear-gradient(135deg, #f1c40f 0%, #f39c12 100%)' },
  { label: '活跃用户', value: '856', icon: 'User', color: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)' }
]

onMounted(() => {
  gsap.from('.stat-card', {
    duration: 0.8,
    y: 30,
    opacity: 0,
    stagger: 0.2,
    ease: 'back.out(1.7)'
  })
})
</script>

<style lang="scss" scoped>
.mt-20 { margin-top: 20px; }

.stat-card {
  padding: 25px;
  display: flex;
  align-items: center;
  gap: 20px;
  
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
  
  .stat-label {
    font-size: 0.9rem;
    color: rgba(255, 255, 255, 0.6);
  }
  
  .stat-value {
    font-size: 1.5rem;
    font-weight: bold;
    margin-top: 5px;
  }
}

.chart-placeholder {
  padding: 20px;
  height: 400px;
  display: flex;
  flex-direction: column;
  
  .mock-chart {
    flex: 1;
    display: flex;
    align-items: flex-end;
    gap: 10px;
    padding: 20px;
    
    .bar {
      flex: 1;
      background: $bg-gradient;
      border-radius: 4px 4px 0 0;
      opacity: 0.7;
      transition: opacity 0.3s;
      &:hover { opacity: 1; }
    }
  }
}

.activity-list {
  padding: 20px;
  height: 400px;
  
  .activity-item {
    display: flex;
    gap: 15px;
    padding: 15px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    
    .details {
      p { margin: 0; font-size: 0.9rem; }
      span { font-size: 0.8rem; color: rgba(255, 255, 255, 0.4); }
    }
  }
}
</style>
