<template>
  <div class="audit-container">
    <div class="glass-card table-wrapper">
      <div class="table-header">
        <h3>骑手身份认证审核</h3>
        <el-button type="primary" :icon="Refresh" circle @click="fetchData" />
      </div>
      
      <el-table :data="tableData" v-loading="loading" style="width: 100%; background: transparent;">
        <el-table-column prop="realName" label="真实姓名" />
        <el-table-column prop="studentId" label="学号" />
        <el-table-column label="认证材料">
          <template #default="scope">
            <el-button type="info" link @click="viewImages(scope.row)">查看图片</el-button>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="申请时间" />
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button type="success" size="small" @click="handleApprove(scope.row)">通过</el-button>
            <el-button type="danger" size="small" @click="handleReject(scope.row)">驳回</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 图片预览对话框 -->
    <el-dialog v-model="dialogVisible" title="证件预览" width="50%" class="glass-dialog">
      <div class="image-preview" v-if="currentRider">
        <el-image :src="currentRider.idCardFront" fit="contain" />
        <el-image :src="currentRider.idCardBack" fit="contain" />
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Refresh } from '@element-plus/icons-vue'
import request from '@/utils/request'
import { ElMessage, ElMessageBox } from 'element-plus'

const loading = ref(false)
const tableData = ref([])
const dialogVisible = ref(false)
const currentRider = ref(null)

const fetchData = async () => {
  loading.value = true
  try {
    // 这里的接口路径根据您的 API 文档
    const res = await request.get('/api/admin/runner/pending')
    tableData.value = res.data.records || []
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const viewImages = (row) => {
  currentRider.value = row
  dialogVisible.value = true
}

const handleApprove = (row) => {
  ElMessageBox.confirm('确定通过该骑手的认证申请吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'success'
  }).then(async () => {
    await request.post('/api/admin/runner/approve', { runnerId: row.id, auditReason: '审核通过' })
    ElMessage.success('操作成功')
    fetchData()
  })
}

const handleReject = (row) => {
  ElMessageBox.prompt('请输入驳回原因', '驳回申请', {
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  }).then(async ({ value }) => {
    await request.post('/api/admin/runner/reject', { runnerId: row.id, auditReason: value })
    ElMessage.success('操作成功')
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
  
  .table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }
}

:deep(.el-table) {
  --el-table-bg-color: transparent;
  --el-table-tr-bg-color: transparent;
  --el-table-header-bg-color: rgba(255, 255, 255, 0.05);
  --el-table-border-color: rgba(255, 255, 255, 0.05);
  --el-table-text-color: #fff;
  
  th.el-table__cell { background-color: var(--el-table-header-bg-color) !important; }
}

.image-preview {
  display: flex;
  gap: 20px;
  justify-content: center;
  .el-image { width: 45%; border-radius: 8px; }
}
</style>
