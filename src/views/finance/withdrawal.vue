<template>
  <div class="finance-container">
    <div class="glass-card table-wrapper">
      <div class="table-header">
        <h3>骑手提现申请</h3>
        <el-button type="primary" :icon="Refresh" circle @click="fetchData" />
      </div>
      
      <el-table :data="tableData" v-loading="loading" style="width: 100%; background: transparent;">
        <el-table-column prop="tradeNo" label="交易流水号" width="200" />
        <el-table-column prop="realName" label="骑手姓名" />
        <el-table-column prop="amount" label="提现金额">
          <template #default="scope">
            <span style="color: #67c23a; font-weight: bold;">¥ {{ scope.row.amount }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="alipayAccount" label="支付宝账号" />
        <el-table-column prop="createTime" label="申请时间" />
        <el-table-column prop="status" label="状态">
          <template #default="scope">
            <el-tag v-if="scope.row.status === 0" type="warning">待审核</el-tag>
            <el-tag v-else-if="scope.row.status === 1" type="success">已打款</el-tag>
            <el-tag v-else type="danger">已驳回</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <div v-if="scope.row.status === 0">
              <el-button type="success" size="small" @click="handleApprove(scope.row)">打款</el-button>
              <el-button type="danger" size="small" @click="handleReject(scope.row)">驳回</el-button>
            </div>
            <span v-else style="color: #909399; font-size: 0.8rem;">已处理</span>
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
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Refresh } from '@element-plus/icons-vue'
import request from '@/utils/request'
import { ElMessage, ElMessageBox } from 'element-plus'

const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = 10

const fetchData = async () => {
  loading.value = true
  try {
    // 模拟数据 - 实际应调用后端 API
    // const res = await request.get('/api/admin/finance/withdrawals', { params: { page: currentPage.value, size: pageSize } })
    // tableData.value = res.data.records
    // total.value = res.data.total
    
    // 临时 Mock 数据演示
    setTimeout(() => {
        tableData.value = [
            { id: 1, tradeNo: 'W202310240001', realName: '张三', amount: '100.00', alipayAccount: '13800138000', createTime: '2023-10-24 10:00:00', status: 0 },
            { id: 2, tradeNo: 'W202310240002', realName: '李四', amount: '50.00', alipayAccount: '13900139000', createTime: '2023-10-24 11:30:00', status: 1 },
        ]
        total.value = 2
        loading.value = false
    }, 500)
    
  } catch (error) {
    console.error(error)
    loading.value = false
  }
}

const handleApprove = (row) => {
  ElMessageBox.confirm(`确定向骑手 ${row.realName} 转账 ¥ ${row.amount} 吗？`, '打款确认', {
    confirmButtonText: '确定打款',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    // await request.post('/api/admin/finance/approve', { id: row.id })
    ElMessage.success('打款成功 (演示)')
    row.status = 1 // 仅演示更新状态
    // fetchData()
  })
}

const handleReject = (row) => {
  ElMessageBox.prompt('请输入驳回原因', '驳回申请', {
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  }).then(async ({ value }) => {
    // await request.post('/api/admin/finance/reject', { id: row.id, reason: value })
    ElMessage.success('已驳回 (演示)')
    row.status = 2 // 仅演示更新状态
    // fetchData()
  })
}

onMounted(() => {
  fetchData()
})
</script>

<style lang="scss" scoped>
.table-wrapper {
  padding: 20px;
  
  .table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }
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
    --el-pagination-button-disabled-bg-color: transparent;
}
</style>
