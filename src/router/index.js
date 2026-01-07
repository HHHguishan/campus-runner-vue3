import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/login/index.vue'),
    meta: { title: '登录 - 管理系统' }
  },
  {
    path: '/',
    component: () => import('../layout/index.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('../views/dashboard/index.vue'),
        meta: { title: '控制台' }
      },
      {
        path: 'rider/audit',
        name: 'RiderAudit',
        component: () => import('../views/rider/audit.vue'),
        meta: { title: '骑手审核' }
      },
      {
        path: 'rider/logs',
        name: 'RiderLogs',
        component: () => import('../views/rider/ai-logs.vue'),
        meta: { title: 'AI 拦截日志' }
      },
      {
        path: 'order/manage',
        name: 'OrderManage',
        component: () => import('../views/order/manage.vue'),
        meta: { title: '订单监管' }
      },
      {
        path: 'finance/withdrawal',
        name: 'FinanceWithdrawal',
        component: () => import('../views/finance/withdrawal.vue'),
        meta: { title: '提现管理' }
      },
      {
        path: 'system/settings',
        name: 'SystemSettings',
        component: () => import('../views/system/settings.vue'),
        meta: { title: '系统设置' }
      },
      {
        path: 'system/notice',
        name: 'SystemNotice',
        component: () => import('../views/system/notice.vue'),
        meta: { title: '公告管理' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  document.title = to.meta.title || '校园配送管理系统'
  const token = localStorage.getItem('token')
  if (to.path !== '/login' && !token) {
    next('/login')
  } else {
    next()
  }
})

export default router
