//用户模块的API请求
import { requestY } from '@/utils/requestY';

//1 短信验证码请求
export function sendSmsCode(params) {
    return requestY({
        url: '/sms/send',
        method: 'GET',
        params
    })
}

//2、用户登录请求
export function loginAPI(data) {
    return requestY({
        url: '/user/login',
        method: 'POST',
        data
    })
}

//3、获取用户信息
export function getUserInfoAPI() {
    return requestY({
        url: '/user/center',
        method: 'GET'
    })
}

//4、修改密码
export function changePasswordAPI(data) {
    return requestY({
        url: '/user/modify-psw',
        method: 'PATCH',
        data
    });
}

//5、用户注册
export function registerAPI(data) {
    return requestY({
        url: 'user/register',
        method: 'POST',
        data
    });
}

//6、用户登录时验证是否需要滑块验证码
export function getCaptchaAPI(data) {
    return requestY({
        url: '/user/need-slider',
        method: 'POST',
        data
    });
}

//7、滑块验证通过请求
export function sliderVerifyPassAPI(params) {
    return requestY({
        url: '/user/slider-pass',
        method: 'POST',
        params
    });
}

//8、编辑个人信息
export function editUserInfoAPI(data) {
    return requestY({
        url: '/user/center',
        method: 'PATCH',
        data
    });
}

//9、用户退出登录
export function logoutAPI() {
    return requestY({
        url: '/user/quit',
        method: 'GET'
    });
}


