import axios from 'axios'
// import { Message } from 'element-ui'
// import router from '@/router'

const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API,
  timeout: 90000
})

// 请求方法处理
service.interceptors.request.use(
  config => {
    if (localStorage.getItem('token')) {
      config.headers['Authorization'] = localStorage.getItem('token')
    }
    return config
  },
  error => {
    // do something with request error
    console.log(error) // for debug
    return Promise.reject(error)
  }
)

// 返回响应处理
service.interceptors.response.use(
  response => {
    const res = response.data
    // if (res.code !== 0) {
    //     // 后台返回的报错
    //   if(res.message && res.message.indexOf('用户名或密码')>-1){
    //     router.replace('/')
    //   }else{
    //     Message({
    //       message: res.message,
    //       type: 'error',
    //       duration: 5 * 1000
    //     })
    //   }
    //   return Promise.reject(new Error(res.message || 'Error'))
    // } else {
    //   return res
    // }
    return res
  },
  error => {
    console.log('error' + error) // for debug
    return Promise.reject(error)
  }
)

export default service
