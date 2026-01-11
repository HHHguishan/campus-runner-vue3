import request from '@/utils/request'

// 获取订单列表（管理员）
export function getOrderList(params) {
  return request({
    url: '/api/order/list',
    method: 'get',
    params // { page, size, status, serviceType }
  })
}

// 获取订单详情
export function getOrderDetail(orderId) {
  return request({
    url: `/api/order/${orderId}`,
    method: 'get'
  })
}

// 取消订单（管理员人工干预）
export function cancelOrder(data) {
  return request({
    url: '/api/order/cancel',
    method: 'put',
    data // { orderId, cancelReason }
  })
}

// 完成订单
export function finishOrder(data) {
  return request({
    url: '/api/order/finish',
    method: 'put',
    data // { orderId, finishRemark }
  })
}

// 获取订单统计
export function getOrderStatistics() {
  return request({
    url: '/api/order/statistics',
    method: 'get'
  })
}
