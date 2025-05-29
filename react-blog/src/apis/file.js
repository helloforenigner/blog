//文件API请求
import { requestY } from '@/utils/requestY';
import { request } from '@/utils/request';


// 图片上传
export function uploadFileAPI(data) {
    return requestY({
        url: '/file/upload',
        method: 'POST',
        data
    })
}


// pdf导出
export function exportPdfAPI(id) {
    return request({
        url: `content/exportPdf/${id}`,
        method: 'GET',
        responseType: 'blob' // 设置响应类型为blob
    })
}
