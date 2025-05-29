import { Card, Breadcrumb, Form, Input, Button, Tag, Tooltip, Table, Space, Popconfirm, Modal, message } from 'antd';
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react';
import { getAccountListAPI, getAccountDetailAPI, operationAccountStatusAPI, createAccountAPI } from '@/apis/account'
import UserInfo from '@/components/UserInfo'
import { AES_decrypt } from '@/utils/crypto'
import './index.scss'
const { Search } = Input;

const formItemLayout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 14 },
};

const AccountManager = () => {

    //1、准备请求参数
    const [reqData, setReqData] = useState({
        page: 1,
        per_page: 10
    })

    //2、获取账号列表
    const [accountList, setAccountList] = useState([])

    useEffect(() => {
        //定义获取账号列表的函数
        const getAccountList = async () => {
            //请求数据
            //...reqData
            const res = await getAccountListAPI(reqData)
            setAccountList(res.data.data.results)
            if (res.data.data.results.length === 0) {
                message.warning('未检索到账号信息')
            }
            //console.log(res.data.data.results)
        }
        //调用函数
        getAccountList()
    }, [reqData])

    //3、搜索功能
    const onSearch = (value) => {
        console.log(value)
        setReqData({
            ...reqData,
            account: value
        })
        //reqData依赖项发生变化，重复执行副作用函数
    }

    //4、状态标签
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

    const items = [
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



    //6、查看明文密码
    const [realPassword, setRealPassword] = useState('')
    const [passwordModalOpen, setPasswordModalOpen] = useState(false);
    const handlePasswordModalCancel = () => {
        setPasswordModalOpen(false)
    }
    const showPassword = (password) => {
        setRealPassword(AES_decrypt(password))
        setPasswordModalOpen(true)
        //console.log('查看明文密码')
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

    //管理员新建账号
    // 定义新建账号表单实例
    const [form] = Form.useForm();

    const [createAccountModalOpen, setCreateAccountModalOpen] = useState(false);
    const handleCreateAccountModalCancel = () => {
        //关闭对话框时刷新account列表
        setReqData({
            ...reqData,
        })
        //清空表单
        form.resetFields();

        setCreateAccountModalOpen(false)
    }
    const onCreateAccountConfirm = () => {
        //console.log('创建账号')
        setCreateAccountModalOpen(true)
    }
    //提交新建账号表单
    const onFinish = async (values) => {

        //console.log(values)
        const res = await createAccountAPI(values)
        //console.log(res)
        alert(res.data.message)
        //清空表单
        form.resetFields();
    }





    const columns = [

        {
            title: '账号',
            dataIndex: 'account',
            width: 250,
            render: (text) => {
                return (
                    <Tooltip title="点击查看账号详情">
                        <p onClick={() => showAccountDetail(text)} className='account-text'>{text}</p>
                    </Tooltip>
                )
            }
        },
        {
            title: '登录密码',
            dataIndex: 'password',
            width: 250,
            render: (text) => {
                return (
                    <Tooltip title="点击查看明文密码">
                        <p onClick={() => showPassword(text)} className='password-text'>********</p>
                    </Tooltip>
                )
            }
        },
        {
            title: '手机号',
            dataIndex: 'phone',
            width: 250
        },
        {
            title: '账号状态',
            dataIndex: 'status',
            // data - 后端返回的状态status 根据它做条件渲染
            // data  0:未登录 1:已登录 2：已封禁
            render: data => status[data]
        },
        {
            title: '操作',
            render: data => {
                return (
                    <Space className="operate-space" size="middle">
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

                        {/* 详情页 改为 点击账号栏触发 */}
                        {/* <Button type="primary" shape="circle">详情</Button> */}
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
                <Breadcrumb.Item>账号管理</Breadcrumb.Item>
            </Breadcrumb>}>
                <Search onSearch={onSearch} placeholder="输入账号搜索" style={{ width: 300 }} />
                <Button type='primary' style={{ float: "right" }} onClick={onCreateAccountConfirm}>
                    新建账号
                </Button>
            </Card>
            {/* 表格区域 */}
            <Card>
                <Table rowKey="id" columns={columns} dataSource={accountList} />
            </Card>
            {/* 账号详情对话框 */}
            <UserInfo open={accountModalOpen} onCancel={handleAccountModalCancel} items={items} />
            {/* 密码明文查看对话框 */}
            <Modal
                title="账号明文密码查看"
                closable={{ 'aria-label': 'Custom Close Button' }}
                open={passwordModalOpen}
                onCancel={handlePasswordModalCancel}
                footer={null}>

                <p>{realPassword}</p>
            </Modal>
            {/* 操作提示对话框 */}
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
            {/* 新建账号对话框 */}
            <Modal
                title="新建账号"
                closable={{ 'aria-label': 'Custom Close Button' }}
                open={createAccountModalOpen}
                onCancel={handleCreateAccountModalCancel}
                maskClosable={false}
                footer={null}>

                <Form
                    form={form}
                    onFinish={onFinish}
                    {...formItemLayout}>

                    <Form.Item label="账号" name="account"
                        rules={[
                            {
                                required: true,
                                message: '请输入账号!'
                            },
                            {
                                min: 6,
                                message: '账号长度不少于6!'
                            },
                            {
                                max: 20,
                                message: '账号长度不大于20!'
                            }, {
                                pattern: /^[a-zA-Z0-9_]+$/,
                                message: '账号只能包含字母、数字和下划线'
                            }
                        ]}>

                        <Space.Compact block>
                            <Input placeholder="请输入6-20位长度的字符账号" />
                        </Space.Compact>
                    </Form.Item>

                    <Form.Item label="邮箱" name="email"
                        rules={[
                            {
                                required: true,
                                message: '请输入邮箱!'
                            },
                            {
                                type: 'email',
                                message: '请输入正确的邮箱'
                            }
                        ]}>
                        <Space.Compact block>
                            <Input />
                        </Space.Compact>
                    </Form.Item>

                    <Form.Item label={null}>
                        <Button type="primary" htmlType="submit">
                            提交
                        </Button>
                        <Button style={{ marginLeft: "20px" }} key="back" onClick={handleCreateAccountModalCancel}>
                            返回
                        </Button>

                    </Form.Item>
                </Form>
            </Modal>
        </div>
    )
}

export default AccountManager