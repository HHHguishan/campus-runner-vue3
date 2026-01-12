<template>
  <div class="audit-container">
    <div class="glass-card table-wrapper">
      <div class="table-header">
        <h3>骑手身份认证审核</h3>
        <el-button type="primary" :icon="Refresh" circle @click="fetchData" />
      </div>

      <el-tabs v-model="activeTab" @tab-change="handleTabChange" class="custom-tabs">
        <el-tab-pane label="待审核" name="pending" />
        <el-tab-pane label="已通过" name="approved" />
        <el-tab-pane label="已驳回" name="rejected" />
        <el-tab-pane label="全部" name="all" />
      </el-tabs>

      <el-table :data="tableData" v-loading="loading" style="width: 100%; background: transparent;">
        <el-table-column prop="realName" label="真实姓名" width="120" />
        <el-table-column prop="studentId" label="学号" width="150" />
        <el-table-column prop="school" label="学校" width="150" />
        <el-table-column label="审核状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusTagType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="认证材料">
          <template #default="scope">
            <el-button type="info" link @click="viewImages(scope.row)">查看图片</el-button>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="申请时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button v-if="scope.row.status === 0" type="success" size="small" @click="handleApprove(scope.row)">通过</el-button>
            <el-button v-if="scope.row.status === 0" type="danger" size="small" @click="handleReject(scope.row)">驳回</el-button>
            <span v-if="scope.row.status !== 0" style="color: rgba(255,255,255,0.5); font-size: 12px;">
              {{ scope.row.status === 1 ? '已通过' : '已驳回' }}
            </span>
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

    <!-- 图片预览对话框 -->
    <el-dialog v-model="dialogVisible" title="证件预览" width="50%" class="glass-dialog">
      <div class="image-preview" v-if="currentRider">
        <el-image
          :src="currentRider.studentCardImg"
          fit="contain"
          :preview-src-list="[currentRider.studentCardImg]"
        />
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { Refresh } from '@element-plus/icons-vue'
import request from '@/utils/request'
import { updateRiderStatus } from '@/api/rider'
import { ElMessage, ElMessageBox } from 'element-plus'

const loading = ref(false)
const tableData = ref([])
const dialogVisible = ref(false)
const currentRider = ref(null)
const activeTab = ref('pending')
const currentPage = ref(1)
const pageSize = 10
const total = ref(0)

// 状态映射
const statusFilter = computed(() => {
  switch (activeTab.value) {
    case 'pending':
      return 0 // 待审核
    case 'approved':
      return 1 // 已通过
    case 'rejected':
      return 2 // 已驳回
    case 'all':
      return null // 全部
    default:
      return 0
  }
})

// 获取状态文本
const getStatusText = (status) => {
  const map = {
    0: '待审核',
    1: '已通过',
    2: '已驳回'
  }
  return map[status] || '未知'
}

// 获取状态标签类型
const getStatusTagType = (status) => {
  const map = {
    0: 'warning',
    1: 'success',
    2: 'danger'
  }
  return map[status] || 'info'
}

// Tab切换处理
const handleTabChange = () => {
  currentPage.value = 1
  fetchData()
}

const fetchData = async () => {
  loading.value = true
  try {
    let url = '/api/admin/runner/pending'
    let params = {
      page: currentPage.value,
      size: pageSize
    }

    // 如果不是待审核，使用新接口
    if (activeTab.value !== 'pending') {
      url = '/api/admin/runner/all'
      if (statusFilter.value !== null) {
        params.status = statusFilter.value
      }
    }

    const res = await request.get(url, { params })
    tableData.value = res.data.records || []
    total.value = res.data.total || 0
  } catch (error) {
    console.error('获取数据失败:', error)
    ElMessage.error('获取数据失败')
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
    try {
      await updateRiderStatus({ runnerId: row.id, status: 1 })
      ElMessage.success('操作成功')
      fetchData()
    } catch (error) {
      console.error(error)
    }
  }).catch(() => {})
}

const handleReject = (row) => {
  ElMessageBox.prompt('请输入驳回原因', '驳回申请', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPattern: /\S+/,
    inputErrorMessage: '驳回原因不能为空'
  }).then(async ({ value }) => {
    try {
      await updateRiderStatus({ runnerId: row.id, status: 2, reason: value })
      ElMessage.success('操作成功')
      fetchData()
    } catch (error) {
      console.error(error)
    }
  }).catch(() => {})
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
  --el-table-row-hover-bg-color: rgba(64, 158, 255, 0.15);

  th.el-table__cell {
    background-color: var(--el-table-header-bg-color) !important;
  }

  /* 优化 hover 效果 */
  .el-table__body tr:hover > td {
    background-color: rgba(64, 158, 255, 0.15) !important;
  }

  .el-table__body tr:hover > td .cell {
    color: #fff !important;
  }

  .el-table__body tr:hover > td .el-tag {
    border-color: rgba(255, 255, 255, 0.3) !important;
  }

  /* 禁用默认的白色 hover */
  &.el-table--enable-row-hover .el-table__body tr:hover > td {
    background-color: rgba(64, 158, 255, 0.15) !important;
  }
}

:deep(.el-tabs__item) {
  color: rgba(255,255,255,0.7);
  &.is-active { color: #409EFF; }
}

:deep(.el-pagination) {
  --el-pagination-bg-color: transparent;
  --el-pagination-text-color: #fff;
  --el-pagination-button-color: rgba(255,255,255,0.1);
}

.image-preview {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;

  .el-image {
    max-width: 100%;
    max-height: 600px;
    border-radius: 8px;
  }
}
</style>
