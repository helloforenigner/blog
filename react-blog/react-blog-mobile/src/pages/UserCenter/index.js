import { useState, useEffect, useMemo } from 'react';
import { Button, Card, Input, ImageUploader, Form, Toast, TextArea, Modal, Dialog } from 'antd-mobile';
import { uploadFileAPI } from '@/apis/file';
import { getUserInfoAPI, changePasswordAPI, editUserInfoAPI, sendSmsCode } from '@/apis/user';
import { useNavigate } from 'react-router-dom';
import CountdownTimer from '@/components/CountdownTimer'
import { AES_encrypt } from '@/utils/crypto'
import { logoutAPI } from '@/apis/user'
import { clearUserInfo } from '@/store/modules/user'
import { useDispatch } from "react-redux";
import './index.scss';





const UserCenter = () => {

    const navigate = useNavigate();

    const [editMode, setEditMode] = useState(false);

    // 修改密码弹窗相关
    const [pswModalOpen, setPswModalOpen] = useState(false);
    const [pswForm] = Form.useForm();


    //发送验证码
    const sendCode = async () => {
        await sendSmsCode({ phone: userInfo.phone })
    }





    // 头像上传
    const [imageUrl, setImageUrl] = useState('');
    const [fileList, setFileList] = useState([])

    const uploadImage = async (file) => {
        let formData = new FormData()
        formData.append('image', file)
        const res = await uploadFileAPI(formData)
        const url = res.data.data;
        if (url) {
            setImageUrl(url);
            // 上传成功后，调用后端接口保存图片地址
            editUserInfoAPI({
                picture: url,
                profile: userInfo.profile,
                name: userInfo.name
            });
            return { url };
        } else {
            Toast.show({
                content: '未获取到有效的图片 URL，请检查后端响应',
            });
        }
    }


    //获取用户空间信息
    const [userInfo, setUserInfo] = useState({});

    useEffect(() => {
        const getUserInfo = async () => {
            const res = await getUserInfoAPI();
            setUserInfo(res.data.data);
            setFileList([{ url: res.data.data.picture }]);
        };
        getUserInfo();
    }, []);


    // 保存用户信息（用户名、简介）
    const handleSave = async () => {
        // 这里可以调用后端API进行保存
        const res = await editUserInfoAPI({
            picture: imageUrl,
            profile: userInfo.profile,
            name: userInfo.name
        });
        if (res.data.code === 1) {
            Toast.show({ content: "用户信息已保存" })
            setUserInfo({ ...userInfo });
            setEditMode(false);
        } else {
            Toast.show({ content: "用户信息保存失败" })
        }

    };

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
        setPassword(value)
    }

    // 修改密码提交
    const handleChangePassword = async () => {
        try {
            const values = await pswForm.validateFields();

            const res = await changePasswordAPI({
                phone: userInfo.phone,
                smscode: values.smscode,
                newCode: AES_encrypt(values.password)
            });
            if (res.data.code === 1) {
                Toast.show({ content: "密码修改成功，请重新登录" })
                setPswModalOpen(false);
                pswForm.resetFields();
            } else {
                Toast.show({ content: res.data.msg })
                return;
            }
            // 可选：登出并跳转登录页
            // navigate('/login');
        } catch (err) {
            // 校验失败或API报错
        }
    };

    //登出系统
    const dispatch = useDispatch()
    const loginOut = () => {
        Dialog.confirm({
            content: '是否确认登出?',
            onConfirm: async () => {
                await logoutAPI()
                dispatch(clearUserInfo())
                navigate('/')
                Toast.show({
                    icon: 'success',
                    content: '登出成功',
                    position: 'bottom',
                })
            },
        })
    }

    return (<div className="user-center">
        <Card title={<h2 style={{ textAlign: 'center' }}>用户空间</h2>} className="container">
            <div className='avatar-box'>
                <ImageUploader
                    value={fileList}
                    onChange={setFileList}
                    upload={(file) => uploadImage(file)}
                    maxCount={1}
                />
            </div>
            <div className='user-name' style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '16px' }}>
                {editMode ? (
                    <Input
                        value={userInfo.name}
                        onChange={value => setUserInfo({ ...userInfo, name: value })}
                        style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '16px', width: 180, margin: '0 auto' }}
                    />
                ) : (
                    <span>{userInfo.name}</span>
                )}
            </div>

            <div className='user-content'>
                <p>用户账号：{userInfo.account}</p>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ marginRight: 8 }}>手机号：</span>
                    <span style={{ width: 120, marginRight: 8 }}>{userInfo.phone}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ marginRight: 8 }}>注册时间：</span>
                    <span>{userInfo.dateTime}</span>
                </div>
            </div>

            <div className='user-profile'>
                <p className='user-profile-title'>用户简介：</p>
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '0px' }}>
                    {editMode ? (
                        <TextArea
                            className='user-profile-content user-profile-box'
                            value={userInfo.profile}
                            onChange={value => setUserInfo({ ...userInfo, profile: value })}
                            autoSize={{ minRows: 5, maxRows: 5 }}
                        />
                    ) : (
                        <div className='user-profile-content user-profile-box'>
                            {userInfo.profile || <span style={{ color: '#bbb' }}>暂无简介</span>}
                        </div>
                    )}
                </div>
            </div>
            <div className='user-action'>
                {editMode ? (
                    <Button color='primary' fill='outline' onClick={handleSave}>保存</Button>
                ) : (
                    <Button color='primary' fill='outline' onClick={() => setEditMode(true)}>编辑</Button>
                )}
                <Button color='primary' fill='solid' onClick={() => setPswModalOpen(true)}>修改密码</Button>
                <Button onClick={() => navigate('/layout')}>返回首页</Button>
            </div>

        </Card>

        <Button
            color='primary' fill='outline'
            onClick={loginOut}
            style={{

                position: 'absolute',
                top: '16px',
                right: '16px',
                zIndex: 1
            }}
        >
            登出
        </Button>



        <Modal
            visible={pswModalOpen}
            title="修改密码"
            showCloseButton={true}
            onClose={() => setPswModalOpen(false)}
            content={
                <>
                    <Form form={pswForm} layout="vertical">
                        <Form.Item
                            label="手机号"
                            name="phone"
                        >
                            <Input size="large" disabled={true} defaultValue={userInfo.phone} />
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
                        <Form.Item

                            label="新密码"
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
                            <Input type='password' size="large" placeholder="请输入6-16位长度密码" onChange={onChange} />

                        </Form.Item>
                        <div className='strength-meter-bar'>
                            <div className='strength-meter-bar--fill' data-score={passwordStrength}></div>
                        </div>
                        <Form.Item
                            label="确认新密码"
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
                            <Input type='password' size="large" placeholder="请再次输入上面的密码!" />
                        </Form.Item>
                        <Form.Item className='button-box'>
                            <Button onClick={handleChangePassword} color='primary' fill='solid' >
                                确定
                            </Button>
                            <Button onClick={() => setPswModalOpen(false)} className='retrun-button' color='primary' fill='outline'>
                                取消
                            </Button>
                        </Form.Item>
                    </Form>
                </>
            }
        >

        </Modal>


    </div>);
}

export default UserCenter;