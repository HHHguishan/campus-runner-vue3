import request from '@/utils/request'

// 1. 用户列表查询
export function getUserList(params) {
  return request({
    url: '/api/admin/user/list',
    method: 'get',
    params
  })
}

// 2. 用户详情查询
export function getUserDetail(userId) {
  return request({
    url: `/api/admin/user/${userId}`,
    method: 'get'
  })
}

// 3. 用户状态管理
export function updateUserStatus(data) {
  return request({
    url: '/api/admin/user/status',
    method: 'put',
    data
  })
}

// 4. 批量操作用户
export function batchUserOperation(data) {
  return request({
    url: '/api/admin/user/batch',
    method: 'post',
    data
  })
}
