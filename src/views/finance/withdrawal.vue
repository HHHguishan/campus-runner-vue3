<template>
  <div class="finance-container">
    <div class="glass-card table-wrapper">
      <div class="table-header">
        <h3>骑手提现申请</h3>
        <el-button type="primary" :icon="Refresh" circle @click="fetchData" />
      </div>
      
      <el-table :data="tableData" v-loading="loading" style="width: 100%; background: transparent;">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="realName" label="用户姓名" />
        <el-table-column prop="amount" label="提现金额">
          <template #default="scope">
            <span style="color: #67c23a; font-weight: bold;">¥ {{ scope.row.amount }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="accountNo" label="收款账号" />
        <!-- 后端暂时未返回 createTime，如需要展示可联系后端补充，或者暂不展示 -->
        <!-- <el-table-column prop="createTime" label="申请时间" width="180" /> -->
        <el-table-column prop="status" label="状态">
          <template #default="scope">
            <el-tag v-if="scope.row.status === 0" type="warning">审核中</el-tag>
            <el-tag v-else-if="scope.row.status === 1" type="success">已打款</el-tag>
            <el-tag v-else type="danger">已驳回</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <div v-if="scope.row.status === 0">
              <el-button type="success" size="small" @click="handleAudit(scope.row, 1)">通过</el-button>
              <el-button type="danger" size="small" @click="handleAudit(scope.row, 2)">驳回</el-button>
            </div>
            <span v-else style="color: #909399; font-size: 0.8rem;">
              {{ scope.row.statusDesc }}
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
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Refresh } from '@element-plus/icons-vue'
import { getWithdrawList, auditWithdraw } from '@/api/finance'
import { ElMessage, ElMessageBox } from 'element-plus'

const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = 10

const fetchData = async () => {
  loading.value = true
  try {
    // 后端分页参数为 current, size
    const res = await getWithdrawList({
      current: currentPage.value,
      size: pageSize
    })
    
    // 根据提供的响应结构: { code: 200, data: { records: [...], total: ... } }
    // request.js 拦截器通常会返回 res.data (或者直接返回 res 如果配置了)
    // 这里假设 request.js 返回的是 response.data 的内容
    
    // 如果拦截器直接解包了 data，那么 res 就是 { records: ..., total: ... }
    // 如果拦截器只解包了 http status，那么 res 可能是 { code: 200, data: { ... } }
    
    const data = res.records ? res : (res.data || {})
    
    if (data.records) {
        tableData.value = data.records
        total.value = data.total
    } else {
        tableData.value = []
        total.value = 0
    }
  } catch (error) {
    console.error('获取提现列表失败:', error)
  } finally {
    loading.value = false
  }
}

const handleAudit = (row, status) => {
  const actionText = status === 1 ? '通过' : '驳回'
  const isReject = status === 2
  
  if (isReject) {
      ElMessageBox.prompt('请输入驳回原因', '驳回申请', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /\S+/,
        inputErrorMessage: '驳回原因不能为空'
      }).then(async ({ value }) => {
        submitAudit(row, status, value)
      })
  } else {
      ElMessageBox.confirm(`确定${actionText}该提现申请吗？`, '审核确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        submitAudit(row, status)
      })
  }
}

const submitAudit = async (row, status, remark = '') => {
    try {
        // 构建请求参数，根据状态决定是否传递驳回原因
        const params = {
            id: row.id,
            status: status
        }

        // 只有驳回时才传递驳回原因
        if (status === 2 && remark) {
            params.auditMsg = remark
        }

        await auditWithdraw(params)
        ElMessage.success(status === 1 ? '审核通过，转账成功' : '已驳回申请')
        fetchData() // 刷新列表
    } catch (error) {
        console.error(error)
        ElMessage.error(error.response?.data?.message || '操作失败')
    }
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

:deep(.el-pagination) {
    --el-pagination-bg-color: transparent;
    --el-pagination-text-color: #fff;
    --el-pagination-button-color: rgba(255,255,255,0.1);
    --el-pagination-button-disabled-bg-color: transparent;
}
</style>
