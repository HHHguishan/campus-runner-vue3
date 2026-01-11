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
      
      <el-tabs v-model="activeTab" @tab-change="handleTabChange" class="custom-tabs">
        <el-tab-pane label="异常订单" name="abnormal" />
        <el-tab-pane label="进行中" name="ongoing" />
        <el-tab-pane label="历史订单" name="history" />
      </el-tabs>

      <el-table :data="tableData" v-loading="loading" style="width: 100%; background: transparent;">
        <el-table-column prop="orderNo" label="订单号" width="180" />
        <el-table-column prop="typeDesc" label="订单类型" width="100" />
        <el-table-column prop="status" label="状态" width="100">
           <template #default="scope">
            <el-tag :type="getStatusTag(scope.row.status).type">
              {{ getStatusTag(scope.row.status).text }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="runnerId" label="接单骑手">
          <template #default="scope">
            {{ scope.row.runnerId ? 'ID: ' + scope.row.runnerId : '暂未接单' }}
          </template>
        </el-table-column>
        <el-table-column prop="userId" label="下单用户">
          <template #default="scope">
            {{ scope.row.userId ? 'ID: ' + scope.row.userId : '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="totalFee" label="金额">
            <template #default="scope">¥ {{ scope.row.totalFee }}</template>
        </el-table-column>
        <el-table-column prop="createTime" label="下单时间" width="160" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="scope">
            <el-button type="primary" link size="small" @click="viewDetail(scope.row)">详情</el-button>
            <el-button
              v-if="scope.row.status === 1 || scope.row.status === 2"
              type="danger"
              link
              size="small"
              @click="handleIntervene(scope.row)">
              人工干预
            </el-button>
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
    <el-drawer v-model="drawerVisible" title="订单详情" size="45%" class="glass-drawer">
      <div v-if="currentOrder" v-loading="detailLoading" class="order-detail">
        <!-- 紧凑的信息列表 -->
        <div class="compact-list">
          <!-- 订单号和状态 -->
          <div class="list-item header-item">
            <div class="item-content">
              <div class="item-label">订单号</div>
              <div class="item-value order-no">{{ currentOrder.orderNo }}</div>
            </div>
            <el-tag :type="getStatusTag(currentOrder.status).type" size="small" effect="dark">
              {{ getStatusTag(currentOrder.status).text }}
            </el-tag>
          </div>

          <!-- 基础信息 -->
          <div class="list-section">
            <div class="section-title">基础信息</div>
            <div class="list-item">
              <span class="field-label">订单类型</span>
              <el-tag :type="currentOrder.type === 1 ? 'success' : currentOrder.type === 2 ? 'primary' : 'warning'" size="small">
                {{ currentOrder.typeDesc || '未知' }}
              </el-tag>
            </div>
            <div class="list-item">
              <span class="field-label">下单时间</span>
              <span class="field-value">{{ currentOrder.createTime }}</span>
            </div>
            <div class="list-item" v-if="currentOrder.weight">
              <span class="field-label">物品重量</span>
              <span class="field-value">{{ currentOrder.weight }} kg</span>
            </div>
            <div class="list-item full-width" v-if="currentOrder.goodsDesc">
              <span class="field-label">物品描述</span>
              <span class="field-value">{{ currentOrder.goodsDesc }}</span>
            </div>
          </div>

          <!-- 人员信息 -->
          <div class="list-section">
            <div class="section-title">人员信息</div>
            <div class="list-item" v-if="currentOrder.userId">
              <span class="field-label">下单用户</span>
              <span class="field-value">ID: {{ currentOrder.userId }}</span>
            </div>
            <div class="list-item" v-if="currentOrder.runnerId">
              <span class="field-label">接单骑手</span>
              <span class="field-value">ID: {{ currentOrder.runnerId }}</span>
            </div>
            <div class="list-item" v-if="currentOrder.contactName">
              <span class="field-label">收货人</span>
              <span class="field-value">{{ currentOrder.contactName }}</span>
            </div>
            <div class="list-item" v-if="currentOrder.contactPhone">
              <span class="field-label">联系电话</span>
              <span class="field-value">{{ currentOrder.contactPhone }}</span>
            </div>
          </div>

          <!-- 配送信息 -->
          <div class="list-section">
            <div class="section-title">配送信息</div>
            <div class="list-item full-width">
              <span class="field-label">取件地址</span>
              <span class="field-value">{{ currentOrder.pickupAddr || '未填写' }}</span>
            </div>
            <div class="list-item full-width">
              <span class="field-label">送达地址</span>
              <span class="field-value">{{ currentOrder.deliveryAddr || '未填写' }}</span>
            </div>
          </div>

          <!-- 费用信息 -->
          <div class="list-section highlight">
            <div class="section-title">费用信息</div>
            <div class="list-item">
              <span class="field-label">总金额</span>
              <span class="field-value price">¥{{ currentOrder.totalFee }}</span>
            </div>
            <div class="list-item" v-if="currentOrder.distance">
              <span class="field-label">配送距离</span>
              <span class="field-value">{{ currentOrder.distance }} km</span>
            </div>
            <div class="list-item" v-if="currentOrder.deliveryFee">
              <span class="field-label">配送费</span>
              <span class="field-value">¥{{ currentOrder.deliveryFee }}</span>
            </div>
          </div>

          <!-- 备注信息 -->
          <div class="list-section" v-if="currentOrder.remark">
            <div class="section-title">备注信息</div>
            <div class="remark-box">{{ currentOrder.remark }}</div>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="detail-actions" v-if="currentOrder.status === 1 || currentOrder.status === 2">
          <el-button type="danger" @click="handleIntervene(currentOrder)" style="width: 100%;">
            强制取消订单
          </el-button>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getOrderList, getOrderDetail, cancelOrder } from '@/api/order'

const loading = ref(false)
const tableData = ref([])
const activeTab = ref('ongoing')
const searchKeyword = ref('')
const total = ref(0)
const currentPage = ref(1)
const pageSize = 10
const drawerVisible = ref(false)
const currentOrder = ref(null)
const detailLoading = ref(false)

// 订单状态映射
const statusMap = {
  0: { text: '待支付', type: 'info' },
  1: { text: '待接单', type: 'warning' },
  2: { text: '配送中', type: 'primary' },
  3: { text: '已完成', type: 'success' },
  4: { text: '已取消', type: 'danger' },
  5: { text: '退款中', type: 'warning' }
}

// 根据tab计算状态筛选
const statusFilter = computed(() => {
  switch (activeTab.value) {
    case 'abnormal':
      return null // 异常订单可能需要特殊处理
    case 'ongoing':
      return 1 // 只查待接单(配送中的订单在骑手那里)
    case 'history':
      return 3 // 只查已完成
    default:
      return null
  }
})

// Tab切换时重置页码并重新获取数据
const handleTabChange = () => {
  currentPage.value = 1 // 重置到第一页
  fetchData()
}

const fetchData = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      size: pageSize
    }

    // 添加状态筛选
    if (statusFilter.value !== null && statusFilter.value !== undefined) {
      params.status = statusFilter.value
    }

    console.log('请求参数:', params) // 调试日志

    const res = await getOrderList(params)

    console.log('响应数据:', res) // 调试日志

    // 处理响应数据 - 响应拦截器已经返回 res.data
    // 后端返回格式: { code: 200, data: { records: [], total: 100, current: 1, size: 10 } }
    if (res.data && res.data.records) {
      tableData.value = res.data.records
      total.value = res.data.total || 0
    } else {
      console.warn('响应数据格式异常:', res)
      tableData.value = []
      total.value = 0
    }
  } catch (error) {
    console.error('获取订单列表失败:', error)
    ElMessage.error('获取订单列表失败')
  } finally {
    loading.value = false
  }
}

