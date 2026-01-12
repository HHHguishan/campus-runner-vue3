import request from '@/utils/request'

// 5. 骑手列表查询
export function getRiderList(params) {
  return request({
    url: '/api/admin/runner/list',
    method: 'get',
    params
  })
}

// 6. 骑手详情查询
export function getRiderDetail(runnerId) {
  return request({
    url: `/api/admin/runner/${runnerId}`,
    method: 'get'
  })
}

// 7. 骑手状态管理
export function updateRiderStatus(data) {
  return request({
    url: '/api/admin/runner/status',
    method: 'put',
    data
  })
}

// 8. 批量操作骑手
export function batchRiderOperation(data) {
  return request({
    url: '/api/admin/runner/batch',
    method: 'post',
    data
  })
}
