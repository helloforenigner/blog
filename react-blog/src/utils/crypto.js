import CryptoJS from "crypto-js";
//AES加密
/**
 * 加密方法
 * @param {*} word 需要加密的字符串
 * @param {*} keyStr  加密的key值
 * */
const SECRET_KEY = 'iTgNXRqU80YZ52+iV7Ew2w=='
const AES_encrypt = (word) => {
    const key = CryptoJS.enc.Base64.parse(SECRET_KEY)
    return CryptoJS.AES.encrypt(word, key, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
    }).ciphertext.toString(CryptoJS.enc.Base64)
}

//AES解密
/**
 * 解密方法
 * @param {*} word 需要解密的字符串
 * @param {*} keyStr  解密的key值
 * */
const AES_decrypt = (word) => {
    const key = CryptoJS.enc.Base64.parse(SECRET_KEY)
    return CryptoJS.AES.decrypt(word, key, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
    }).toString(CryptoJS.enc.Utf8)
}

export { AES_encrypt, AES_decrypt }