import request from '@/utils/request'

/**
 * 获取首页数据看板统计
 */
export function getDashboardStats() {
    return request({
        url: '/api/admin/statistics',
        method: 'get'
    })
}
