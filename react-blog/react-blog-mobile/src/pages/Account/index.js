import { Form, Input, Card, Button, SearchBar, Space, Toast, Tag, List, SwipeAction, Dialog, Modal } from 'antd-mobile'
import { useState, useEffect, useRef } from 'react';
import { getAccountListAPI, getAccountDetailAPI, operationAccountStatusAPI, createAccountAPI } from '@/apis/account'
import { AES_decrypt } from '@/utils/crypto'
import './index.scss'


const AccountManager = () => {

    // 新增状态来存储搜索框的值
    const [searchValue, setSearchValue] = useState('')

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
                Toast.show({
                    icon: 'success',
                    content: '未检索到账号信息',
                    position: 'bottom',
                })
            }
            //console.log(res.data.data.results)
        }
        //调用函数
        getAccountList()
    }, [reqData])

    //3、搜索功能
    const onSearch = () => {
        setReqData({
            ...reqData,
            account: searchValue
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



    const showAccountDetail = async (account, password) => {
        const res = await getAccountDetailAPI(account)
        //console.log(res)
        setAccountInfo({ ...res.data.data, password })
        setAccountModalOpen(true);
    }



    // 用户管理操作
    const onOperateConfirm = async (account, operate) => {
        console.log(account, operate)
        const res = await operationAccountStatusAPI({ account, operate })
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

        console.log(values)
        const res = await createAccountAPI(values)
        //console.log(res)
        Toast.show({ content: res.data.message })
        //清空表单
        form.resetFields();
    }

    const ref = useRef(null)

    //滑动操作
    const getRightActions = (account) => [[
        {
            key: 'prohibit',
            text: '封禁',
            color: 'danger',
            onClick: () => {
                Dialog.confirm({
                    content: '确认要封禁该用户吗?',
                    onConfirm: async () => {
                        await onOperateConfirm(account, 1)
                        Toast.show({
                            icon: 'success',
                            content: '操作成功',
                            position: 'bottom',
                        })
                        setReqData({ ...reqData })
                    },
                })
                ref.current?.close()
            }

        }
    ],
    [
        {
            key: 'kickOut',
            text: '踢蹬',
            color: 'warning',
            onClick: () => {
                Dialog.confirm({
                    content: '确认要踢蹬该用户吗?',
                    onConfirm: async () => {
                        await onOperateConfirm(account, 2)
                        Toast.show({
                            icon: 'success',
                            content: '操作成功',
                            position: 'bottom',
                        })
                        setReqData({ ...reqData })
                    }
                })
                ref.current?.close()
            }
        },
        {
            key: 'prohibit',
            text: '封禁',
            color: 'danger',
            onClick: () => {
                Dialog.confirm({
                    content: '确认要封禁该用户吗?',
                    onConfirm: async () => {
                        await onOperateConfirm(account, 1)
                        Toast.show({
                            icon: 'success',
                            content: '操作成功',
                            position: 'bottom',
                        })
                        setReqData({ ...reqData })
                    },
                })
                ref.current?.close()
            }

        }
    ],
    [
        {
            key: 'revive',
            text: '解封',
            color: 'success',
            onClick: () => {
                Dialog.confirm({
                    content: '确认要解封该用户吗?',
                    onConfirm: async () => {
                        await onOperateConfirm(account, 0)
                        Toast.show({
                            icon: 'success',
                            content: '操作成功',
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


    return (
        <div className='account-container' style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
            <div style={{ flex: '0 0 auto' }}>
                <Card title={
                    <div className="breadcrumbStyle">
                        <a href="/layout" className="breadcrumbItemStyle">首页</a>
                        <span className="breadcrumbSeparatorStyle">{'>'}</span>
                        <span>账号管理</span>
                        <span className='addAccount' >
                            <Button color='primary' size='small' onClick={onCreateAccountConfirm}>新建账号</Button>
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
                <List header='账号列表'>
                    {accountList.map(item => (
                        <SwipeAction
                            ref={ref}
                            rightActions={getRightActions(item.account)[item.status]}
                            closeOnAction={true}
                            closeOnTouchOutside={true}
                        >
                            <List.Item
                                key={item.id}>
                                <Card className='itemCard' onClick={() => showAccountDetail(item.account, item.password)}>
                                    <div>
                                        {status[item.status]}
                                    </div>
                                    <div>账号：{item.account}</div>
                                    <div>手机号：{item.phone}</div>
                                    <div>密码：********</div>
                                </Card>
                            </List.Item>
                        </SwipeAction>
                    )
                    )}
                </List>
            </div>

            <Modal
                visible={accountModalOpen}
                title="账号详情"
                showCloseButton={true}
                onClose={handleAccountModalCancel
                }
                content={
                    <>
                        <div>账号：{accountInfo.account}</div>
                        <div>昵称：{accountInfo.username}</div>
                        <div>手机号：{accountInfo.phone}</div>
                        <div onClick={() => Toast.show({ content: AES_decrypt(accountInfo.password) })}>密码：********</div>
                        <div>账号状态：{status[accountInfo.status]}</div>
                        <div>创建时间：{accountInfo.createdAt}</div>
                        <div>更新时间：{accountInfo.updatedAt}</div>
                        <div>用户简介：{accountInfo.profile}</div>
                    </>

                }

            />

            <Modal
                visible={createAccountModalOpen}
                title="新建账号"
                showCloseButton={true}
                onClose={handleCreateAccountModalCancel}
                content={
                    <>
                        <Form
                            form={form}
                            onFinish={onFinish}
                        >
                            <Form.Item
                                label="账号"
                                name="account"
                                validateFirst={true}
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
                                <Input size="large" placeholder="请输入6-20位长度账号" />
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
                                <Input placeholder="请输入邮箱" />

                            </Form.Item>

                            <Form.Item label={null}>
                                <Button color='primary' fill='solid' type='submit'>
                                    提交
                                </Button>
                                <Button style={{ marginLeft: "20px" }} color='primary' fill='outline' onClick={handleCreateAccountModalCancel}>
                                    返回
                                </Button>

                            </Form.Item>
                        </Form>
                    </>

                }

            />

        </div >
    )
}

export default AccountManager