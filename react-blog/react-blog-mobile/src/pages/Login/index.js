import { Card, Form, Input, Button, Modal, Toast, Selector } from 'antd-mobile'
import './index.scss'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { useState } from 'react'
import { getCaptchaAPI, sliderVerifyPassAPI } from '@/apis/user'
import { AES_encrypt } from '@/utils/crypto'
import { fetchLogin } from '@/store/modules/user'
import Slider from '@/pages/Login/components/SliderVerify'


export const Login = () => {
    const navigate = useNavigate()

    const dispatch = useDispatch()

    const [role, setRole] = useState(0)

    const [accountState, setAccountState] = useState('')


    const [showModal, setShowModal] = useState(false)
    const [showSlider, setShowSlider] = useState(false)
    const [verifySuccess, setVerifySuccess] = useState(false)
    const register = () => {
        navigate('/register')
    }

    //登录角色切换
    const loginRoleChange = (value) => {
        console.log(value[0]);
        setRole(value[0])
    }


    //登录逻辑
    const onFinish = async (values) => {
        //是否需要滑块验证操作
        const account = values.account
        const encrypt_password = AES_encrypt(values.password)//密码加密
        setAccountState(account)
        const reqData = {
            account,
            password: encrypt_password,
            tags: role
        }

        const captchaRes = await getCaptchaAPI(reqData)

        if (captchaRes.data.code === 1) {
            const res = await dispatch(fetchLogin({ ...values, password: encrypt_password, tags: role }))
            if (res.data.code === 1) {
                //角色标签存储会话
                sessionStorage.setItem('role', role)
                alert("登录成功")
                if (role === 0) {
                    //navigate('/home')
                    navigate('/layout')
                } else {
                    navigate('/layout')
                }

            } else {
                alert(res.data.msg)
            }
        } else {
            setShowModal(true)
            setShowSlider(true)
        }
        //console.log(res)
    }


    //滑块验证结果回调
    const resultClick = (e) => {
        if (e === 0) {
            console.log('成功');
            setTimeout(() => {
                setShowSlider(false)
                setVerifySuccess(true)
                sliderVerifyPassAPI({ account: accountState })
            }, 600);

        } else if (e === 1) {
            console.log('失败');
        }
    }

    return (
        <div className="login">

            <Card title="blog管理系统" className="login-container">
                <Selector className="login-selector"
                    style={{
                        '--border-radius': '100px',
                        '--border': 'solid transparent 1px',
                        '--checked-border': 'solid var(--adm-color-primary) 1px',
                        '--padding': '8px 24px',
                    }}
                    options={[
                        {
                            label: '用户登录',
                            value: 0,
                        },
                        {
                            label: '超管登录',
                            value: 1,
                        },
                    ]}
                    showCheckMark={false}
                    defaultValue={0}
                    onChange={loginRoleChange}
                />

                <Form onFinish={onFinish}>
                    <Form.Item
                        label="账号"
                        name="account"
                        rules={[{ required: true, message: '请输入账号!' }]}>
                        <Input size="large" placeholder="请输入账号" />
                    </Form.Item>
                    <Form.Item
                        label="密码"
                        name="password"
                        rules={[{ required: true, message: '请输入密码!' }]}>
                        <Input placeholder='请输入密码' clearable type='password' />
                    </Form.Item>
                    <Form.Item className='button-box'>
                        <Button color='primary' fill='solid' type='submit'>
                            立即登录
                        </Button>
                        {role === 0 ? <Button onClick={register} className='register-button' color='primary' fill='outline'>
                            注册
                        </Button> : null}
                    </Form.Item>

                </Form>

            </Card>


            <Modal
                visible={showModal}
                title="滑块验证"
                closeOnMaskClick={false}
                showCloseButton={true}
                onClose={() => {
                    setShowModal(false)
                    setVerifySuccess(false)
                }}
                content={
                    <>
                        <Slider showSlider={showSlider} resultClick={resultClick} />
                        {verifySuccess ? <p>验证成功，请返回继续登录！</p> : null}
                    </>
                }

            >

            </Modal>
        </div>
    )
}