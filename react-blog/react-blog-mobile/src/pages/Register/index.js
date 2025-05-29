import { Card, Form, Input, Button } from 'antd-mobile'
import './index.scss'
import { useNavigate } from 'react-router-dom'
import { sendSmsCode, registerAPI } from '@/apis/user'
import CountdownTimer from '../../components/CountdownTimer'
import { useMemo, useState } from 'react'
import { AES_encrypt } from '@/utils/crypto'

export const Register = () => {
    const navigate = useNavigate()
    const [form] = Form.useForm();
    const onFinish = async (values) => {
        console.log(values)
        const { confirmPassword, ...restValues } = values;
        const reqData = {
            ...restValues,
            password: AES_encrypt(values.password),
        }
        const res = await registerAPI(reqData)
        if (res.data.code === 1) {
            //注册成功 进行跳转到登录页
            alert("注册成功")
            navigate('/')
        } else {
            alert(res.data.msg)
        }
    }
    //返回登录页
    const returnLogin = () => {
        navigate('/')
    }
    //发送验证码
    const sendCode = () => {

        const [validRes] = form.getFieldError('phone');
        const phone = form.getFieldValue('phone')

        if (validRes) {
            console.log(validRes)
        } else {
            console.log(phone)
            sendSmsCode({ phone })
        }
    }

    //密码强度校验
    const [password, setPassword] = useState('')
    const checkPasswordStrength = (password) => {
        if (password.length < 6) return 0

        const patterns = [
            /[0-9]/,       // 数字
            /[a-z]/,       // 小写字母
            /[A-Z]/,       // 大写字母
            /[.!_-]/       // 特殊字符
        ]

        return patterns.reduce((strength, pattern) =>
            pattern.test(password) ? strength + 1 : strength, 0
        )
    }

    const passwordStrength = useMemo(() => { return checkPasswordStrength(password) }, [password])

    const onChange = (value) => {
        //console.log(value)
        setPassword(value)
        //console.log(checkPasswordStrength(password))
    }

    return (
        <div className="register">
            <Card title="用户注册" className="register-container">
                <Form form={form} validateTrigger="onBlur" onFinish={onFinish}>
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
                    <Form.Item
                        label="密码"
                        name="password"
                        validateFirst={true}
                        rules={[{
                            required: true,
                            message: '请输入密码!'
                        },
                        {
                            min: 6,
                            message: '密码长度不小于6!'
                        },
                        {
                            max: 16, message: '密码长度不大于16!'
                        },
                        {
                            pattern: /^[a-zA-Z0-9_]+$/,
                            message: '密码只能包含字母、数字和下划线'
                        },
                        // 添加自定义校验规则
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                const currentPassword = value || getFieldValue('password');
                                const strength = checkPasswordStrength(currentPassword);
                                if (strength >= 3) {
                                    return Promise.resolve();
                                }
                                return Promise.reject(new Error('密码强度过低，存在安全隐患！'));
                            },
                        })]}>

                        <Input placeholder='请输入6-16位长度密码' clearable type='password' onChange={onChange} />
                    </Form.Item>
                    <div className='strength-meter-bar'>
                        <div className='strength-meter-bar--fill' data-score={passwordStrength}></div>
                    </div>
                    <Form.Item

                        label="确认密码"
                        name="confirmPassword"
                        validateFirst={true}
                        dependencies={['password']} //当关联字段的值发生变化时，会触发校验与更新
                        rules={[{
                            required: true,
                            message: '请再次输入密码!'
                        },
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                if (!value || getFieldValue('password') === value) {
                                    return Promise.resolve();
                                }
                                return Promise.reject(new Error('两次输入的密码不一致，请重试！'));
                            },
                        }),
                        ]}>
                        <Input size="large" clearable type='password' placeholder="请再次输入上面的密码!" />
                    </Form.Item>

                    <Form.Item
                        label="手机号"
                        name="phone"
                        validateFirst={true}
                        rules={[
                            {
                                required: true,
                                message: '请输入手机号!'
                            },
                            {
                                pattern: /^1[3-9]\d{9}$/,
                                message: '请输入正确的手机号'
                            }
                        ]}>
                        <Input size="large" placeholder="请输入手机号" />
                    </Form.Item>
                    <Form.Item
                        label="验证码"
                        name="smscode"
                        layout='vertical'>
                        <Input placeholder="输入验证码" />
                    </Form.Item>
                    <CountdownTimer
                        startTimerFinish={sendCode}
                        initialSeconds={60} />
                    <Form.Item className='button-box'>
                        <Button color='primary' fill='solid' type='submit'>
                            注册
                        </Button>
                        <Button onClick={returnLogin} className='retrun-button' color='primary' fill='outline'>
                            返回登录
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    )
}