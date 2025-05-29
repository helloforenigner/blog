import { Card, Button, SearchBar, Space, Toast, Tag, List, Ellipsis, SwipeAction, Dialog } from 'antd-mobile'
import {
    AddSquareOutline
} from 'antd-mobile-icons'
import { useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { getBlogListAPI, publishBlogAPI, deleteBlogAPI, revokeBlogAPI } from '@/apis/content'
import './index.scss'
import Item from 'antd/es/list/Item';




const ContentManager = () => {

    // 新增状态来存储搜索框的值
    const [searchValue, setSearchValue] = useState('')


    const navigate = useNavigate()

    const ref = useRef(null)



    let role = sessionStorage.getItem('role')

    // 1.准备请求参数
    const [reqData, setReqData] = useState({
        account1: 1,
        //account2: '',
        //role: role,
        role: 1,
        page: 1,
        per_page: 10
    })

    //2、获取blog列表
    const [blogList, setBlogList] = useState([])

    useEffect(() => {
        //定义获取文章列表的函数
        const getBlogList = async () => {
            //请求数据
            //...reqData
            const res = await getBlogListAPI(reqData)
            if (res && res.data && res.data.data && res.data.data.results) {
                setBlogList(res.data.data.results)
            } else {
                // Handle the case where the data is not in the expected format
                console.error("Error: Unexpected response structure from getBlogListAPI", res);
                setBlogList([]); // Set to empty array or handle error appropriately
            }
            //console.log(res.data.data.results)
        }
        //调用函数
        getBlogList()
    }, [reqData])

    //3、搜索功能
    const onSearch = () => {
        //console.log(value)
        setReqData({
            ...reqData,
            account2: searchValue
        })
        //reqData依赖项发生变化，重复执行副作用函数
    }

    //4、状态标签
    const status = {
        0: <Tag color="warning">未发布</Tag>,
        1: <Tag color="success">已发布</Tag>
    }

    //滑动操作
    const getRightActions = (blogId) => [[
        {
            key: 'publish',
            text: '发布',
            color: 'success',
            onClick: () => {
                Dialog.confirm({
                    content: '确认要发布该条Blog吗?',
                    onConfirm: async () => {
                        await onPublishConfirm(blogId)
                        Toast.show({
                            icon: 'success',
                            content: '提交成功',
                            position: 'bottom',
                        })
                        setReqData({ ...reqData })
                    }
                })
                ref.current?.close()
            }
        },
        {
            key: 'edit',
            text: '编辑',
            color: 'primary',
            onClick: () => {
                navigate(`/layout/publish?id=${blogId}`)
            }

        },
        {
            key: 'delete',
            text: '删除',
            color: 'danger',
            onClick: () => {
                Dialog.confirm({
                    content: '确认要删除该条Blog吗?',
                    onConfirm: async () => {
                        await onDeletConfirm(blogId)
                        Toast.show({
                            icon: 'success',
                            content: '提交成功',
                            position: 'bottom',
                        })
                        setReqData({ ...reqData })
                    },
                })
                ref.current?.close()
            }

        }
    ], [
        {
            key: 'edit',
            text: '编辑',
            color: 'primary',
            onClick: () => navigate(`/layout/publish?id=${blogId}`)
        },
        {
            key: 'revoke',
            text: '下架',
            color: 'light',
            onClick: () => {
                Dialog.confirm({
                    content: '确认要下架该条Blog吗?',
                    onConfirm: async () => {
                        await onRevokeConfirm(blogId)
                        Toast.show({
                            icon: 'success',
                            content: '提交成功',
                            position: 'bottom',
                        })
                        setReqData({ ...reqData })
                    },
                })
                ref.current?.close()
            }

        },
        {
            key: 'delete',
            text: '删除',
            color: 'danger',
            onClick: () => {
                Dialog.confirm({
                    content: '确认要删除该条Blog吗?',
                    onConfirm: async () => {
                        await onDeletConfirm(blogId)
                        Toast.show({
                            icon: 'success',
                            content: '提交成功',
                            position: 'bottom',
                        })
                        setReqData({ ...reqData })
                    },
                })
                ref.current?.close()
            }

        }
    ]

    ]


    // 确认发布

    const onPublishConfirm = async (blogId) => {
        const res = await publishBlogAPI(blogId)
        console.log(res)

    }

    // 确认删除

    const onDeletConfirm = async (blogId) => {
        const res = await deleteBlogAPI(blogId)
        console.log(res)
    }

    // 确认下架

    const onRevokeConfirm = async (blogId) => {
        const res = await revokeBlogAPI(blogId)
        console.log(res)
    }

    //发布blog
    const publishBlog = () => {
        navigate('/layout/publish')
    }

    return (
        <div className='content-container' style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
            <div style={{ flex: '0 0 auto' }}>
                <Card title={
                    <div className="breadcrumbStyle">

                        <a href="/layout" className="breadcrumbItemStyle">首页</a>
                        <span className="breadcrumbSeparatorStyle">{'>'}</span>
                        <span>内容管理</span>

                        <span className='addBlog' >
                            <AddSquareOutline onClick={publishBlog} color='var(--adm-color-primary)' fontSize={30} />
                        </span>
                    </div>
                }><Space>
                        <SearchBar onChange={(value => {
                            setSearchValue(value)
                        })}
                            value={searchValue}
                            placeholder="输入账号搜索" />
                        <Button
                            color='primary'
                            fill='outline'
                            onClick={onSearch}
                            size='small'
                        >
                            搜索
                        </Button>
                    </Space>
                </Card>
            </div>
            {/* 表格区域 */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
                <List header='Blog列表'>
                    {blogList.map(item => (
                        <SwipeAction
                            ref={ref}
                            rightActions={getRightActions(item.id)[item.status]}
                            closeOnAction={true}
                            closeOnTouchOutside={true}
                        >
                            <List.Item
                                key={item.id}>
                                <Card className='itemCard'>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                        <h3 style={{
                                            margin: 0
                                        }}><Ellipsis direction='end' content={item.title} /></h3>
                                        {status[item.status]}
                                    </div>
                                    <div style={{
                                        marginBottom: 8,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        display: '-webkit-box',
                                        WebkitLineClamp: 8, // 限制行数为 3
                                        WebkitBoxOrient: 'vertical',
                                        maxHeight: '12em', // 假设行高 1.5em，3 行高度 4.5em
                                    }}
                                        // 使用 dangerouslySetInnerHTML 插入 HTML 内容
                                        dangerouslySetInnerHTML={{ __html: item.content }}
                                    />
                                    <p style={{ color: '#666', fontSize: 14 }}>{item.account}</p>
                                </Card>
                            </List.Item>
                        </SwipeAction>
                    )
                    )}
                </List>
            </div>

        </div >
    )

}

export default ContentManager;