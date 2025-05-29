//封装与账号管理相关的接口函数
import { requestH } from "@/utils/requestH"

//1、获取账号列表
export function getAccountListAPI(params) {
    return requestH({
        url: "/admin/users",
        method: "GET",
        params
    })
}

//2、获取账号详情
export function getAccountDetailAPI(id) {
    return requestH({
        url: `/admin/users/account/${id}`,
        method: "GET"
    })
}

//3、用户状态管理
export function operationAccountStatusAPI(data) {
    return requestH({
        url: '/admin/users/account/operation',
        method: "POST",
        data
    })
}

//4、管理员新增账号
export function createAccountAPI(data) {
    return requestH({
        url: '/admin/users',
        method: "POST",
        data
    })
}