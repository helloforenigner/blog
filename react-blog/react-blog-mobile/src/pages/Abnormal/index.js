import { TextArea, Input, Card, Button, Space, Toast, Tag, List, SwipeAction, Dialog, CalendarPicker, Modal, SearchBar } from 'antd-mobile'
import { useState, useEffect, useRef } from 'react'
import { getAbnormalListAPI, getAbnormalDetailAPI, getSensitiveWordListAPI, addSensitiveWordAPI, deleteSensitiveWordAPI } from '@/apis/abnormal';
import { operationAccountStatusAPI } from '@/apis/account';
import dayjs from 'dayjs'

import './index.scss'

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
    const onSerch = () => {
        //console.log(values)
        setReqData({
            ...reqData,
            begin_date: searchDate[0] ? `${searchDate[0]} 00:00:00` : '',
            end_date: searchDate[1] ? `${searchDate[1]} 00:00:00` : ''
        })
        //reqData依赖项发生变化，重复执行副作用函数
    }

    // 状态标签
    const status = {
        0: <Tag color="warning">未登录</Tag>,
        1: <Tag color="success">已登录</Tag>,
        2: <Tag color="error">已封禁</Tag>
    }

    // 查看异常详情
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
    }


    // 用户管理操作
    const onOperateConfirm = async (account, operate) => {
        console.log(account, operate)
        await operationAccountStatusAPI({ account, operate })
    }



    //敏感词管理操作

    const [sensitiveList, setSensitiveList] = useState([])
    const [showSensitiveResult, setShowSensitiveResult] = useState(false);

    const [searchValue, setSearchValue] = useState('')



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
            Toast.show({ content: '未检索到敏感词信息' })
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
        await deleteSensitiveWordAPI(id)
        //console.log(res)
        //删除成功，重新渲染敏感词列表
        showSensitiveWordList('')
    }
    const ref = useRef(null)
    //异常信息滑动操作
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
                    },
                })
                ref.current?.close()
            }

        }
    ]
    ]
    //敏感词列表滑动操作
    const ref2 = useRef(null)
    const getActions = (id) => {
        return [
            {
                key: 'delete',
                text: '删除',
                color: 'danger',
                onClick: () => {
                    Dialog.confirm({
                        content: '确认要删除该敏感词吗?',
                        onConfirm: async () => {
                            await onDeleteSensitiveConfirm(id)
                            Toast.show({
                                icon: 'success',
                                content: '删除成功',
                                position: 'bottom',
                            })
                        },
                    })
                    ref2.current?.close()
                }

            }]
    }


    //日期选择器
    const defaultRange = [
        dayjs().toDate(),
        dayjs().add(2, 'day').toDate(),
    ]
    const [visible2, setVisible2] = useState(false)

    const [searchDate, setSearchDate] = useState([])



    return (
        <div className='abnormal-container' style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
            <div style={{ flex: '0 0 auto' }}>
                <Card title={
                    <div className="breadcrumbStyle">
                        <a href="/layout" className="breadcrumbItemStyle">首页</a>
                        <span className="breadcrumbSeparatorStyle">{'>'}</span>
                        <span>异常感知</span>
                        <span className='addAccount' >
                            <Button color='primary' size='small' onClick={() => showSensitiveWordList('')}>敏感词库管理</Button>
                        </span>
                    </div>
                }><Space><div>
                    <div
                        className='dataFilterInput'
                        onClick={() => {
                            setVisible2(true)
                        }}
                    >
                        <span><Input value={searchDate[0]} placeholder='起始日期' /></span>
                        <span><Input value={searchDate[1]} placeholder='结束日期' /></span>
                    </div>
                    <div className='dataFilter'><Button
                        color='primary'
                        fill='outline'
                        size='small'
                        onClick={onSerch}
                    >
                        搜索
                    </Button></div>

                    <CalendarPicker
                        visible={visible2}
                        defaultValue={defaultRange}
                        selectionMode='range'
                        onClose={() => setVisible2(false)}
                        onMaskClick={() => setVisible2(false)}
                        onChange={val => {
                            setSearchDate([dayjs(val[0]).format('YYYY-MM-DD'), dayjs(val[1]).format('YYYY-MM-DD')])
                        }}
                    />
                </div>
                    </Space>
                </Card>
            </div>
            {/* 表格区域 */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
                <List header='异常列表'>
                    {abnormalList.map(item => (
                        <SwipeAction
                            ref={ref}
                            rightActions={getRightActions(item.account)[item.status]}
                            closeOnAction={true}
                            closeOnTouchOutside={true}
                        >
                            <List.Item
                                key={item.id}>
                                <Card className='itemCard' onClick={() => showAbnormalDetail(item.id)}>
                                    <div>
                                        {status[item.status]}
                                    </div>
                                    <div>账号：{item.account}</div>
                                    <div>异常原因：{item.description}</div>
                                    <div>异常时间：{item.publishTime}</div>
                                </Card>
                            </List.Item>
                        </SwipeAction>
                    )
                    )}
                </List>
            </div>

            <Modal
                visible={abnormalModalOpen}
                title="异常详情"
                showCloseButton={true}
                onClose={handleAbnormalModalCancel}
                content={
                    <>
                        <div>账号：{abnormalInfo.account}</div>
                        <div>发布时间：{abnormalInfo.publish_time}</div>
                        <div>异常描述：{abnormalInfo.description}</div>
                        <div>详细异常信息：{<div dangerouslySetInnerHTML={{ __html: abnormalInfo.abnormal_detail }} />}</div>
                    </>

                }

            />

            <Modal
                visible={showSensitiveResult}
                title="敏感词库管理"
                showCloseButton={true}
                onClose={handleSensitiveResultCancel}
                content={
                    <>
                        <Card className='header-box'>

                            <SearchBar onChange={value => {
                                setSearchValue(value)
                            }}
                                placeholder="输入敏感词搜索" />
                            <Button
                                color='primary'
                                fill='outline'
                                onClick={() => showSensitiveWordList(searchValue)}
                                size='small'
                            >
                                搜索
                            </Button>

                            <Button style={{ marginLeft: 40 }} color='primary' size='small' onClick={onSensitiveAddConfirm}>添加敏感词</Button>

                        </Card>
                        <Card>
                            <List header='敏感词列表'>
                                {sensitiveList.map(item => (
                                    <SwipeAction
                                        ref={ref2}
                                        rightActions={getActions(item.id)}
                                        closeOnAction={true}
                                        closeOnTouchOutside={true}
                                    >
                                        <List.Item
                                            key={item.id}
                                            prefix={item.id}>
                                            {
                                                item.word
                                            }

                                        </List.Item>
                                    </SwipeAction>
                                )
                                )}
                            </List>
                        </Card>
                    </>

                }
            >
            </Modal>

            <Modal
                visible={showSensitiveAdd}
                title="敏感词添加"
                showCloseButton={true}
                onClose={handleSensitiveAddCancel}
                content={
                    <><div>
                        <TextArea
                            autoSize={{ minRows: 3, maxRows: 5 }}
                            value={sensitiveWords}
                            placeholder="请以规定格式键入敏感词，示例:暴力，血腥，色情"
                            onChange={(value) => setSensitiveWords(value)} />
                    </div>
                        <div>
                            <Button color='primary' fill='outline' onClick={handleSensitiveAddCancel}>
                                取消
                            </Button>,
                            <Button style={{ marginLeft: 40 }} color='primary' type="primary" onClick={handleAddSensitiveWords}>
                                确认添加
                            </Button>
                        </div></>}
                footer={[

                ]}
            >

            </Modal>
        </div>

    )
}

export default AbnormalDetect;