import request from '@/utils/request'

// 获取提现申请列表
export function getWithdrawList(params) {
  return request({
    url: '/api/admin/withdraw/list',
    method: 'get',
    params // expected: { current, size, status }
  })
}

// 审核提现 (通过/驳回)
// status: 1 通过, 2 驳回
export function auditWithdraw(data) {
  return request({
    url: '/api/admin/withdraw/audit',
    method: 'post',
    data // { id: 1, status: 1, remark: '...' }
  })
}