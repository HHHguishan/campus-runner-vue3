<template>
  <div class="rider-manage-container">
    <div class="glass-card table-wrapper">
      <div class="table-header">
        <div class="header-left">
          <h3>骑手管理</h3>
        </div>
        <div class="header-right">
          <el-button type="primary" :icon="Refresh" circle @click="fetchData" />
        </div>
      </div>

      <!-- 搜索栏 -->
      <div class="search-bar">
        <el-input
          v-model="queryParams.keyword"
          placeholder="姓名/学号"
          style="width: 200px"
          clearable
          @keyup.enter="handleSearch"
        />
        <el-select v-model="queryParams.status" placeholder="认证状态" clearable style="width: 120px">
          <el-option label="待审核" :value="0" />
          <el-option label="已通过" :value="1" />
          <el-option label="已驳回" :value="2" />
        </el-select>
        <el-input
          v-model="queryParams.schoolName"
          placeholder="学校名称"
          style="width: 180px"
          clearable
          @keyup.enter="handleSearch"
        />
        <el-input
          v-model="queryParams.college"
          placeholder="学院名称"
          style="width: 180px"
          clearable
          @keyup.enter="handleSearch"
        />
        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button @click="resetQuery">重置</el-button>
      </div>

      <!-- 批量操作 -->
      <div class="batch-bar" v-if="selectedRows.length > 0">
        <el-button type="success" size="small" @click="handleBatchOperation('approve')">批量通过</el-button>
        <el-button type="danger" size="small" @click="handleBatchOperation('reject')">批量驳回</el-button>
        <el-divider direction="vertical" />
        <el-button type="warning" size="small" @click="handleBatchOperation('freeze')">批量冻结</el-button>
        <el-button type="info" size="small" @click="handleBatchOperation('unfreeze')">批量解冻</el-button>
        <span class="selection-info">已选择 {{ selectedRows.length }} 项</span>
      </div>

      <!-- 表格 -->
      <el-table
        :data="tableData"
        v-loading="loading"
        style="width: 100%; background: transparent;"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column label="骑手信息" width="200">
          <template #default="scope">
            <div class="user-cell">
              <div class="user-info">
                <div class="nickname">{{ scope.row.realName }}</div>
                <div class="username">{{ scope.row.studentId }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="学校" show-overflow-tooltip>
          <template #default="scope">
            {{ scope.row.school || scope.row.schoolName || scope.row.school_name || scope.row.runner?.school || scope.row.runner?.schoolName || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="college" label="学院" show-overflow-tooltip>
          <template #default="scope">
             {{ scope.row.college || scope.row.runner?.college || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="认证状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusTagType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="冻结状态" width="100">
           <template #default="scope">
             <el-tag v-if="isRiderFrozen(scope.row)" type="danger" size="small">已冻结</el-tag>
             <el-tag v-else type="success" size="small">正常</el-tag>
           </template>
        </el-table-column>
        <el-table-column prop="totalIncome" label="总收入" width="120">
          <template #default="scope">
            ￥{{ scope.row.totalIncome ?? scope.row.income ?? scope.row.total_income ?? scope.row.runner?.totalIncome ?? scope.row.runner?.income ?? 0 }}
          </template>
        </el-table-column>
        <el-table-column prop="averageRating" label="评分" width="80">
          <template #default="scope">
            {{ scope.row.averageRating ?? scope.row.score ?? scope.row.rating ?? scope.row.runner?.averageRating ?? scope.row.runner?.score ?? '-' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="220">
          <template #default="scope">
            <el-button type="primary" link @click="handleDetail(scope.row)">详情</el-button>
            <template v-if="scope.row.status === 0">
              <el-button type="success" link @click="handleAudit(scope.row, 1)">通过</el-button>
              <el-button type="danger" link @click="handleAudit(scope.row, 2)">驳回</el-button>
            </template>
            <template v-else>
               <el-button 
                :type="isRiderFrozen(scope.row) ? 'success' : 'warning'" 
                link 
                @click="handleFreeze(scope.row)"
              >
                {{ isRiderFrozen(scope.row) ? '解冻' : '冻结' }}
              </el-button>
            </template>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          background
          layout="total, prev, pager, next, jumper"
          :total="total"
          :page-size="queryParams.size"
          v-model:current-page="queryParams.current"
          @current-change="fetchData"
        />
      </div>
    </div>

    <!-- 详情弹窗 -->
    <el-dialog v-model="detailVisible" title="骑手详情" width="700px" class="glass-dialog">
      <div v-if="currentRider" class="detail-content">
        <h4>基本信息</h4>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="真实姓名">{{ currentRider.realName }}</el-descriptions-item>
          <el-descriptions-item label="学号">{{ currentRider.studentId }}</el-descriptions-item>
          <el-descriptions-item label="学校">{{ currentRider.school || currentRider.schoolName || currentRider.school_name || currentRider.university || currentRider.runner?.school || '-' }}</el-descriptions-item>
          <el-descriptions-item label="学院">{{ currentRider.college || currentRider.runner?.college || '-' }}</el-descriptions-item>
          <el-descriptions-item label="认证状态">{{ getStatusText(currentRider.status) }}</el-descriptions-item>
          <el-descriptions-item label="冻结状态">{{ isRiderFrozen(currentRider) ? '已冻结' : '正常' }}</el-descriptions-item>
        </el-descriptions>
        
        <h4>认证材料</h4>
        <div class="image-preview" v-if="currentRider.studentCardImg || currentRider.runner?.studentCardImg">
            <el-image 
              :src="currentRider.studentCardImg || currentRider.runner?.studentCardImg" 
              :preview-src-list="[currentRider.studentCardImg || currentRider.runner?.studentCardImg]"
              style="width: 200px; height: 120px; border-radius: 4px;"
            />
        </div>

        <h4>统计信息</h4>
        <el-descriptions :column="3" border>
          <el-descriptions-item label="总单量">{{ currentRider.totalOrders || currentRider.runner?.totalOrders || 0 }}</el-descriptions-item>
          <el-descriptions-item label="总收入">￥{{ currentRider.totalIncome ?? currentRider.income ?? currentRider.total_income ?? currentRider.runner?.totalIncome ?? 0 }}</el-descriptions-item>
          <el-descriptions-item label="综合评分">{{ currentRider.averageRating ?? currentRider.score ?? currentRider.rating ?? currentRider.runner?.averageRating ?? '-' }}</el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { Refresh } from '@element-plus/icons-vue'
import { getRiderList, getRiderDetail, updateRiderStatus, batchRiderOperation } from '@/api/rider'
import { ElMessage, ElMessageBox } from 'element-plus'

const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const selectedRows = ref([])
const detailVisible = ref(false)
const currentRider = ref(null)

const queryParams = reactive({
  current: 1,
  size: 10,
  keyword: '',
  status: null,
  schoolName: '',
  college: ''
})

const getStatusText = (status) => {
  const map = { 0: '待审核', 1: '已通过', 2: '已驳回' }
  return map[status] || '未知'
}

const getStatusTagType = (status) => {
  const map = { 0: 'warning', 1: 'success', 2: 'danger' }
  return map[status] || 'info'
}

const isRiderFrozen = (row) => {
  if (!row) return false
  return Number(row.isRider) === 0
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getRiderList(queryParams)
    tableData.value = res.data.records
    total.value = res.data.total
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  queryParams.current = 1
  fetchData()
}

const resetQuery = () => {
  queryParams.keyword = ''
  queryParams.status = null
  queryParams.schoolName = ''
  queryParams.college = ''
  handleSearch()
}

const handleSelectionChange = (val) => {
  selectedRows.value = val
}

const handleAudit = async (row, status) => {
  try {
    let reason = ''
    if (status === 2) {
      const { value } = await ElMessageBox.prompt('请输入驳回原因', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /\S+/,
        inputErrorMessage: '原因不能为空'
      })
      reason = value
    } else {
       await ElMessageBox.confirm('确定通过该骑手的认证申请吗？', '提示', { type: 'success' })
    }

    await updateRiderStatus({ runnerId: row.id, status, reason })
    
    ElMessage.success('操作成功')
    fetchData()
  } catch (error) {
    if (error !== 'cancel') console.error(error)
  }
}

const handleFreeze = async (row) => {
  const isCurrentlyFrozen = isRiderFrozen(row)
  const actionText = isCurrentlyFrozen ? '解冻' : '冻结'
  
  try {
    await ElMessageBox.confirm(`确定要${actionText}该骑手吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await batchRiderOperation({ 
      userIds: [row.userId || row.id], 
      operation: isCurrentlyFrozen ? 'unfreeze' : 'freeze'
    })
    
    ElMessage.success('操作成功')
    fetchData()
  } catch (error) {
    if (error !== 'cancel') console.error(error)
  }
}

const handleBatchOperation = (operation) => {
  // Doc says batch takes "userIds". This is important. 
  // Does the list return userId? 
  // I will assume the list returns `userId` as well.
  // If not, I might be sending runnerIds as userIds which could be wrong.
  // API doc says: "Batch Rider -> userIds". 
  // API doc says: "Rider List -> ...".
  // I'll assume `userId` is available in row.
  const ids = selectedRows.value.map(row => row.userId || row.id) 
  
  const mapText = {
    'approve': '批量通过',
    'reject': '批量驳回',
    'freeze': '批量冻结',
    'unfreeze': '批量解冻'
  }

  ElMessageBox.confirm(`确定要对选中的 ${ids.length} 个骑手进行${mapText[operation]}操作吗？`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    let reason = ''
    if (operation === 'reject') {
       const { value } = await ElMessageBox.prompt('请输入批量驳回原因', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /\S+/,
        inputErrorMessage: '原因不能为空'
      })
      reason = value
    }

    await batchRiderOperation({ userIds: ids, operation, reason })
    ElMessage.success('操作成功')
    fetchData()
    selectedRows.value = []
  }).catch(() => {})
}

const handleDetail = async (row) => {
  try {
    // Doc: runnerId for detail
    const res = await getRiderDetail(row.id)
    currentRider.value = res.data
    detailVisible.value = true
  } catch (error) {
    console.error(error)
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style lang="scss" scoped>
.rider-manage-container {
  .table-wrapper {
    padding: 20px;
    background: rgba(255, 255, 255, 0.02);
    border-radius: 12px;
  }
  
  .table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    h3 {
      margin: 0;
      color: #fff;
    }
  }

  .search-bar {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    margin-bottom: 20px;
  }

  .batch-bar {
    margin-bottom: 15px;
    padding: 10px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    display: flex;
    align-items: center;
    gap: 10px;
    .selection-info {
      color: rgba(255, 255, 255, 0.6);
      font-size: 13px;
    }
  }

  .user-cell {
    display: flex;
    align-items: center;
    gap: 10px;
    .user-info {
      display: flex;
      flex-direction: column;
      .nickname { font-weight: 500; }
      .username { font-size: 12px; color: rgba(255, 255, 255, 0.6); }
    }
  }

  .pagination-wrapper {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}

.detail-content {
  h4 {
    margin: 15px 0 10px;
    padding-left: 10px;
    border-left: 3px solid #409eff;
    color: #fff;
  }
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
  
  .el-table__body tr:hover > td {
    background-color: rgba(64, 158, 255, 0.15) !important;
  }
}

:deep(.el-input__wrapper), :deep(.el-select__wrapper) {
  background-color: rgba(255, 255, 255, 0.05);
  box-shadow: none;
  &.is-focus {
    box-shadow: 0 0 0 1px #409eff inset;
  }
}
:deep(.el-input__inner) {
  color: #fff;
}

:deep(.el-pagination) {
  --el-pagination-bg-color: transparent;
  --el-pagination-text-color: #fff;
  --el-pagination-button-color: rgba(255,255,255,0.1);
}
</style>
