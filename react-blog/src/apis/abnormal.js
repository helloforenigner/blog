//封装与异常管理相关的接口函数
import { request } from "@/utils/request"
import { requestH } from "@/utils/requestH"

//1、获取异常信息列表
export const getAbnormalListAPI = (params) => {
    return requestH({
        url: "/admin/abnormal-records",
        method: "GET",
        params
    })
}


//2、获取异常信息详情
export const getAbnormalDetailAPI = (id) => {
    return requestH({
        url: `/admin/abnormal-records/${id}/detail`,
        method: "GET"
    })
}

//3、获取敏感词库列表
export const getSensitiveWordListAPI = (params) => {
    return request({
        url: "/abnormal/sensitive/list",
        method: "GET",
        params
    })
}

//4、添加敏感词
export const addSensitiveWordAPI = (data) => {
    return request({
        url: "/abnormal/sensitive/add",
        method: "POST",
        data
    })
}

//5、删除敏感词
export const deleteSensitiveWordAPI = (id) => {
    return request({
        url: `/abnormal/sensitive/delete/${id}`,
        method: "DELETE"
    })
}