const viewDetail = async (row) => {
  detailLoading.value = true
  drawerVisible.value = true
  currentOrder.value = row // 先显示基本信息

  try {
    const res = await getOrderDetail(row.id)
    currentOrder.value = res.data || res
  } catch (error) {
    console.error('获取订单详情失败:', error)
    ElMessage.error('获取订单详情失败')
  } finally {
    detailLoading.value = false
  }
}

const handleIntervene = (row) => {
    ElMessageBox.prompt('请输入取消原因', '人工干预 - 取消订单', {
        confirmButtonText: '确定取消',
        cancelButtonText: '暂不处理',
        type: 'warning',
        inputPattern: /\S+/,
        inputErrorMessage: '取消原因不能为空'
    }).then(async ({ value }) => {
        try {
            await cancelOrder({
                orderId: row.id,
                cancelReason: value
            })
            ElMessage.success('订单已取消')
            drawerVisible.value = false
            fetchData()
        } catch (error) {
            console.error('取消订单失败:', error)
            ElMessage.error(error.response?.data?.message || '取消订单失败')
        }
    })
}

// 获取订单状态标签
const getStatusTag = (status) => {
  const statusInfo = statusMap[status] || { text: '未知', type: 'info' }
  return { ...statusInfo }
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
  --el-table-row-hover-bg-color: rgba(64, 158, 255, 0.15);

  th.el-table__cell {
    background-color: var(--el-table-header-bg-color) !important;
  }

  /* 优化 hover 效果 - 使用更强的选择器 */
  .el-table__body tr:hover > td {
    background-color: rgba(64, 158, 255, 0.15) !important;
  }

  .el-table__body tr:hover > td .cell {
    color: #fff !important;
  }

  .el-table__body tr:hover > td .el-tag {
    border-color: rgba(255, 255, 255, 0.3) !important;
  }

  /* 当前行高亮样式 */
  .el-table__body tr.current-row > td {
    background-color: rgba(64, 158, 255, 0.2) !important;
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
}
:deep(.el-tabs__item) {
    color: rgba(255,255,255,0.7);
    &.is-active { color: #409EFF; }
}

/* 订单详情 - 紧凑列表样式 */
.order-detail {
  padding: 16px;
}

.compact-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 列表区块 */
.list-section {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);

  &.highlight {
    background: rgba(103, 194, 58, 0.1);
    border-color: rgba(103, 194, 58, 0.3);
  }

  .section-title {
    font-size: 14px;
    font-weight: 600;
    color: #fff;
    margin-bottom: 10px;
    padding-bottom: 8px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }
}

/* 列表项 */
.list-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
  min-height: 36px;

  &.full-width {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }

  &.header-item {
    background: rgba(64, 158, 255, 0.15);
    padding: 12px;
    border-radius: 8px;
    border: 1px solid rgba(64, 158, 255, 0.3);
  }

  .field-label {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.6);
    min-width: 70px;
    flex-shrink: 0;
  }

  .field-value {
    font-size: 14px;
    color: #fff;
    font-weight: 500;
    text-align: right;
    flex: 1;

    &.price {
      font-size: 18px;
      font-weight: bold;
      color: #67c23a;
    }
  }

  .item-content {
    flex: 1;

    .item-label {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.5);
      margin-bottom: 4px;
    }

    .item-value {
      font-size: 16px;
      font-weight: bold;
      color: #fff;

      &.order-no {
        font-family: 'Courier New', monospace;
        font-size: 15px;
      }
    }
  }
}

/* 备注框 */
.remark-box {
  padding: 10px;
  background: rgba(230, 162, 60, 0.1);
  border-left: 3px solid #E6A23C;
  border-radius: 4px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.85);
  line-height: 1.6;
}

/* 操作按钮 */
.detail-actions {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

/* Drawer 样式 */
:deep(.glass-drawer) {
  .el-drawer__header {
    margin-bottom: 0;
    padding: 16px 20px;
    background: rgba(0, 0, 0, 0.3);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);

    .el-drawer__title {
      font-size: 16px;
      font-weight: bold;
      color: #fff;
    }
  }

  .el-drawer__body {
    padding: 0;
    background: rgba(0, 0, 0, 0.2);
  }
}
</style>
