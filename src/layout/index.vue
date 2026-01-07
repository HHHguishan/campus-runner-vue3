<template>
  <el-container class="layout-container">
    <el-aside width="240px" class="aside">
      <div class="logo">
        <h2 class="gradient-text">CR Admin</h2>
      </div>
      <el-menu
        active-text-color="#6e45e2"
        background-color="transparent"
        class="el-menu-vertical"
        :default-active="route.path"
        text-color="#fff"
        router
      >
        <el-menu-item index="/dashboard">
          <el-icon><Menu /></el-icon>
          <span>控制台仪表盘</span>
        </el-menu-item>
        <el-menu-item index="/rider/audit">
          <el-icon><Stamp /></el-icon>
          <span>骑手审核管理</span>
        </el-menu-item>
        <el-menu-item index="/rider/logs">
          <el-icon><Document /></el-icon>
          <span>AI 拦截日志</span>
        </el-menu-item>
        <el-menu-item index="/order/manage">
          <el-icon><List /></el-icon>
          <span>订单监管中心</span>
        </el-menu-item>
        <el-menu-item index="/finance/withdrawal">
          <el-icon><Money /></el-icon>
          <span>财务提现管理</span>
        </el-menu-item>
        <el-menu-item index="/system/notice">
          <el-icon><Notification /></el-icon>
          <span>公告轮播管理</span>
        </el-menu-item>
        <el-menu-item index="/system/settings">
          <el-icon><Setting /></el-icon>
          <span>系统参数设置</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    
    <el-container>
      <el-header class="header glass-card">
        <div class="header-left">
          <span class="page-title">{{ route.meta.title }}</span>
        </div>
        <div class="header-right">
          <el-dropdown>
            <div class="user-info">
              <el-avatar :size="32" src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />
              <span class="username">Admin User</span>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="handleLogout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      
      <el-main class="main-content">
        <router-view v-slot="{ Component }">
          <transition name="fade-transform" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import { Menu, Stamp, User, List, Money, Setting, Document, Notification } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

const handleLogout = () => {
  localStorage.removeItem('token')
  router.push('/login')
}
</script>

<style lang="scss" scoped>
.layout-container {
  height: 100vh;
  background: #0f0c29;
}

.aside {
  background: rgba(255, 255, 255, 0.02);
  border-right: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  flex-direction: column;
  
  .logo {
    padding: 30px 20px;
    text-align: center;
    h2 {
      margin: 0;
      font-size: 1.8rem;
      letter-spacing: 1px;
    }
  }
}

.el-menu {
  border-right: none;
  padding: 10px;
}

.el-menu-item {
  border-radius: 8px;
  margin-bottom: 5px;
  
  &:hover {
    background: rgba(110, 69, 226, 0.1) !important;
  }
  
  &.is-active {
    background: rgba(110, 69, 226, 0.15) !important;
    font-weight: bold;
  }
}

.header {
  height: 64px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 30px;
  margin: 15px;
  border-radius: 12px;
  
  .page-title {
    font-size: 1.1rem;
    font-weight: 500;
  }
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  gap: 10px;
  .username {
    font-size: 0.9rem;
    color: rgba(255, 255, 255, 0.8);
  }
}

.main-content {
  padding: 15px 30px;
}

/* 页面切换动画 */
.fade-transform-enter-active,
.fade-transform-leave-active {
  transition: all 0.5s;
}

.fade-transform-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
