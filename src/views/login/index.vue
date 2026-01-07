<template>
  <div class="login-container">
    <div class="animated-bg"></div>
    <div class="glass-card login-box" ref="loginBox">
      <div class="logo-section">
        <h1 class="gradient-text">CAMPUS RUNNER</h1>
        <p>管理员后台控制中心</p>
      </div>
      
      <el-form :model="loginForm" :rules="rules" ref="formRef" size="large">
        <el-form-item prop="username">
          <el-input 
            v-model="loginForm.username" 
            placeholder="用户名" 
            :prefix-icon="User"
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input 
            v-model="loginForm.password" 
            type="password" 
            placeholder="密码" 
            :prefix-icon="Lock"
            show-password
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="login-btn" :loading="loading" @click="handleLogin">
            进入系统
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { User, Lock } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import gsap from 'gsap'
import axios from 'axios'

const router = useRouter()
const loginBox = ref(null)
const formRef = ref(null)
const loading = ref(false)

const loginForm = ref({
  username: '',
  password: ''
})

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

onMounted(() => {
  // 入场动画
  gsap.from(loginBox.value, {
    duration: 1.2,
    y: 50,
    opacity: 0,
    ease: 'power3.out'
  })
})

const handleLogin = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.ref = true
      try {
        const res = await axios.post('http://localhost:9090/api/auth/login/admin', loginForm.value)
        if (res.data.code === 200) {
          ElMessage.success('登录成功')
          localStorage.setItem('token', res.data.data.token)
          router.push('/')
        } else {
          ElMessage.error(res.data.message || '登录失败')
        }
      } catch (error) {
        ElMessage.error('服务器连接失败，请检查后端服务是否启动')
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style lang="scss" scoped>
.login-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  position: relative;
  background: #0f0c29;
}

.animated-bg {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle at center, #6e45e2 0%, #88d3ce 30%, #0f0c29 70%);
  animation: rotate 20s linear infinite;
  opacity: 0.6;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.login-box {
  width: 400px;
  padding: 40px;
  z-index: 10;
  text-align: center;
  
  .logo-section {
    margin-bottom: 40px;
    h1 {
      font-size: 2.5rem;
      margin-bottom: 10px;
      letter-spacing: 2px;
    }
    p {
      color: rgba(255, 255, 255, 0.6);
      font-size: 0.9rem;
    }
  }
}

.login-btn {
  width: 100%;
  margin-top: 20px;
  height: 45px;
  font-size: 1.1rem;
}

:deep(.el-input__wrapper) {
  background: rgba(255, 255, 255, 0.05) !important;
  box-shadow: none !important;
  border: 1px solid rgba(255, 255, 255, 0.1);
  
  .el-input__inner {
    color: #fff !important;
    &::placeholder {
      color: rgba(255, 255, 255, 0.3);
    }
  }
}
</style>
