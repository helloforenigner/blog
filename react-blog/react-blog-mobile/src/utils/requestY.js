import axios from 'axios'
import { getToken, removeToken } from '@/utils/token'
import router from "@/router";

//1.根域名的配置
const requestY = axios.create({
    baseURL: 'http://localhost:8085',//严梦鸿测试联调
    //baseURL: 'http://127.0.0.1:4523/m1/6306180-6001202-default',//后端服务器根域名
    timeout: 5000 //超时时间,单位是毫秒
})

// 添加请求拦截器
//在请求发送之前 做拦截 插入一些自定义的配置[参数处理]
requestY.interceptors.request.use((config) => {
    //操作这个config 注入token数据
    //1.获取token
    //2.按照后端的格式要求做token拼接
    const token = getToken()
    //const token = 'eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJ1c2VyX2lkIjoxLCJyb2xlIjoiYWRtaW4ifQ.'
    if (token) {
        //此处做Token拼接
        //config.headers.Authorization = `Bearer ${token}`
        config.headers.Authorization = token

    }
    console.log('config', config)
    return config
}, (error) => {
    return Promise.reject(error)
})


// 添加响应拦截器
//在响应回来之后 做拦截 重点处理返回的数据
requestY.interceptors.response.use((response) => {
    // 2xx 范围内的状态码都会触发该函数。
    // 对响应数据做点什么
    console.log('response', response)
    return response
}, (error) => {
    // 超出 2xx 范围的状态码都会触发该函数。
    // 对响应错误做点什么
    // 监控401 token失效
    console.dir(error)
    if (error && error.response && error.response.status && error.response.status === 401) {
        removeToken()
        router.navigate('/')//跳转到登录页
        window.location.reload()
    }
    return Promise.reject(error)
})

export { requestY }