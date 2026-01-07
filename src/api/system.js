import request from '@/utils/request'

// ================= 公开接口 (无需登录) =================

// 获取单个配置值
export function getPublicConfig(key) {
  return request({
    url: `/api/public/config/${key}`,
    method: 'get'
  })
}

// 批量获取配置值
export function getPublicConfigs(params) {
  return request({
    url: '/api/public/config',
    method: 'get',
    params // e.g. { keys: 'base_price,weather_rate' }
  })
}

// 获取公告列表 (公开)
export function getPublicNotices() {
  return request({
    url: '/api/public/notice/list',
    method: 'get'
  })
}

// 获取轮播图 (公开)
export function getPublicBanners() {
  return request({
    url: '/api/public/notice/banner',
    method: 'get'
  })
}

// ================= 系统配置管理 (管理员) =================

// 获取配置列表
export function getSysConfig() {
  return request({
    url: '/api/admin/config/list',
    method: 'get'
  })
}

// 更新配置
export function updateSysConfig(data) {
  return request({
    url: '/api/admin/config/update',
    method: 'put',
    data
  })
}

// ================= 公告管理 (管理员) =================

// 分页查询公告
export function getNoticePage(params) {
  return request({
    url: '/api/admin/notice/list',
    method: 'get',
    params
  })
}

// 创建公告
export function addNotice(data) {
  return request({
    url: '/api/admin/notice/create',
    method: 'post',
    data
  })
}

// 更新公告
export function updateNotice(data) {
  return request({
    url: '/api/admin/notice/update',
    method: 'put',
    data
  })
}

// 删除公告
export function deleteNotice(id) {
  return request({
    url: `/api/admin/notice/delete/${id}`,
    method: 'delete'
  })
}

// 更新公告状态
export function updateNoticeStatus(id, status) {
  return request({
    url: `/api/admin/notice/status/${id}`,
    method: 'put',
    params: { status }
  })
}
