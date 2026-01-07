import axios from 'axios'
import { ElMessage } from 'element-plus'

const service = axios.create({
  baseURL: 'http://localhost:9090',
  timeout: 5000
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  response => {
    const res = response.data
    if (res.code !== 200) {
      ElMessage.error(res.message || 'Error')
      return Promise.reject(new Error(res.message || 'Error'))
    } else {
      return res
    }
  },
  error => {
    ElMessage.error(error.message || '网络错误')
    return Promise.reject(error)
  }
)

export default service
