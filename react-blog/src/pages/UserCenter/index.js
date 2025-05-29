import { useState, useEffect, useMemo } from 'react';
import { LoadingOutlined, PlusOutlined, EditOutlined, KeyOutlined, DoubleLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { Card, message, Upload, Form, FloatButton, Modal, Input, Row, Col } from 'antd';
import ImgCrop from 'antd-img-crop';
import { getUserInfoAPI, changePasswordAPI, editUserInfoAPI, sendSmsCode } from '@/apis/user';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux'
import CountdownTimer from '@/components/CountdownTimer'
import { AES_encrypt } from '@/utils/crypto'
import { logoutAPI } from '@/apis/user'
import { clearUserInfo } from '@/store/modules/user'
import './index.scss';





const UserCenter = () => {
    const [loading, setLoading] = useState(false);
    const [imageUrl, setImageUrl] = useState('');

    const navigate = useNavigate();

    const [editMode, setEditMode] = useState(false);

    // 修改密码弹窗相关
    const [pswModalOpen, setPswModalOpen] = useState(false);
    const [pswForm] = Form.useForm();


    //发送验证码
    const sendCode = async () => {
        const res = await sendSmsCode({ phone: userInfo.phone })
        console.log(res)
    }



    // 图片上传前的校验
    const beforeUpload = file => {
        const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
        if (!isJpgOrPng) {
            message.error('You can only upload JPG/PNG file!');
        }
        const isLt2M = file.size / 1024 / 1024 < 2;
        if (!isLt2M) {
            message.error('Image must smaller than 2MB!');
        }
        return isJpgOrPng && isLt2M;
    };

    // 头像上传
    const handleChange = info => {
        if (info.file.status === 'uploading') {
            setLoading(true);
            return;
        }
        if (info.file.status === 'done') {
            // Get this url from response in real world.
            console.log(info.file.response);
            const url = info.file.response.data;
            if (url) {
                setLoading(false);
                setImageUrl(url);
                // 上传成功后，调用后端接口保存图片地址
                editUserInfoAPI({
                    picture: url,
                    profile: userInfo.profile,
                    name: userInfo.name
                });
            } else {
                message.error('未获取到有效的图片 URL，请检查后端响应');
            }
        } else if (info.file.status === 'error') {
            message.error('图片上传失败，请重试');
            setLoading(false);
        }
    };

    const uploadButton = (
        <button style={{ border: 0, background: 'none' }} type="button">
            {loading ? <LoadingOutlined /> : <PlusOutlined />}
            <div style={{ marginTop: 8 }}>Upload</div>
        </button>
    );

    //获取用户空间信息
    const [userInfo, setUserInfo] = useState({});

    useEffect(() => {
        const getUserInfo = async () => {
            const res = await getUserInfoAPI();
            setUserInfo(res.data.data);
            setImageUrl(res.data.data.picture);
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
            message.success('用户信息已保存');
            setUserInfo({ ...userInfo });
            setEditMode(false);
        } else {
            message.error('用户信息保存失败');
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

    const onChange = (e) => {
        setPassword(e.target.value)
        console.log(checkPasswordStrength(password))
    }
    //登出操作
    const dispatch = useDispatch()
    const logout = async () => {
        await logoutAPI()
        dispatch(clearUserInfo())
        navigate('/')
    }

    // 修改密码提交
    const handleChangePassword = async () => {
        try {
            const values = await pswForm.validateFields();
            // if (values.newPassword !== values.confirmPassword) {
            //     message.error('两次输入的新密码不一致');
            //     return;
            // }
            // 调用后端API
            //console.log(values)
            const res = await changePasswordAPI({
                phone: userInfo.phone,
                smscode: values.smscode,
                newCode: AES_encrypt(values.password)
            });
            if (res.data.code === 1) {
                message.success('密码修改成功，请重新登录');
                setPswModalOpen(false);
                pswForm.resetFields();
                logout();

            } else {
                message.error(res.data.msg);
                return;
            }


            // 可选：登出并跳转登录页
            // navigate('/login');
        } catch (err) {
            // 校验失败或API报错
        }
    };

    return (<div className="user-center">
        <Card className="container">
            <div className='avatar-box'>
                <ImgCrop rotationSlider>
                    <Upload
                        name="image"
                        listType="picture-circle"
                        className="avatar-uploader"
                        showUploadList={false}
                        action="http://localhost:8085/file/upload"
                        beforeUpload={beforeUpload}
                        onChange={handleChange}
                    >

                        {imageUrl ? <img className='avatar-image' src={imageUrl} alt="avatar" style={{ width: '100%' }} /> : uploadButton}
                    </Upload>
                </ImgCrop>
            </div>

            <div className='user-name' style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '20px', marginTop: '16px' }}>
                {editMode ? (
                    <Input
                        value={userInfo.name}
                        onChange={e => setUserInfo({ ...userInfo, name: e.target.value })}
                        style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '20px', width: 180, margin: '0 auto' }}
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
                        <Input.TextArea
                            className='user-profile-content user-profile-box'
                            value={userInfo.profile}
                            onChange={e => setUserInfo({ ...userInfo, profile: e.target.value })}
                            autoSize={{ minRows: 5, maxRows: 5 }}
                        />
                    ) : (
                        <div className='user-profile-content user-profile-box'>
                            {userInfo.profile || <span style={{ color: '#bbb' }}>暂无简介</span>}
                        </div>
                    )}
                </div>
            </div>

            {/* 新增保存浮动按钮，仅编辑模式下显示 */}
            {editMode && (
                <FloatButton
                    className='float-button-save'
                    tooltip={<div>保存信息</div>}
                    icon={<SaveOutlined />}
                    onClick={handleSave}
                />
            )}

            <FloatButton
                className='float-button-edit'
                tooltip={<div>修改信息</div>}
                icon={<EditOutlined />}
                onClick={() => setEditMode(true)} />
            <FloatButton
                className='float-button-modify-psw'
                tooltip={<div>修改密码</div>}
                icon={<KeyOutlined />}
                onClick={() => setPswModalOpen(true)} />
            <FloatButton
                className='float-button-return'
                tooltip={<div>返回首页</div>}
                icon={<DoubleLeftOutlined />}
                onClick={() => navigate('/layout')} />

        </Card>


        <Modal
            open={pswModalOpen}
            title="修改密码"
            onCancel={() => setPswModalOpen(false)}
            onOk={handleChangePassword}
            okText="确定"
            cancelText="取消"
        >
            <Form form={pswForm} layout="vertical">
                <Form.Item
                    label="手机号"
                    name="phone"
                >
                    <Input size="large" disabled={true} defaultValue={userInfo.phone} />
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
                    <Input.Password value={password} size="large" placeholder="请输入6-16位长度密码" onChange={onChange} />

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
                    <Input.Password size="large" placeholder="请再次输入上面的密码!" />
                </Form.Item>
            </Form>
        </Modal>

    </div>);
}

export default UserCenter;