<template>
  <div class="user-manage-container">
    <div class="glass-card table-wrapper">
      <div class="table-header">
        <div class="header-left">
          <h3>用户管理</h3>
        </div>
        <div class="header-right">
          <el-button type="primary" :icon="Refresh" circle @click="fetchData" />
        </div>
      </div>

      <!-- 搜索栏 -->
      <div class="search-bar">
        <el-input
          v-model="queryParams.keyword"
          placeholder="搜索用户名/手机号/昵称"
          style="width: 200px"
          clearable
          @keyup.enter="handleSearch"
        />
        <el-select v-model="queryParams.role" placeholder="角色" clearable style="width: 120px">
          <el-option label="管理员" :value="0" />
          <el-option label="普通用户" :value="1" />
        </el-select>
        <el-select v-model="queryParams.isRider" placeholder="骑手身份" clearable style="width: 120px">
          <el-option label="是" :value="1" />
          <el-option label="否" :value="0" />
        </el-select>
        <el-select v-model="queryParams.status" placeholder="状态" clearable style="width: 120px">
          <el-option label="正常" :value="1" />
          <el-option label="封号" :value="0" />
        </el-select>
        <el-select v-model="queryParams.gender" placeholder="性别" clearable style="width: 100px">
          <el-option label="男" :value="1" />
          <el-option label="女" :value="2" />
          <el-option label="保密" :value="0" />
        </el-select>
        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button @click="resetQuery">重置</el-button>
      </div>

      <!-- 批量操作 -->
      <div class="batch-bar" v-if="selectedRows.length > 0">
        <el-button type="danger" size="small" @click="handleBatchOperation('ban')">批量封号</el-button>
        <el-button type="success" size="small" @click="handleBatchOperation('unban')">批量解封</el-button>
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
        <el-table-column label="用户" width="180">
          <template #default="scope">
            <div class="user-cell">
              <el-avatar :size="30" :src="scope.row.avatar || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'" />
              <div class="user-info">
                <div class="nickname">{{ scope.row.nickname }}</div>
                <div class="username">{{ scope.row.username }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="phone" label="手机号" width="120" />
        <el-table-column label="性别" width="80">
          <template #default="scope">
            <el-tag size="small" :type="scope.row.gender === 1 ? '' : (scope.row.gender === 2 ? 'danger' : 'info')">
              {{ scope.row.gender === 1 ? '男' : (scope.row.gender === 2 ? '女' : '保密') }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="角色" width="150">
          <template #default="scope">
            <div class="role-tags">
              <el-tag size="small" effect="plain">{{ scope.row.role === 0 ? '管理员' : '用户' }}</el-tag>
              <el-tag v-if="scope.row.isRider === 1" size="small" type="warning">骑手</el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="scope">
            <el-switch
              v-model="scope.row.status"
              :active-value="1"
              :inactive-value="0"
              @change="(val) => handleStatusChange(val, scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="注册时间" min-width="180" />
        <el-table-column label="操作" fixed="right" width="150">
          <template #default="scope">
            <el-button type="primary" link @click="handleDetail(scope.row)">详情</el-button>
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
    <el-dialog v-model="detailVisible" title="用户详情" width="600px" class="glass-dialog">
      <div v-if="currentUser" class="detail-content">
        <div class="detail-header">
          <el-avatar :size="60" :src="currentUser.avatar" />
          <div class="detail-basic">
            <h3>{{ currentUser.nickname }}</h3>
          </div>
        </div>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="用户名">{{ currentUser.username }}</el-descriptions-item>
          <el-descriptions-item label="手机号">{{ currentUser.phone }}</el-descriptions-item>
          <el-descriptions-item label="性别">{{ currentUser.gender === 1 ? '男' : (currentUser.gender === 2 ? '女' : '保密') }}</el-descriptions-item>
          <el-descriptions-item label="注册时间">{{ currentUser.createTime }}</el-descriptions-item>
          <el-descriptions-item label="角色">{{ currentUser.role === 0 ? '管理员' : '普通用户' }}</el-descriptions-item>
          <el-descriptions-item label="骑手身份">{{ currentUser.isRider === 1 ? '是' : '否' }}</el-descriptions-item>
          <el-descriptions-item label="订单总数">{{ currentUser.orderCount || 0 }}</el-descriptions-item>
          <el-descriptions-item label="消费总额">￥{{ currentUser.totalSpend || 0 }}</el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { Refresh } from '@element-plus/icons-vue'
import { getUserList, getUserDetail, updateUserStatus, batchUserOperation } from '@/api/user'
import { ElMessage, ElMessageBox } from 'element-plus'

const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const selectedRows = ref([])
const detailVisible = ref(false)
const currentUser = ref(null)

const queryParams = reactive({
  current: 1,
  size: 10,
  keyword: '',
  role: null,
  isRider: null,
  status: null,
  gender: null
})

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getUserList(queryParams)
    // 过滤掉管理员 (role === 0)
    tableData.value = res.data.records.filter(user => user.role !== 0)
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
  queryParams.role = null
  queryParams.isRider = null
  queryParams.status = null
  queryParams.gender = null
  handleSearch()
}

const handleSelectionChange = (val) => {
  selectedRows.value = val
}

const handleStatusChange = async (newStatus, row) => {
  const actionText = newStatus === 0 ? '封号' : '解封'
  
  try {
    if (newStatus === 0) {
      // 封号需要输入原因
      const { value: reason } = await ElMessageBox.prompt('请输入封号原因', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /\S+/,
        inputErrorMessage: '原因不能为空'
      })
      
      await updateUserStatus({ userId: row.id, status: 0, reason })
    } else {
      await updateUserStatus({ userId: row.id, status: 1 })
    }
    
    ElMessage.success(`${actionText}成功`)
  } catch (error) {
    // 恢复状态
    row.status = newStatus === 0 ? 1 : 0
    if (error !== 'cancel') {
      console.error(error)
    }
  }
}

const handleBatchOperation = (operation) => {
  const userIds = selectedRows.value.map(row => row.id)
  const actionText = operation === 'ban' ? '批量封号' : '批量解封'

  ElMessageBox.confirm(`确定要对选中的 ${userIds.length} 个用户进行${actionText}操作吗？`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    let reason = ''
    if (operation === 'ban') {
       const { value } = await ElMessageBox.prompt('请输入批量封号原因', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /\S+/,
        inputErrorMessage: '原因不能为空'
      })
      reason = value
    }

    await batchUserOperation({ userIds, operation, reason })
    ElMessage.success('操作成功')
    fetchData()
    selectedRows.value = []
  }).catch(() => {})
}

const handleDetail = async (row) => {
  try {
    const res = await getUserDetail(row.id)
    currentUser.value = res.data
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
.user-manage-container {
  // 复用 audit.vue 的一些样式思路
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

  .role-tags {
    display: flex;
    align-items: center;
    gap: 5px;
  }

  .pagination-wrapper {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}

// 详情样式
.detail-content {
  .detail-header {
    display: flex;
    align-items: center;
    gap: 20px;
    margin-bottom: 20px;
    .detail-basic {
      h3 { margin: 0 0 5px 0; }
      p { margin: 0; color: rgba(0, 0, 0, 0.6); }
    }
  }
}

// 适配暗色表格样式 (复用)
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
