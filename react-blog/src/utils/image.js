
export const base64ToFile = (base64, fileName = `${Math.random()}`) => {
    let arr = base64.split(',')
    console.log(arr[0])
    let mime = arr[0].match(/:(.*?);/)[1]
    let bstr = atob(arr[1])
    let n = bstr.length
    let u8arr = new Uint8Array(n)
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n)
    }
    //console.log('mime-----', mime)
    return new File([u8arr], `${fileName}.${mime.split('/')[1]}`, {
        type: mime,
    })
}
