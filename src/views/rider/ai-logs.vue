<template>
  <div class="logs-container">
    <div class="glass-card table-wrapper">
      <div class="table-header">
        <h3>AI 智能拦截日志</h3>
        <div class="filter-group">
          <el-select v-model="filterType" placeholder="拦截类型" style="width: 120px; margin-right: 10px;">
            <el-option label="全部" value="" />
            <el-option label="人脸不符" value="face_mismatch" />
            <el-option label="虚假配送" value="fake_delivery" />
            <el-option label="超时违规" value="timeout" />
          </el-select>
          <el-button type="primary" :icon="Refresh" circle @click="fetchData" />
        </div>
      </div>
      
      <el-table :data="tableData" v-loading="loading" style="width: 100%; background: transparent;">
        <el-table-column prop="logId" label="日志ID" width="120" />
        <el-table-column prop="riderName" label="关联骑手" />
        <el-table-column prop="orderId" label="关联订单号" />
        <el-table-column prop="reason" label="拦截原因">
          <template #default="scope">
            <el-tag v-if="scope.row.reason === 'face_mismatch'" type="danger">人脸不符</el-tag>
            <el-tag v-else-if="scope.row.reason === 'fake_delivery'" type="warning">虚假配送</el-tag>
            <el-tag v-else type="info">其他违规</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="confidence" label="AI置信度">
          <template #default="scope">
            <el-progress 
              :percentage="scope.row.confidence * 100" 
              :status="scope.row.confidence > 0.9 ? 'exception' : 'warning'" 
              :stroke-width="10"
            />
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="记录时间" width="180" />
        <el-table-column label="操作" width="120">
          <template #default="scope">
            <el-button type="primary" link @click="viewDetail(scope.row)">查看详情</el-button>
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

    <el-dialog v-model="dialogVisible" title="拦截详情" width="40%" class="glass-dialog">
      <div v-if="currentLog">
        <p><strong>骑手：</strong> {{ currentLog.riderName }}</p>
        <p><strong>拦截原因：</strong> {{ currentLog.detail }}</p>
        <div class="evidence-img" v-if="currentLog.evidenceUrl">
           <p><strong>证据截图：</strong></p>
           <el-image :src="currentLog.evidenceUrl" fit="cover" style="width: 100%; border-radius: 8px;" />
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Refresh } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = 10
const filterType = ref('')
const dialogVisible = ref(false)
const currentLog = ref(null)

const fetchData = async () => {
  loading.value = true
  // Mock data
  setTimeout(() => {
    tableData.value = [
      { logId: 'LOG001', riderName: '王五', orderId: 'ORD20231024001', reason: 'face_mismatch', confidence: 0.95, createTime: '2023-10-24 14:20', detail: '系统检测到接单人脸与注册人脸不匹配', evidenceUrl: 'https://via.placeholder.com/400x200?text=Evidence+Image' },
      { logId: 'LOG002', riderName: '赵六', orderId: 'ORD20231024005', reason: 'fake_delivery', confidence: 0.82, createTime: '2023-10-24 15:10', detail: '定位显示未到达目的地即点击送达', evidenceUrl: '' }
    ]
    total.value = 2
    loading.value = false
  }, 600)
}

const viewDetail = (row) => {
  currentLog.value = row
  dialogVisible.value = true
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
</style>
