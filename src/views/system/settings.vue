<template>
  <div class="system-container">
    <el-row :gutter="20">
      <el-col :span="12">
        <div class="glass-card config-card">
          <h3><el-icon><Money /></el-icon> 运费与平台设置</h3>
          <p class="desc">动态调整系统关键参数，无需重启服务，即时生效。</p>
          
          <el-form :model="configForm" label-width="140px" class="mt-20">
            <el-form-item label="起步价 (元)">
              <el-input-number v-model="configForm.base_price" :precision="2" :step="0.5" :min="0" />
              <span class="info-text">基础配送费用</span>
            </el-form-item>
            
            <el-form-item label="里程费 (元/km)">
              <el-input-number v-model="configForm.per_km_price" :precision="2" :step="0.1" :min="0" />
              <span class="info-text">超出起步距离后的单价</span>
            </el-form-item>
            
            <el-form-item label="恶劣天气加价 (元)">
              <el-input-number v-model="configForm.weather_rate" :precision="2" :step="1" :min="0" />
              <span class="info-text">设置为 0 代表关闭加价</span>
            </el-form-item>
            
            <el-form-item label="平台抽成比例 (%)">
              <el-input-number v-model="configForm.platform_rate" :precision="1" :step="1" :min="0" :max="100" />
              <span class="info-text">骑手收益将扣除此比例</span>
            </el-form-item>
          </el-form>
          
          <div class="card-footer">
             <el-button type="primary" :loading="loading" @click="handleSave">保存配置</el-button>
             <el-button @click="resetConfig">重置</el-button>
          </div>
        </div>
      </el-col>
      
      <el-col :span="12">
        <!-- 预留或放置其他配置 -->
        <div class="glass-card config-card info-panel">
            <h3><el-icon><InfoFilled /></el-icon> 配置说明</h3>
            <div class="info-content">
                <p><strong>起步价</strong>：订单的基础起送费用。</p>
                <p><strong>里程费</strong>：每公里增加的配送费，系统会自动计算距离。</p>
                <p><strong>天气加价</strong>：用于雨雪天气，直接附加在订单总额上，激励骑手接单。</p>
                <p><strong>抽成比例</strong>：例如设置为 10%，则 10 元运费中平台收取 1 元，骑手得 9 元。</p>
            </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Money, InfoFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getSysConfig, updateSysConfig } from '@/api/system'

const loading = ref(false)
// 对应 ConfigUpdateDTO 和 SysConfig 实体
const configForm = ref({
  base_price: 5.0,
  per_km_price: 2.0,
  weather_rate: 0.0,
  platform_rate: 10.0 // 前端显示百分比，后端可能存储 0.1
})

const fetchData = async () => {
  try {
    const res = await getSysConfig()
    const data = res.data
    
    if (Array.isArray(data)) {
      // Handle list response: [{ paramKey: 'base_price', paramValue: '5.0' }, ...]
      data.forEach(item => {
        const key = item.paramKey || item.key
        const val = item.paramValue || item.value
        
        if (key === 'base_price') configForm.value.base_price = Number(val)
        if (key === 'per_km_price') configForm.value.per_km_price = Number(val)
        if (key === 'weather_rate') configForm.value.weather_rate = Number(val)
        if (key === 'platform_rate') configForm.value.platform_rate = Number(val) * 100
      })
    }
  } catch (error) {
    console.error('获取配置失败', error)
  }
}

const handleSave = async () => {
  loading.value = true
  try {
    // 后端接口只支持单条更新，需要遍历提交
    // 映射表：前端字段 -> 后端 paramKey
    const fieldMap = {
      base_price: 'base_price',
      per_km_price: 'per_km_price',
      weather_rate: 'weather_rate',
      platform_rate: 'platform_rate'
    }

    const promises = Object.keys(fieldMap).map(field => {
      let value = configForm.value[field]
      // 特殊处理百分比
      if (field === 'platform_rate') {
        value = value / 100
      }
      
      const payload = {
        paramKey: fieldMap[field],
        paramValue: value.toString(),
        remark: getRemark(field)
      }
      return updateSysConfig(payload)
    })

    await Promise.all(promises)
    
    ElMessage.success('系统配置已更新')
    loading.value = false
    // 刷新数据以确保同步
    fetchData()
  } catch (error) {
    console.error(error)
    loading.value = false
  }
}

const getRemark = (field) => {
  const map = {
    base_price: '起步价(元)',
    per_km_price: '每公里加价(元)',
    weather_rate: '恶劣天气加价(元)',
    platform_rate: '平台抽成比例(0-1)'
  }
  return map[field] || ''
}

const resetConfig = () => {
  fetchData() // 重新从后端获取最新值
  ElMessage.info('已重置为服务器端配置')
}

onMounted(() => {
  fetchData()
})
</script>

<style lang="scss" scoped>
.mt-20 { margin-top: 20px; }

.config-card {
  padding: 30px;
  min-height: 400px;
  display: flex;
  flex-direction: column;
  
  h3 {
    margin: 0 0 10px 0;
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 1.2rem;
    color: #fff;
  }
  
  .desc {
      color: rgba(255,255,255,0.6);
      font-size: 0.9rem;
      margin-bottom: 30px;
  }
}

.info-text {
  margin-left: 15px;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.4);
}

.card-footer {
    margin-top: auto;
    padding-top: 30px;
    border-top: 1px solid rgba(255,255,255,0.1);
}

.info-panel {
    .info-content {
        margin-top: 20px;
        p {
            color: rgba(255,255,255,0.7);
            line-height: 1.8;
            font-size: 0.95rem;
            margin-bottom: 15px;
            
            strong {
                color: #409EFF;
                margin-right: 5px;
            }
        }
    }
}

:deep(.el-form-item__label) {
  color: rgba(255, 255, 255, 0.9);
}

:deep(.el-input__wrapper) {
  background: rgba(255, 255, 255, 0.05) !important;
  box-shadow: none !important;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #fff !important;
}
</style>