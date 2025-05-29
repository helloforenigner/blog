//用户模块的API请求
import { requestY } from '@/utils/requestY';
import userList from '@/mock/userList';

// 切换此变量即可使用 mock 数据或真实接口
const USE_MOCK = false;

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
    if (USE_MOCK) {
        // 简单模拟登录成功，返回 mock token
        return Promise.resolve({ data: { code: 1, data: { token: 'mock-token' } } });
    }
    return requestY({ url: '/user/login', method: 'POST', data });
}

//3、获取用户信息
export function getUserInfoAPI() {
    if (USE_MOCK) {
        // 返回 mock 用户信息
        return Promise.resolve({ data: { code: 1, data: userList[0] } });
    }
    return requestY({ url: '/user/center', method: 'GET' });
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

    return requestY({ url: '/user/need-slider', method: 'POST', data });
}

//7、滑块验证通过请求
export function sliderVerifyPassAPI(params) {

    return requestY({ url: '/user/slider-pass', method: 'POST', params });
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


