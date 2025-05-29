//和用户相关的状态管理
import { createSlice } from "@reduxjs/toolkit";
import { setToken as _setToken, getToken, removeToken } from "@/utils/token";
import { removeCache } from "@/utils/sessionStore";
import { loginAPI, getUserInfoAPI } from "@/apis/user";

const userStore = createSlice({
    name: 'user',
    //数据状态
    initialState: {
        token: getToken() || '',
        userInfo: {},
    },

    //同步修改方法
    reducers: {
        setToken(state, action) {
            state.token = action.payload
            //sessionstorage存储token
            _setToken(action.payload)
        },
        setUserInfo(state, action) {
            state.userInfo = action.payload
        },
        clearUserInfo(state) {
            state.token = ''
            state.userInfo = {}
            removeToken()
            //清除sessionstorage
            removeCache()
        }
    }
})

//解构出actionCreater
const { setToken, setUserInfo, clearUserInfo } = userStore.actions

//获取reducer函数
const userReducer = userStore.reducer

//异步方法 完成登录获取token
const fetchLogin = (loginForm) => {
    return async (dispatch) => {
        //1.发送异步登录请求
        const res = await loginAPI(loginForm)
        //2. 提交同步action进行token的存入
        if (res.data.code === 1) {
            dispatch(setToken(res.data.data.token))
        }
        return res
    }
}

//获取个人用户信息异步方法
const fetchUserInfo = () => {
    return async (dispatch) => {
        //1.发送异步请求获取用户信息
        const res = await getUserInfoAPI()
        //2.提交同步action进行用户信息的存入
        dispatch(setUserInfo(res.data.data))
    }
}

export { setToken, clearUserInfo, fetchLogin, fetchUserInfo }

export default userReducer