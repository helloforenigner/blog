//文件API请求
import { requestY } from '@/utils/requestY';



export function uploadFileAPI(data) {
    return requestY({
        url: '/file/upload',
        method: 'POST',
        data
    })
}
