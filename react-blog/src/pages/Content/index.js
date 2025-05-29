import { Card, Breadcrumb, Input, Button, Tag, Tooltip, Table, Space, Popconfirm, message, Modal, Descriptions } from 'antd';
import { Link } from 'react-router-dom'
import { EditOutlined, DeleteOutlined, ExportOutlined, ImportOutlined, FileMarkdownOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getBlogListAPI, publishBlogAPI, deleteBlogAPI, revokeBlogAPI } from '@/apis/content'
import { getAbnormalListAPI, getAbnormalDetailAPI } from '@/apis/abnormal'
import { exportPdfAPI } from '@/apis/file'
import './index.scss'

const { Search } = Input;


const ContentManager = () => {


    const userAccount = sessionStorage.getItem('userAccount')
    const role = sessionStorage.getItem('role')

    // 1.准备请求参数
    const [reqData, setReqData] = useState({
        account1: userAccount,
        //account2: '',
        role: role,
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
    const onSearch = (value) => {
        //console.log(value)
        setReqData({
            ...reqData,
            account2: value
        })
        //reqData依赖项发生变化，重复执行副作用函数
    }

    //4、状态标签
    const status = {
        0: <Tag color="warning">未发布</Tag>,
        1: <Tag color="success">已发布</Tag>
    }

    // 确认发布


    const onPublishConfirm = async (blogId) => {
        const res = await publishBlogAPI(blogId)
        if (res.data.code === 1) {
            message.success(res.data.message)
        } else {
            message.error(`发布失败，${res.data.error}`)
        }
        setReqData({ ...reqData })
    }

    // 确认删除


    const onDeletConfirm = async (blogId) => {
        const res = await deleteBlogAPI(blogId)
        if (res.data.code === 1) {
            message.success('删除成功')
        } else {
            message.error(`删除失败，${res.data.error}`)
        }
        setReqData({ ...reqData })
    }

    // 确认下架

    const onRevokeConfirm = async (blogId) => {
        const res = await revokeBlogAPI(blogId)
        if (res.data.code === 1) {
            message.success('下架成功')
        } else {
            message.error(`下架失败，${res.data.error}`)
        }
        setReqData({ ...reqData })
    }

    //导出pdf
    const onExportPDFConfirm = async (blogId) => {
        try {

            const res = await exportPdfAPI(blogId)

            const url = window.URL.createObjectURL(res.data);
            // 创建一个 <a> 元素
            const a = document.createElement('a');
            a.href = url;
            // 设置下载的文件名
            a.download = 'downloaded.pdf';
            document.body.appendChild(a);
            a.click();
            // 清理工作
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('下载文件时出错:', error);
        }

    }

    const columns = [

        {
            title: '内容标题',
            dataIndex: 'title',
            width: 260
        },
        {
            title: '正文',
            dataIndex: 'content',
            width: 500,
            render: (data) => {
                return <div dangerouslySetInnerHTML={{ __html: data }} />
            }
        },
        {
            title: '内容状态',
            dataIndex: 'status',
            width: 100,
            // data - 后端返回的状态status 根据它做条件渲染
            // render - 自定义渲染函数
            // data 0:未发布 1:已发布
            render: data => status[data]
        },
        {
            title: '账号',
            dataIndex: 'account',
            width: 150
        },
        {
            title: '操作',
            render: data => {
                return (
                    <Space size="middle">
                        {/* 状态为 未发布 可以进行发布操作 */}
                        {data.status === 0 ?
                            <Tooltip title="发布blog">
                                <Popconfirm
                                    title="发布Blog"
                                    description="确认要发布该条Blog吗?"
                                    okText="Yes"
                                    cancelText="No"
                                    onConfirm={() => onPublishConfirm(data.id)}
                                >
                                    <Button id="publish-button" type="primary" shape="circle" icon={<ExportOutlined />} />
                                </Popconfirm>
                            </Tooltip> : null}
                        {/* 状态为 已发布 且 角色为管理员 才可以进行下架操作 */}
                        {data.status === 1 && role === '1' && (<Tooltip title="下架blog">
                            <Popconfirm
                                title="下架blog"
                                description="确认要下架该条blog吗?"
                                okText="Yes"
                                cancelText="No"
                                onConfirm={() => onRevokeConfirm(data.id)}
                            >
                                <Button
                                    id="revoke-button"
                                    type="primary"
                                    danger
                                    shape="circle"
                                    icon={<ImportOutlined />}
                                />
                            </Popconfirm>
                        </Tooltip>)}
                        {/* 状态为 未发布 可以进行编辑操作 */}
                        {data.status === 0 && (<Tooltip title="编辑blog">
                            <Button onClick={() => navigate(`/layout/publish?id=${data.id}`)} type="primary" shape="circle" icon={<EditOutlined />} />
                        </Tooltip>)}
                        {/* 状态为 未发布 且 角色为管理员 才可以进行删除操作 */}
                        {data.status === 0 && (<Tooltip title="删除blog">
                            <Popconfirm
                                title="删除blog"
                                description="确认要删除该条blog吗?"
                                okText="Yes"
                                cancelText="No"
                                onConfirm={() => onDeletConfirm(data.id)}
                            >
                                <Button
                                    type="primary"
                                    danger
                                    shape="circle"
                                    icon={<DeleteOutlined />}
                                />
                            </Popconfirm>
                        </Tooltip>)}

                        <Tooltip title="导出PDF">
                            <Popconfirm
                                title="导出Blog内容为PDF文件"
                                description="确认要导出文件吗?"
                                okText="Yes"
                                cancelText="No"
                                onConfirm={() => onExportPDFConfirm(data.id)}
                            >
                                <Button
                                    type="primary"
                                    icon={<FileMarkdownOutlined />}
                                />
                            </Popconfirm>
                        </Tooltip>



                    </Space>
                )
            }
        }
    ]

    const navigate = useNavigate()
    //发布blog
    const publishBlog = () => {
        navigate('/layout/publish')
    }

    //异常信息查看
    const [abnormalList, setAbnormalList] = useState([])

    const [showAbnormalListModal, setShowSensitiveResultModal] = useState(false)

    const handleAbnormalListModalCancel = () => {
        setShowSensitiveResultModal(false)
    }

    const showAbnormalList = async () => {
        const req = {
            page: 1,
            per_page: 10
        }
        const res = await getAbnormalListAPI(req)
        setAbnormalList(res.data.data.data.results)
        setShowSensitiveResultModal(true);
    }

    // 异常详情查看
    const [abnormalModalOpen, setAbnormalModalOpen] = useState(false);
    const [abnormalInfo, setAbnormalInfo] = useState({})

    const handleAbnormalModalCancel = () => {
        setAbnormalModalOpen(false);
    };

    const showAbnormalDetail = async (id) => {
        const res = await getAbnormalDetailAPI(id)
        console.log(res)
        setAbnormalInfo(res.data.data)
        setAbnormalModalOpen(true);

        //console.log('查看账号详情')
    }

    const annormalItems = [
        {
            key: '1',
            label: '账号',
            children: abnormalInfo.account,
            span: 1.5
        },
        {
            key: '2',
            label: '发布时间',
            children: abnormalInfo.publish_time,
            span: 1.5
        },
        {
            key: '3',
            label: '异常描述',
            children: abnormalInfo.description,
            span: 3
        },
        {
            key: '4',
            label: '详细异常信息',
            children: <div dangerouslySetInnerHTML={{ __html: abnormalInfo.abnormal_detail }} />,
            span: 3
        }

    ];

    return (
        <div>
            <Card title={<Breadcrumb separator=">">
                <Breadcrumb.Item>
                    <Link to="/layout">首页</Link>
                </Breadcrumb.Item>
                <Breadcrumb.Item>内容管理</Breadcrumb.Item>
            </Breadcrumb>}>
                {role === '1' && (<Search onSearch={onSearch} placeholder="输入账号搜索" style={{ width: 300 }} />)}
                {role === '0' && (<Button type='primary' onClick={showAbnormalList} htmlType="button">
                    异常信息查看
                </Button>)}
                <Button type='primary' onClick={publishBlog} htmlType="button" style={{ float: "right" }}>
                    新建Blog
                </Button>
            </Card>
            {/* 表格区域 */}
            <Card title={'内容'}>
                <Table className="custom-table" rowKey="id" columns={columns} dataSource={blogList}
                />
            </Card>


            <Modal
                title="异常信息查看"
                closable={{ 'aria-label': 'Custom Close Button' }}
                maskClosable={false}
                width={{
                    xs: '80%',
                    sm: '80%',
                    md: '70%',
                    lg: '60%',
                    xl: '50%',
                    xxl: '40%',
                }}
                open={showAbnormalListModal}
                onCancel={handleAbnormalListModalCancel}
                footer={[
                    <Button key="submit" type="primary" onClick={handleAbnormalListModalCancel}>
                        确认
                    </Button>
                ]}>
                <Card>
                    <Table rowKey="id"
                        columns={[
                            {
                                title: '账号',
                                dataIndex: 'account',
                                width: 220,
                            },
                            {
                                title: '异常原因',
                                width: 220,
                                render: data => {
                                    return (
                                        <Tooltip title="点击查看异常详情">
                                            <p onClick={() => showAbnormalDetail(data.id)} className='description-text'>{data.description}</p>
                                        </Tooltip>
                                    )
                                }
                            },
                            {
                                title: '发布时间',
                                dataIndex: 'publishTime',
                                width: 220

                            }
                        ]}
                        dataSource={abnormalList}
                    />

                </Card>
            </Modal>


            <Modal
                title="异常详情"
                closable={{ 'aria-label': 'Custom Close Button' }}
                open={abnormalModalOpen}
                onCancel={handleAbnormalModalCancel}
                footer={null}
                width={{
                    xs: '80%',
                    sm: '80%',
                    md: '70%',
                    lg: '60%',
                    xl: '50%',
                    xxl: '40%',
                }}>
                <Descriptions bordered items={annormalItems} />
            </Modal>
        </div>
    )

}

export default ContentManager;