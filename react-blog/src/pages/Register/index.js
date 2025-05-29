import { Card, Form, Input, Button, Row, Col, message, notification } from 'antd'
import './index.scss'
import { useNavigate } from 'react-router-dom'
import { sendSmsCode, registerAPI } from '@/apis/user'
import CountdownTimer from '@/components/CountdownTimer'
import { useMemo, useState } from 'react'
import { AES_encrypt } from '@/utils/crypto'

export const Register = () => {
    const navigate = useNavigate()
    const [form] = Form.useForm();

    const [countdown, setCountdown] = useState(3); // 初始化倒计时为 3 秒
    const onFinish = async (values) => {
        const { confirmPassword, ...restValues } = values;
        const reqData = {
            ...restValues,
            password: AES_encrypt(values.password),
        }
        const res = await registerAPI(reqData)
        if (res.data.code === 1) {
            //注册成功 进行跳转到登录页
            const key = `register_${Date.now()}`;
            notification.info({
                message: '注册成功',
                description: `${countdown} 秒后自动跳转至登录页`,
                key,
                duration: 0
            });
            const timer = setInterval(() => {
                setCountdown(prevCountdown => {
                    const newCountdown = prevCountdown - 1;
                    if (newCountdown <= 0) {
                        clearInterval(timer);
                        notification.destroy(key);
                        navigate('/');
                    } else {
                        notification.info({
                            message: '注册成功',
                            description: `${newCountdown} 秒后自动跳转至登录页`,
                            key,
                            duration: 0
                        });
                    }
                    return newCountdown;
                });
            }, 1000);
        } else {
            message.error(res.data.msg)
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

    const onChange = (e) => {
        setPassword(e.target.value)
        console.log(checkPasswordStrength(password))
    }


    const formItemLayout = {
        labelCol: {
            xs: { span: 24 },
            sm: { span: 6 },
        },
        wrapperCol: {
            xs: { span: 24 },
            sm: { span: 18 },
        },
    };

    const tailFormItemLayout = {
        wrapperCol: {
            xs: {
                span: 24,
                offset: 0,
            },
            sm: {
                span: 16,
                offset: 6,
            },
        },
    };
    return (
        <div className="register">
            <Card title="用户注册" className="register-container">
                <Form {...formItemLayout} form={form} validateTrigger="onBlur" onFinish={onFinish}>
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
                        })
                        ]}>
                        <Input.Password value={password} size="large" placeholder="请输入6-16位长度密码" onChange={onChange} />

                    </Form.Item>
                    <div className='strength-meter-bar'>
                        <div className='strength-meter-bar--fill' data-score={passwordStrength}></div>
                    </div>
                    <Form.Item
                        label="确认密码"
                        name="confirmPassword"
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
                        <Input.Password size="large" placeholder="请再次输入上面的密码!" />
                    </Form.Item>

                    <Form.Item
                        label="手机号"
                        name="phone"


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
                        name="smscode">
                        <Row gutter={6}>
                            <Col span={12}>
                                <Input placeholder="输入验证码" />
                            </Col>
                            <Col span={12}>
                                <CountdownTimer
                                    startTimerFinish={sendCode}
                                    initialSeconds={60} />
                            </Col>
                        </Row>
                    </Form.Item>
                    <Form.Item {...tailFormItemLayout}>
                        <Row gutter={6}>
                            <Col span={12}>
                                <Button type="primary" htmlType="submit" size="large">
                                    注册
                                </Button>
                            </Col>
                            <Col span={12}>
                                <Button onClick={returnLogin} className='retrun-button' type="primary" htmlType="button" size="large">
                                    返回登录
                                </Button>
                            </Col>
                        </Row>


                    </Form.Item>
                </Form>
            </Card>
        </div>
    )
}