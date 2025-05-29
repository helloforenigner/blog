//封装和token相关的方法 存 取 删

const TOKENKEY = 'token_key'

function setToken(token) {
    sessionStorage.setItem(TOKENKEY, token)
}

function getToken() {
    return sessionStorage.getItem(TOKENKEY)
}

function removeToken() {
    sessionStorage.removeItem(TOKENKEY)
}

export {
    setToken,
    getToken,
    removeToken
}