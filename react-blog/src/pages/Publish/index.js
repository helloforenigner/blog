import {
    Card,
    Breadcrumb,
    Form,
    Button,
    Modal,
    Input,
    message
} from 'antd'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import debounce from 'lodash.debounce'
import './index.scss'

import { createBlogAPI, getBlogDetailAPI, editBlogAPI } from '@/apis/content'
import SlateEditorWithHighlightAndImage, { deserializeHTML, serializeNode } from './SlateEditorWithHighlightAndImage';

const DEFAULT_NODES = [{ type: 'paragraph', children: [{ text: '' }] }];

const Publish = () => {
    //编辑blog时跳转回填数据
    const [searchParams] = useSearchParams()
    const blogId = searchParams.get('id')

    // 获取表单实例
    const [form] = Form.useForm()

    // 路由跳转
    const navigate = useNavigate()


    const [showModal, setShowModal] = useState(false)
    const [editorContent, setEditorContent] = useState(() => {
        const saved = sessionStorage.getItem('editorDraft')
        return saved ? JSON.parse(saved) : DEFAULT_NODES
    })
    const [titleDraft, setTitleDraft] = useState(() => sessionStorage.getItem('titleDraft') || "")
    const role = sessionStorage.getItem('role')

    // 添加保存状态提示
    const [saveStatus, setSaveStatus] = useState('');
    const saveTimerRef = useRef(null);

    // 使用 ref 跟踪当前是否是编辑模式
    const isEditMode = useRef(!!blogId)

    const [loaded, setLoaded] = useState(!blogId)

    // 自动保存草稿的防抖函数
    const saveDraftDebounced = useCallback(
        debounce((content, title) => {
            // 先显示保存中状态
            setSaveStatus('正在保存草稿...')

            try {
                sessionStorage.setItem('editorDraft', JSON.stringify(content))
                sessionStorage.setItem('titleDraft', title)

                // 保存成功后更新状态
                setSaveStatus('已自动保存草稿')
            } catch (error) {
                // 处理潜在的存储错误
                console.error('保存草稿失败:', error)
                setSaveStatus('保存失败，空间不足')
                message.error('保存草稿失败，本地存储空间可能不足')
            }

            // 清除之前的定时器
            if (saveTimerRef.current) {
                clearTimeout(saveTimerRef.current)
            }

            // 3秒后清除提示
            saveTimerRef.current = setTimeout(() => {
                setSaveStatus('')
            }, 2000)
        }, 3000), // 延长到3秒，减少保存频率
        []
    )

    // 手动保存草稿函数
    const saveDraftManually = () => {
        try {
            // 存储当前时间，用于恢复到特定版本
            const timestamp = new Date().toISOString();
            const saveData = {
                content: editorContent,
                title: titleDraft,
                timestamp
            };

            sessionStorage.setItem('editorDraft', JSON.stringify(editorContent));
            sessionStorage.setItem('titleDraft', titleDraft);

            // 保存额外的版本历史 (最多保留5个版本)
            const historyKey = `editorDraft_history_${Date.now()}`;
            sessionStorage.setItem(historyKey, JSON.stringify(saveData));

            // 获取所有历史版本键
            const allKeys = [];
            for (let i = 0; i < sessionStorage.length; i++) {
                const key = sessionStorage.key(i);
                if (key.startsWith('editorDraft_history_')) {
                    allKeys.push(key);
                }
            }

            // 如果历史版本超过5个，删除最旧的
            if (allKeys.length > 5) {
                allKeys.sort();
                sessionStorage.removeItem(allKeys[0]);
            }

            message.success('草稿已手动保存');
        } catch (error) {
            console.error('手动保存失败:', error);
            message.error('保存草稿失败，本地存储空间可能不足');
        }
    };

    // 恢复到上一个保存点
    const restoreDraft = () => {
        try {
            const savedContent = sessionStorage.getItem('editorDraft');
            const savedTitle = sessionStorage.getItem('titleDraft');

            if (savedContent && savedTitle) {
                const parsedContent = JSON.parse(savedContent);
                setEditorContent(parsedContent);
                setTitleDraft(savedTitle);
                form.setFieldsValue({
                    title: savedTitle,
                    content: parsedContent
                });
                message.success('已恢复到上次保存的草稿');
            } else {
                message.info('没有找到保存的草稿');
            }
        } catch (error) {
            console.error('恢复草稿失败:', error);
            message.error('恢复草稿失败，数据可能已损坏');
        }
    }

    const handleChangeTitle = (e) => {
        //console.log(e.target.value)
        sessionStorage.setItem('titleDraft', e.target.value);
    }


    // 清除所有草稿数据
    const clearAllDrafts = () => {
        // 清除基本草稿
        sessionStorage.removeItem('editorDraft');
        sessionStorage.removeItem('titleDraft');

        // 清除所有历史版本草稿
        const keysToRemove = [];
        for (let i = 0; i < sessionStorage.length; i++) {
            const key = sessionStorage.key(i);
            if (key.startsWith('editorDraft_history_')) {
                keysToRemove.push(key);
            }
        }


        // 分开移除，避免在迭代过程中修改集合
        keysToRemove.forEach(key => sessionStorage.removeItem(key));

        // 重置编辑器状态
        setEditorContent(DEFAULT_NODES);
        setTitleDraft("");
        form.resetFields(['title', 'content']);
    };

    // 清除定时器以防内存泄漏
    useEffect(() => {
        return () => {
            if (saveTimerRef.current) {
                clearTimeout(saveTimerRef.current)
            }
        }

    }, [])

    // 内容变化时自动保存草稿
    useEffect(() => {
        saveDraftDebounced(editorContent, titleDraft)
    }, [editorContent, titleDraft, saveDraftDebounced])

    // 处理模式切换和初始数据加载
    useEffect(() => {
        if (blogId) {
            // 从新建切换到编辑模式时清除草稿
            if (!isEditMode.current) {
                clearAllDrafts();
            }
            // 拉取编辑内容并填充
            const fetchDetail = async () => {
                const res = await getBlogDetailAPI(blogId)
                const data = res.data.data
                const nodes = deserializeHTML(data.content)
                setEditorContent(nodes)
                setTitleDraft(data.title)
                form.setFieldsValue({ title: data.title, content: nodes })
                setLoaded(true);
            }
            fetchDetail()
            isEditMode.current = true
        } else {
            // 从编辑切换到新建模式时清除草稿并重置
            if (isEditMode.current) {
                clearAllDrafts();
            } else {
                // 新建博客时检查是否应该使用草稿
                const shouldUseDraft = sessionStorage.getItem('shouldUseDraft');
                if (shouldUseDraft !== 'true') {
                    // 如果不应该使用草稿，则清除所有草稿
                    clearAllDrafts();
                } else {
                    // 使用一次后删除标记，确保下次进入时不会重用相同的草稿
                    sessionStorage.removeItem('shouldUseDraft');
                }
            }
            isEditMode.current = false
        }
    }, [blogId, form]);
    // 表单提交
    const handleCancel = () => {
        setShowModal(false)
    }

    const handleOk = () => {
        setShowModal(false)
        // 清除所有草稿，确保用户下次新建时从空白开始
        clearAllDrafts()
        navigate('/layout')
    }
    // 在表单提交前，把 editorContent 写回 form
    const onFinish = async (values) => {
        // 将 Slate 节点数组序列化为 HTML 再提交
        const htmlString = serializeNode ? editorContent.map(n => serializeNode(n)).join('') : '';
        values.content = htmlString
        const reqData = {
            ...values,
            tags: role,
        }
        if (blogId) {

            await editBlogAPI(blogId, reqData)
            setShowModal(true);
        } else {
            await createBlogAPI(reqData)
            setShowModal(true)
        }
        // 提交成功后清除所有草稿数据
        clearAllDrafts();
    }

    // 定义首页链接处理函数，在跳转前询问是否清除草稿
    const handleHomeLink = (e) => {
        // 检查是否有未保存的变更
        const savedContent = sessionStorage.getItem('editorDraft');
        const savedTitle = sessionStorage.getItem('titleDraft');

        if (savedContent || savedTitle) {
            e.preventDefault();
            Modal.confirm({
                title: '离开页面确认',
                content: '您有未发布的草稿内容，离开页面将清除这些草稿。确定要离开吗？',
                okText: '离开并清除草稿',
                cancelText: '继续编辑',
                onOk: () => {
                    clearAllDrafts();
                    navigate('/layout');
                }
            });
        }
    };

    // 定义面包屑的 items 数据
    const breadcrumbItems = [
        {
            title: <Link to="/layout" onClick={handleHomeLink}>首页</Link>,
        },
        {
            title: <Link to="/layout" onClick={handleHomeLink}>内容管理</Link>,
        },
        {
            title: blogId ? '编辑Blog' : '发布Blog',
        },
    ];

    // 当用户离开页面时，判断是否应该清除草稿
    useEffect(() => {
        // 处理浏览器关闭/刷新的情况
        const handleBeforeUnload = (e) => {
            // 检查是否有草稿
            const savedContent = sessionStorage.getItem('editorDraft');
            const savedTitle = sessionStorage.getItem('titleDraft');

            if (savedContent || savedTitle) {
                // 显示标准的"确认离开"对话框
                e.preventDefault();
                e.returnValue = '您有未保存的更改，确定要离开吗？';
                return e.returnValue;
            }
        };

        // 添加事件监听器
        window.addEventListener('beforeunload', handleBeforeUnload);

        // 返回清理函数
        return () => {
            // 清除事件监听器
            window.removeEventListener('beforeunload', handleBeforeUnload);

            // 清除保存状态定时器
            if (saveTimerRef.current) {
                clearTimeout(saveTimerRef.current);
            }
        };
    }, []);

    // 添加自定义提示窗口询问是否放弃草稿
    const discardDraft = () => {
        Modal.confirm({
            title: '确定要放弃草稿吗？',
            content: '如果放弃，当前编辑的内容将会丢失',
            okText: '放弃草稿',
            cancelText: '继续编辑',
            onOk: () => {
                clearAllDrafts();
                navigate('/layout');
            }
        });
    };

    // 检查是否有草稿存在
    const hasDrafts = () => {
        const content = sessionStorage.getItem('editorDraft');
        const title = sessionStorage.getItem('titleDraft');
        return !!(content || title);
    };

    return (
        <div className="publish">
            <Card
                title={
                    <Breadcrumb separator=">" items={breadcrumbItems} />
                }
            >
                <Form
                    form={form}
                    labelCol={{ span: 4 }}
                    wrapperCol={{ span: 16 }}
                    initialValues={{ type: 0 }}
                    onFinish={onFinish}
                >
                    <Form.Item
                        label="标题"
                        name="title"
                        rules={[{ required: true, message: '请输入Blog标题' }]}
                        wrapperCol={{ span: 16 }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Input
                                value={titleDraft}
                                onChange={e => {
                                    setTitleDraft(e.target.value);
                                    sessionStorage.setItem('titleDraft', e.target.value);
                                    form.setFieldsValue({ title: e.target.value });
                                }}
                                placeholder="请输入Blog标题"
                                style={{ flex: 1 }}
                            />
                            <Button
                                size="large"
                                type="primary"
                                onClick={() => form.submit()}
                                style={{ marginLeft: 16 }}
                            >
                                {blogId ? '编辑Blog' : '新建Blog'}
                            </Button>
                            <Button
                                size="large"
                                onClick={saveDraftManually}
                                style={{ marginLeft: 8 }}
                            >
                                保存草稿
                            </Button>
                        </div>
                    </Form.Item>
                    <Form.Item
                        label="内容"
                        name="content"
                        rules={[{ required: true, message: '请输入Blog内容' }]}
                        wrapperCol={{ span: 16 }}
                        style={{ height: '100%' }}
                    >
                        <div className="slate-container">
                            {loaded && (
                                <SlateEditorWithHighlightAndImage
                                    key={blogId || 'new'}
                                    value={editorContent}
                                    onChange={value => {
                                        setEditorContent(value);
                                        form.setFieldsValue({ content: value });
                                    }}
                                />
                            )}
                        </div>
                    </Form.Item>
                </Form>
            </Card>
            <Modal
                title="提示"
                closable={{ 'aria-label': 'Custom Close Button' }}
                open={showModal}
                onCancel={handleCancel}
                footer={[
                    <Button key="back" onClick={handleCancel}>
                        取消
                    </Button>,
                    <Button key="submit" type="primary" onClick={handleOk}>
                        确认
                    </Button>
                ]}>
                <p>您的Blog创建成功，请跳转至内容管理页面进行发布！</p>
            </Modal>
            {saveStatus && (
                <div className="save-status draft-status saved" style={{ marginTop: 8 }}>
                    <span className="status-indicator saved"></span>
                    {saveStatus}
                </div>
            )}
        </div>
    )
}

export default Publish