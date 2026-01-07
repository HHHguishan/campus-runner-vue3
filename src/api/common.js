import request from '@/utils/request'

// 通用上传接口
export function uploadFile(file) {
  const formData = new FormData()
  formData.append('file', file)
  
  return request({
    url: '/api/common/upload', // 请确认这是你后端的真实上传接口地址
    method: 'post',
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    data: formData
  })
}
