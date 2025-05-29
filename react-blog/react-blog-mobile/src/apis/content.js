//封装与内容管理相关的接口函数
import { request } from "@/utils/request"
import blogList from '@/mock/blogList';

// 切换此变量即可使用 mock 数据或真实接口
export const USE_MOCK = false;

//1、新建blog 新建成功blog状态为 未发布
export function createBlogAPI(data) {
    if (USE_MOCK) {
        // 生成一个新的唯一ID（取现有ID的最大值+1）
        const maxId = blogList.length > 0 ? Math.max(...blogList.map(blog => blog.id)) : 0;
        const newBlog = {
            id: maxId + 1,
            title: data.title || '新博客标题',
            content: data.content || '新博客内容',
            excerpt: data.excerpt || data.content?.substring(0, 100) || '新博客内容',
            date: new Date().toISOString().split('T')[0],
            author: localStorage.getItem('userAccount') || 'admin',
            account: localStorage.getItem('userAccount') || 'admin',
            status: 0 // 未发布状态
        };

        blogList.push(newBlog);

        return Promise.resolve({
            data: {
                data: newBlog,
                message: '博客创建成功'
            }
        });
    }
    return request({
        url: "/content/create",
        method: "POST",
        data
    })
}

//2、获取blog列表
export function getBlogListAPI(params) {
    if (USE_MOCK) {
        return Promise.resolve({
            data: {
                data: {
                    results: blogList
                }
            }
        });
    }
    return request({
        url: "/content/list",
        method: "GET",
        params
    })
}

//3、获取blog详情
export function getBlogDetailAPI(id) {
    if (USE_MOCK) {
        const blog = blogList.find(item => item.id === parseInt(id));
        return Promise.resolve({
            data: {
                data: blog || null
            }
        });
    }
    return request({
        url: `/content/list/${id}`,
        method: "GET"
    })
}

//4、编辑blog
export function editBlogAPI(id, data) {
    if (USE_MOCK) {
        const index = blogList.findIndex(item => item.id === parseInt(id));
        if (index !== -1) {
            // 更新博客数据
            blogList[index] = {
                ...blogList[index],
                ...data,
                // 保留原始ID和状态
                id: blogList[index].id,
                status: blogList[index].status || 0
            };
            return Promise.resolve({
                data: {
                    data: blogList[index],
                    message: '博客编辑成功'
                }
            });
        } else {
            return Promise.reject(new Error('博客不存在'));
        }
    }
    return request({
        url: `/content/edit/${id}`,
        method: "PUT",
        data
    })
}

//5、发布blog 发布成功blog状态为 已发布
export function publishBlogAPI(id) {
    if (USE_MOCK) {
        const index = blogList.findIndex(item => item.id === parseInt(id));
        if (index !== -1) {
            blogList[index].status = 1; // 设置为已发布
            return Promise.resolve({
                data: {
                    data: blogList[index],
                    message: '博客发布成功'
                }
            });
        } else {
            return Promise.reject(new Error('博客不存在'));
        }
    }
    return request({
        url: `/content/publish/${id}`,
        method: "GET",
    })
}

//6、删除blog 
export function deleteBlogAPI(id) {
    if (USE_MOCK) {
        const index = blogList.findIndex(item => item.id === parseInt(id));
        if (index !== -1) {
            const deletedBlog = blogList[index];
            blogList.splice(index, 1);
            return Promise.resolve({
                data: {
                    data: deletedBlog,
                    message: '博客删除成功'
                }
            });
        } else {
            return Promise.reject(new Error('博客不存在'));
        }
    }
    return request({
        url: `/content/delete/${id}`,
        method: "DELETE",
    })
}

//7、下架blog 下架成功blog状态为 未发布
export function revokeBlogAPI(id) {
    if (USE_MOCK) {
        const index = blogList.findIndex(item => item.id === parseInt(id));
        if (index !== -1) {
            blogList[index].status = 0; // 设置为未发布
            return Promise.resolve({
                data: {
                    data: blogList[index],
                    message: '博客下架成功'
                }
            });
        } else {
            return Promise.reject(new Error('博客不存在'));
        }
    }
    return request({
        url: `/content/revoke/${id}`,
        method: "GET",
    })
}

