import {
    Card,
    Breadcrumb,
    Form,
    Tag,
    Button,
    Table,
    Space,
    Popconfirm,
    DatePicker,
    Tooltip,
    Modal,
    Descriptions,
    FloatButton,
    Input,
    message
} from 'antd';
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { getAccountDetailAPI } from '@/apis/account'
import { getAbnormalListAPI, getAbnormalDetailAPI, getSensitiveWordListAPI, addSensitiveWordAPI, deleteSensitiveWordAPI } from '@/apis/abnormal';
import { operationAccountStatusAPI } from '@/apis/account'
import { DeleteTwoTone, PlusOutlined } from '@ant-design/icons'
import UserInfo from '@/components/UserInfo'
//引入汉化包 时间选择器显式中文
import locale from 'antd/es/date-picker/locale/zh_CN'

import './index.scss'

const { RangePicker } = DatePicker;
const { Search, TextArea } = Input;

const AbnormalDetect = () => {


    //1、准备请求参数
    const [reqData, setReqData] = useState({
        page: 1,
        per_page: 10
    })

    //2、获取异常信息列表
    const [abnormalList, setAbnormalList] = useState([])

    useEffect(() => {
        //定义获取异常信息列表的函数
        const getAbnormalList = async () => {
            //请求数据
            //...reqData
            const res = await getAbnormalListAPI(reqData)
            setAbnormalList(res.data.data.data.results)
            //console.log(res.data.data.results)
        }
        //调用函数
        getAbnormalList()
    }, [reqData])

    //3、搜索功能
    const onFinish = (values) => {
        //console.log(values)
        setReqData({
            ...reqData,
            beginDate: values.date ? `${values.date[0].format('YYYY-MM-DD')} 00:00:00` : '',
            endDate: values.date ? `${values.date[1].format('YYYY-MM-DD')} 00:00:00` : ''
        })
        //reqData依赖项发生变化，重复执行副作用函数
    }

    // 状态标签
    const status = {
        0: <Tag color="warning">未登录</Tag>,
        1: <Tag color="success">已登录</Tag>,
        2: <Tag color="error">已封禁</Tag>
    }


    //5、查看账号详情
    const [accountModalOpen, setAccountModalOpen] = useState(false);
    const [accountInfo, setAccountInfo] = useState({})

    const handleAccountModalCancel = () => {
        setAccountModalOpen(false);
    };

    const accountItems = [
        {
            key: '1',
            label: '账号',
            children: accountInfo.account,
            span: 1.5
        },
        {
            key: '2',
            label: '昵称',
            children: accountInfo.username,
            span: 1.5
        },
        {
            key: '3',
            label: '手机号',
            children: accountInfo.phone,
            span: 1.5
        },
        {
            key: '4',
            label: '账号状态',
            children: status[accountInfo.status],
            span: 1.5
        },
        {
            key: '5',
            label: '账号创建时间',
            children: accountInfo.createdAt,
            span: 3
        },
        {
            key: '6',
            label: '账号变更时间',
            children: accountInfo.updatedAt,
            span: 3
        },
        {
            key: '7',
            label: '用户简介',
            children: accountInfo.profile,
        }
    ];


    const showAccountDetail = async (account) => {
        const res = await getAccountDetailAPI(account)
        console.log(res)
        setAccountInfo(res.data.data)
        setAccountModalOpen(true);

        //console.log('查看账号详情')
    }

    // 查看异常详情
    const [abnormalModalOpen, setAbnormalModalOpen] = useState(false);
    const [abnormalInfo, setAbnormalInfo] = useState({})

    const handleAbnormalModalCancel = () => {
        setAbnormalModalOpen(false);
    };



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

    const showAbnormalDetail = async (id) => {
        const res = await getAbnormalDetailAPI(id)
        console.log(res)
        setAbnormalInfo(res.data.data)
        setAbnormalModalOpen(true);

        //console.log('查看账号详情')
    }


    // 用户管理操作
    const [showOperateResult, setShowOperateResult] = useState(false);
    const handleOperateResultCancel = () => {
        setShowOperateResult(false)
    }

    const onOperateConfirm = async (account, operate) => {
        console.log(account, operate)
        await operationAccountStatusAPI({ account, operate })
        setShowOperateResult(true)
    }

    //敏感词管理操作

    const [sensitiveList, setSensitiveList] = useState([])
    const [showSensitiveResult, setShowSensitiveResult] = useState(false);



    const handleSensitiveResultCancel = () => {
        setShowSensitiveResult(false)
    }

    const showSensitiveWordList = async (value) => {
        const req = {
            page: 1,
            per_page: 10
        }
        if (value) {
            req.words = encodeURIComponent(value)
        }
        const res = await getSensitiveWordListAPI(req)
        //console.log(res)
        setSensitiveList(res.data.data.results)
        if (res.data.data.results.length === 0) {
            message.warning('未检索到敏感词信息')
        }
        setShowSensitiveResult(true);

        //console.log('查看敏感词列表')
    }

    //添加敏感词
    const [showSensitiveAdd, setShowSensitiveAdd] = useState(false);
    const handleSensitiveAddCancel = () => {
        //关闭对话框 重新渲染敏感词列表
        showSensitiveWordList('')
        setShowSensitiveAdd(false)
    }
    const onSensitiveAddConfirm = () => {
        setShowSensitiveAdd(true)
    }

    // 用于管理文本输入框的值
    const [sensitiveWords, setSensitiveWords] = useState('');


    // 确认添加按钮的点击事件处理函数
    const handleAddSensitiveWords = async () => {
        //console.log('输入的敏感词:', sensitiveWords);

        // 使用正则表达式 [,，] 作为分隔符，将用逗号分隔的字符串转换为数组，同时去除每个元素的前后空格
        const sensitiveWordsArray = sensitiveWords.split(/[，,]/).map(word => word.trim()).filter(word => word !== '');
        //console.log('转换后的敏感词数组:', sensitiveWordsArray);
        //构造请求参数
        if (sensitiveWordsArray.length === 0) {
            alert('请输入至少一个敏感词');
            return; // 终止函数执行
        }
        const req = {
            words: sensitiveWordsArray
        }
        //console.log(req)


        // 这里可以添加调用 API 的逻辑来保存敏感词
        const res = await addSensitiveWordAPI(req)
        if (res.status === 200) {
            alert('添加成功！');
        } else {
            alert('添加失败！');
        }
        //console.log(res)
        // 清空输入框
        setSensitiveWords('');

    };

    //删除敏感词
    const onDeleteSensitiveConfirm = async (id) => {
        const res = await deleteSensitiveWordAPI(id)
        console.log(res)

        //删除成功，重新渲染敏感词列表
        showSensitiveWordList('')
    }

    // 异常信息表格列配置
    const columns = [

        {
            title: '账号',
            dataIndex: 'account',
            width: 220,
            render: (text) => {
                return (
                    <Tooltip title="点击查看账号详情">
                        <p onClick={() => showAccountDetail(text)} className='account-text'>{text}</p>
                    </Tooltip>
                )
            }
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
            title: '账号状态',
            dataIndex: 'status',
            width: 220,
            render: data => status[data]
        },
        {
            title: '发布时间',
            dataIndex: 'publishTime',
            width: 220

        },
        {
            title: '操作',
            render: data => {
                return (
                    <Space size="middle" className='operate-space'>
                        {/* 条件渲染，已登录状态的用户才能进行踢蹬 */}
                        {(data.status === 1) && (
                            <Popconfirm
                                title="踢蹬用户"
                                description="确认要踢蹬该用户吗?"
                                okText="Yes"
                                cancelText="No"
                                onConfirm={() => onOperateConfirm(data.account, 2)}
                            >
                                <Button className="kick_out-button" shape="circle">踢蹬</Button>
                            </Popconfirm>)
                        }
                        {/* 条件渲染，已封禁状态的用户才能进行解封 */}
                        {(data.status === 2) && (
                            <Popconfirm
                                title="解封用户"
                                description="确认要解封该用户吗?"
                                okText="Yes"
                                cancelText="No"
                                onConfirm={() => onOperateConfirm(data.account, 0)}
                            >
                                <Button className="revive-button" shape="circle">解封</Button>
                            </Popconfirm>
                        )}
                        {/* 条件渲染，已登录和未登录状态的用户才能进行封禁 */}
                        {(data.status === 0 || data.status === 1) && (<Popconfirm
                            title="封禁用户"
                            description="确认要封禁该用户吗?"
                            okText="Yes"
                            cancelText="No"
                            onConfirm={() => onOperateConfirm(data.account, 1)}
                        >
                            <Button
                                className="prohibit-button"
                                shape="circle"
                            >封禁</Button>
                        </Popconfirm>)}

                    </Space>
                )
            }
        }
    ]



    return (
        <div>
            <Card title={<Breadcrumb separator=">">
                <Breadcrumb.Item>
                    <Link to="/layout">首页</Link>
                </Breadcrumb.Item>
                <Breadcrumb.Item>异常感知</Breadcrumb.Item>
            </Breadcrumb>}>

                <Form layout='inline' onFinish={onFinish}
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Form.Item label="日期" name="date">
                            {/* 传入locale属性 控制中文显示*/}
                            <RangePicker locale={locale}></RangePicker>
                        </Form.Item>
                        <Form.Item>
                            <Button type="primary" htmlType="submit" style={{ marginLeft: 40 }}>
                                查询
                            </Button>
                        </Form.Item>
                    </div>
                    <Button type="primary" onClick={() => showSensitiveWordList('')}>
                        敏感词库管理
                    </Button>
                </Form>
            </Card>
            {/* 表格区域 */}
            <Card>
                <Table rowKey="id" columns={columns} dataSource={abnormalList}
                />
            </Card>

            <UserInfo open={accountModalOpen} onCancel={handleAccountModalCancel} items={accountItems} />

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

            <Modal
                title="操作提示"
                closable={{ 'aria-label': 'Custom Close Button' }}
                open={showOperateResult}
                onCancel={handleOperateResultCancel}
                footer={[
                    <Button key="submit" type="primary" onClick={handleOperateResultCancel}>
                        确认
                    </Button>
                ]}>
                <p>操作成功！</p>
            </Modal>


            <Modal
                title="敏感词库管理"
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
                open={showSensitiveResult}
                onCancel={handleSensitiveResultCancel}
                footer={[
                    <Button key="submit" type="primary" onClick={handleSensitiveResultCancel}>
                        确认
                    </Button>
                ]}>
                <Card className='header-box'>
                    <Search onSearch={(value) => showSensitiveWordList(value)} placeholder="输入敏感词搜索" style={{ width: 300 }} />
                    <FloatButton
                        className='float-button-add'
                        type="primary"
                        tooltip={<div>添加敏感词</div>}
                        icon={<PlusOutlined />}
                        onClick={onSensitiveAddConfirm} />
                </Card>
                <Card>


                    <Table rowKey="id"
                        columns={[{
                            title: '敏感词id',
                            dataIndex: 'id',
                            width: 100
                        },
                        {
                            title: '敏感词',
                            dataIndex: 'word',
                            width: 400
                        },
                        {
                            title: '操作',
                            render: data => {
                                return (
                                    <Popconfirm
                                        title="删除敏感词"
                                        description="确认要删除该条敏感词吗?"
                                        okText="Yes"
                                        cancelText="No"
                                        onConfirm={() => onDeleteSensitiveConfirm(data.id)}
                                    >
                                        <Button
                                            shape="circle"
                                            icon={<DeleteTwoTone />}

                                        />
                                    </Popconfirm>
                                )
                            }
                        }]}
                        dataSource={sensitiveList}
                    />

                </Card>
            </Modal>
            <Modal
                title="敏感词添加"
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
                open={showSensitiveAdd}
                onCancel={handleSensitiveAddCancel}
                footer={[
                    <Button key="cancel" onClick={handleSensitiveAddCancel}>
                        取消
                    </Button>,
                    <Button key="submit" type="primary" onClick={handleAddSensitiveWords}>
                        确认添加
                    </Button>
                ]}
            >
                <TextArea

                    rows={8}
                    value={sensitiveWords}
                    placeholder="请以规定格式键入敏感词，示例:暴力，血腥，色情"
                    onChange={(e) => setSensitiveWords(e.target.value)} />
            </Modal>
        </div >
    )
}

export default AbnormalDetect;