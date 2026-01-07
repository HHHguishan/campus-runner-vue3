<template>
  <div class="order-manage-container">
    <div class="glass-card table-wrapper">
      <div class="table-header">
        <h3>订单监管中心</h3>
        <div class="search-bar">
          <el-input v-model="searchKeyword" placeholder="订单号/骑手/用户" style="width: 200px; margin-right: 10px;" />
          <el-button type="primary" :icon="Search" @click="fetchData">搜索</el-button>
        </div>
      </div>
      
      <el-tabs v-model="activeTab" @tab-click="fetchData" class="custom-tabs">
        <el-tab-pane label="异常订单" name="abnormal" />
        <el-tab-pane label="进行中" name="ongoing" />
        <el-tab-pane label="历史订单" name="history" />
      </el-tabs>

      <el-table :data="tableData" v-loading="loading" style="width: 100%; background: transparent;">
        <el-table-column prop="orderNo" label="订单号" width="180" />
        <el-table-column prop="status" label="状态" width="100">
           <template #default="scope">
            <el-tag v-if="scope.row.status === 'abnormal'" type="danger" effect="dark">异常</el-tag>
            <el-tag v-else-if="scope.row.status === 'delivering'" type="primary">配送中</el-tag>
            <el-tag v-else type="success">已完成</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="riderName" label="接单骑手" />
        <el-table-column prop="customerName" label="下单用户" />
        <el-table-column prop="amount" label="金额">
            <template #default="scope">¥ {{ scope.row.amount }}</template>
        </el-table-column>
        <el-table-column prop="createTime" label="下单时间" width="160" />
        <el-table-column label="操作" width="180">
          <template #default="scope">
            <el-button type="info" link size="small" @click="viewDetail(scope.row)">详情</el-button>
            <el-button v-if="scope.row.status === 'abnormal'" type="danger" link size="small" @click="handleIntervene(scope.row)">人工干预</el-button>
          </template>
        </el-table-column>
      </el-table>
      
       <div class="pagination-wrapper">
        <el-pagination 
          background 
          layout="prev, pager, next" 
          :total="total" 
          :page-size="pageSize"
          v-model:current-page="currentPage"
          @current-change="fetchData"
        />
      </div>
    </div>

    <!-- 订单详情弹窗 -->
    <el-drawer v-model="drawerVisible" title="订单详情" size="40%" class="glass-drawer">
       <div v-if="currentOrder" class="order-detail">
         <div class="detail-section">
            <h4>基础信息</h4>
            <p><strong>订单号：</strong> {{ currentOrder.orderNo }}</p>
            <p><strong>下单时间：</strong> {{ currentOrder.createTime }}</p>
            <p><strong>备注：</strong> {{ currentOrder.remark || '无' }}</p>
         </div>
         <div class="detail-section">
            <h4>配送信息</h4>
            <p><strong>取件地址：</strong> {{ currentOrder.pickupAddr }}</p>
            <p><strong>送达地址：</strong> {{ currentOrder.deliveryAddr }}</p>
         </div>
         <div class="detail-section" v-if="currentOrder.abnormalReason">
             <h4 style="color: #F56C6C;">异常原因</h4>
             <p style="color: #ffcccc;">{{ currentOrder.abnormalReason }}</p>
         </div>
       </div>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const loading = ref(false)
const tableData = ref([])
const activeTab = ref('abnormal')
const searchKeyword = ref('')
const total = ref(0)
const currentPage = ref(1)
const pageSize = 10
const drawerVisible = ref(false)
const currentOrder = ref(null)

const fetchData = async () => {
  loading.value = true
  // Mock data based on tab
  setTimeout(() => {
    if (activeTab.value === 'abnormal') {
        tableData.value = [
            { orderNo: 'ORD20231024999', status: 'abnormal', riderName: '张三', customerName: '小明', amount: '15.00', createTime: '2023-10-24 12:00', pickupAddr: '食堂一楼', deliveryAddr: '宿舍A栋302', abnormalReason: '骑手长时间未移动，疑似异常停留' }
        ]
        total.value = 1
    } else {
        tableData.value = [
            { orderNo: 'ORD20231024888', status: 'delivering', riderName: '李四', customerName: '小红', amount: '12.50', createTime: '2023-10-24 12:30', pickupAddr: '超市', deliveryAddr: '图书馆' }
        ]
        total.value = 50
    }
    loading.value = false
  }, 500)
}

const viewDetail = (row) => {
  currentOrder.value = row
  drawerVisible.value = true
}

const handleIntervene = (row) => {
    ElMessageBox.confirm('是否强制取消该订单并退款给用户？', '人工干预', {
        confirmButtonText: '强制取消',
        cancelButtonText: '暂不处理',
        type: 'warning'
    }).then(() => {
        ElMessage.success('订单已强制取消')
        fetchData()
    })
}

onMounted(() => {
  fetchData()
})
</script>

<style lang="scss" scoped>
.table-wrapper {
  padding: 20px;
}
.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.search-bar {
  display: flex;
}
.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

:deep(.el-table) {
  --el-table-bg-color: transparent;
  --el-table-tr-bg-color: transparent;
  --el-table-header-bg-color: rgba(255, 255, 255, 0.05);
  --el-table-border-color: rgba(255, 255, 255, 0.05);
  --el-table-text-color: #fff;
  th.el-table__cell { background-color: var(--el-table-header-bg-color) !important; }
}
:deep(.el-pagination) {
  --el-pagination-bg-color: transparent;
  --el-pagination-text-color: #fff;
  --el-pagination-button-color: rgba(255,255,255,0.1);
}
:deep(.el-tabs__item) {
    color: rgba(255,255,255,0.7);
    &.is-active { color: #409EFF; }
}
.detail-section {
    margin-bottom: 20px;
    h4 { border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px; margin-bottom: 10px; }
    p { margin: 5px 0; color: rgba(255,255,255,0.8); }
}
</style>
