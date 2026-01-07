<template>
  <div class="notice-container">
    <div class="glass-card table-wrapper">
      <div class="table-header">
        <h3>公告与轮播管理</h3>
        <el-button type="primary" :icon="Plus" @click="handleAdd">新增内容</el-button>
      </div>
      
      <el-tabs v-model="activeType" @tab-click="fetchData" class="custom-tabs">
        <el-tab-pane label="全部" name="0" />
        <el-tab-pane label="系统公告" name="1" />
        <el-tab-pane label="轮播图" name="2" />
      </el-tabs>

      <el-table :data="tableData" v-loading="loading" style="width: 100%; background: transparent;">
        <el-table-column prop="title" label="标题" width="200" show-overflow-tooltip />
        <el-table-column label="类型" width="100">
           <template #default="scope">
            <el-tag v-if="scope.row.type === 1" type="warning" effect="dark">公告</el-tag>
            <el-tag v-else type="success" effect="dark">轮播图</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="图片预览" width="120">
            <template #default="scope">
                <el-image 
                    v-if="scope.row.imgUrl" 
                    :src="scope.row.imgUrl" 
                    :preview-src-list="[scope.row.imgUrl]"
                    fit="cover"
                    style="width: 50px; height: 50px; border-radius: 4px;"
                />
                <span v-else style="color: #909399;">无图</span>
            </template>
        </el-table-column>
        <el-table-column prop="sort" label="排序" width="80" sortable />
        <el-table-column prop="status" label="状态" width="100">
            <template #default="scope">
                <el-switch 
                    v-model="scope.row.status" 
                    :active-value="1" 
                    :inactive-value="0"
                    inline-prompt
                    active-text="显示"
                    inactive-text="隐藏"
                    @change="handleStatusChange(scope.row)"
                />
            </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="150">
          <template #default="scope">
            <el-button type="primary" link size="small" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button type="danger" link size="small" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      
       <div class="pagination-wrapper">
        <el-pagination 
          background 
          layout="total, prev, pager, next" 
          :total="total" 
          :page-size="pageSize"
          v-model:current-page="currentPage"
          @current-change="fetchData"
        />
      </div>
    </div>

    <!-- 新增/编辑对话框 -->
    <el-dialog 
        v-model="dialogVisible" 
        :title="form.id ? '编辑内容' : '新增内容'" 
        width="500px" 
        class="glass-dialog"
    >
      <el-form :model="form" ref="formRef" :rules="rules" label-width="80px">
          <el-form-item label="类型" prop="type">
              <el-radio-group v-model="form.type">
                  <el-radio :label="1">系统公告</el-radio>
                  <el-radio :label="2">首页轮播图</el-radio>
              </el-radio-group>
          </el-form-item>
          <el-form-item label="标题" prop="title">
              <el-input v-model="form.title" placeholder="请输入标题" />
          </el-form-item>
          <el-form-item label="内容" prop="content" v-if="form.type === 1">
              <el-input v-model="form.content" type="textarea" :rows="4" placeholder="请输入公告详细内容" />
          </el-form-item>
          <el-form-item label="图片URL" prop="imgUrl">
              <el-input v-model="form.imgUrl" placeholder="输入图片链接或后续对接上传" />
              <!-- 这里实际项目中应使用上传组件 -->
          </el-form-item>
          <el-form-item label="排序" prop="sort">
              <el-input-number v-model="form.sort" :min="0" :max="999" />
          </el-form-item>
          <el-form-item label="状态" prop="status">
               <el-switch v-model="form.status" :active-value="1" :inactive-value="0" active-text="立即发布" />
          </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const loading = ref(false)
const tableData = ref([])
const activeType = ref('0')
const total = ref(0)
const currentPage = ref(1)
const pageSize = 10
const dialogVisible = ref(false)
const formRef = ref(null)

// 对应 NoticeCreateDTO/UpdateDTO
const form = ref({
    id: undefined,
    title: '',
    content: '',
    imgUrl: '',
    type: 1,
    sort: 0,
    status: 1
})

const rules = {
    title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
    type: [{ required: true, message: '请选择类型', trigger: 'change' }]
}

const fetchData = async () => {
  loading.value = true
  // Mock data
  setTimeout(() => {
    let mockList = [
        { id: 1, title: '春节期间配送费调整通知', content: '春节期间每单加价3元...', imgUrl: '', type: 1, sort: 10, status: 1, createTime: '2026-01-05 10:00:00' },
        { id: 2, title: '新用户注册立减活动', content: '', imgUrl: 'https://via.placeholder.com/300x150?text=Banner', type: 2, sort: 1, status: 1, createTime: '2026-01-06 12:00:00' }
    ]
    
    // 简单模拟筛选
    if (activeType.value !== '0') {
        mockList = mockList.filter(item => item.type === parseInt(activeType.value))
    }
    
    tableData.value = mockList
    total.value = mockList.length
    loading.value = false
  }, 500)
}

const handleAdd = () => {
    form.value = { id: undefined, title: '', content: '', imgUrl: '', type: 1, sort: 0, status: 1 }
    dialogVisible.value = true
}

const handleEdit = (row) => {
    form.value = { ...row } // Copy row data
    dialogVisible.value = true
}

const handleDelete = (row) => {
    ElMessageBox.confirm('确定要删除这条记录吗？', '提示', {
        type: 'warning'
    }).then(() => {
        ElMessage.success('删除成功')
        fetchData()
    })
}

const handleStatusChange = (row) => {
    ElMessage.success(`状态已更新为: ${row.status === 1 ? '显示' : '隐藏'}`)
    // 实际需调用 API: POST /api/admin/notice/update
}

const handleSubmit = async () => {
    if (!formRef.value) return
    await formRef.value.validate((valid) => {
        if (valid) {
            // 实际需调用 API: POST /api/admin/notice/create 或 update
            ElMessage.success(form.value.id ? '更新成功' : '发布成功')
            dialogVisible.value = false
            fetchData()
        }
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

:deep(.el-tabs__item) {
    color: rgba(255,255,255,0.7);
    &.is-active { color: #409EFF; }
}
</style>
