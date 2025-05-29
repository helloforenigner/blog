import {
    Card,
    Breadcrumb,
    Form,
    Button,
    Modal,
    Input,
} from 'antd'

import { useState, useEffect, useRef, use } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import './index.scss'

import hljs from 'highlight.js';
import 'highlight.js/styles/monokai-sublime.css';

import ReactQuill from 'react-quill-new'
import 'react-quill-new/dist/quill.snow.css'

import { base64ToFile } from '@/utils/image';
import { uploadFileAPI } from '@/apis/file';

import { createBlogAPI, getBlogDetailAPI, editBlogAPI } from '@/apis/content'




// 配置 Quill 工具栏
const modules = {
    toolbar: [
        [{ 'header': [1, 2, 3, 4, false] }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'list': 'check' }],
        [{ 'indent': '-1' }, { 'indent': '+1' }],
        ['link', 'image', 'code-block']
    ],

    syntax: {
        hljs: {
            highlight: function (language, text) {
                //return hljs.highlightAuto(text).value
                const result = hljs.highlightAuto(text);
                console.log('language', language)
                console.log('text', text)
                console.log(result.value)
                return result.value
            }
        }

    }
};

// 配置 Quill 格式
const formats = [
    'header', 'bold', 'italic', 'underline', 'strike', 'blockquote', 'color', 'background',
    'list', 'indent', 'link', 'image', 'code-block'
];


const Publish = () => {


    const quillEdit = useRef(null)


    const [htmlVal, setHtmlValue] = useState('')

    // 编辑器获取焦点，获取指针位置
    const [editWho, setEditWho] = useState('')
    const [userIndex, setUserIndex] = useState(0)

    //编辑blog时跳转回填数据
    const [searchParams] = useSearchParams()
    const blogId = searchParams.get('id')

    // 获取表单实例
    const [form] = Form.useForm()

    // 路由跳转
    const navigate = useNavigate()

    // 将光标定位到用户输入的位置
    useEffect(() => {
        //console.log('富文本内容改变了', editWho, userIndex)
        const quill = quillEdit.current.getEditor()
        if (editWho === 'api' && userIndex !== 0) {
            quill.setSelection(userIndex + 2)
        }
    }, [htmlVal])

    useEffect(() => {
        const getBlogDetail = async () => {
            const res = await getBlogDetailAPI(blogId)
            console.log(res)
            const data = res.data.data
            const quill = quillEdit.current.getEditor()
            //回填正文内容
            //quill.setContents(data.content)
            //回填标题内容
            //form.setFieldsValue({title: data.title })
            form.setFieldsValue(data)
        }
        if (blogId) {
            getBlogDetail()
        }
    }, [blogId, form])


    // 自动保存草稿
    const saveDraft = (content) => {
        localStorage.setItem('editorDraft', JSON.stringify(content));
    }


    // 加载草稿
    useEffect(() => {
        const savedDraft = localStorage.getItem('editorDraft');
        const savedTitle = localStorage.getItem('titleDraft');
        const formdata = {
            title: savedTitle,
        }
        //console.log(savedDraft)
        if (savedDraft) {
            //console.log("加载草稿")
            const delta = JSON.parse(savedDraft);
            const quill = quillEdit.current.getEditor()
            quill.setContents(delta)

        }

        form.setFieldsValue(formdata)
    }, []);

    const handleChangeTitle = (e) => {
        console.log(e.target.value)
        localStorage.setItem('titleDraft', e.target.value);
    }


    const handleChangeQuill = (content, delta, source, editor) => {
        // content和delta和editor.getHTML()获取的都是实时的文本内容，不是quill绑定的value值
        let quill = quillEdit.current.getEditor()
        // 如果是用户粘贴图片，需要先获取焦点，然后获取到粘贴图片的位置，等图片上传完之后，再将光标恢复
        quill.focus()
        console.log('delta_ops------', content, delta, source, editor)
        let delta_ops = delta.ops
        let quilContent = editor.getContents()

        setHtmlValue(content)

        // 获取指针位置
        const range = quill.getSelection()
        // console.log('user index------', quill.hasFocus())
        if (range) {
            if (range.length === 0 && range.index !== 0) {
                console.log('User cursor is at index', range.index)
                setUserIndex(range.index)
            } else {
                const text = quill.getText(range.index, range.length)
                console.log('User has highlighted: ', text)
            }
        } else {
            console.log('User cursor is not in editor')
        }
        setEditWho(source)
        if (delta_ops && delta_ops.length > 0) {
            quilContent.ops.map((item) => {
                if (item.insert) {
                    let imgStr = item.insert.image
                    if (imgStr && imgStr?.includes('data:image/')) {
                        let file = base64ToFile(imgStr)
                        console.log('files=', file)
                        let formData = new FormData()
                        formData.append('image', file)
                        console.log('上传图片！')
                        // 调用文件上传接口-将二进制图片文件上传至服务器
                        uploadFileAPI(formData).then((res) => {
                            // 将图片链接替换为服务器返回的图片链接
                            item.insert.image = res.data.data
                            // 此方法会让用户指针回到最头部
                            quill.setContents(quilContent)

                        })
                    }
                }
            })
        }
        console.log('quillContent:', JSON.stringify(quilContent))
        saveDraft(quilContent)
    }

    // 表单提交
    const [showModal, setShowModal] = useState(false)
    const role = sessionStorage.getItem('role')
    const handleCancel = () => {
        setShowModal(false)
    }

    const handleOk = () => {
        setShowModal(false)
        navigate('/layout')
    }

    // 在表单提交前，把 editorContent 写回 form
    const onFinish = async (values) => {

        const reqData = {
            ...values,
            tags: role,
        }
        if (blogId) {
            await editBlogAPI(blogId, reqData)
        } else {
            await createBlogAPI(reqData)
        }
        setShowModal(true);
    }
    return (
        <div className="publish">
            <Card
                title={
                    <Breadcrumb separator=">">
                        <Breadcrumb.Item>
                            <Link to="/layout">首页</Link>
                        </Breadcrumb.Item>
                        <Breadcrumb.Item>
                            <Link to="/layout">内容管理</Link>
                        </Breadcrumb.Item>
                        <Breadcrumb.Item>{false ? '编辑Blog' : '发布Blog'}</Breadcrumb.Item>
                    </Breadcrumb>
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
                    >
                        <Input onChange={handleChangeTitle} placeholder="请输入Blog标题" style={{ width: 400 }} />
                    </Form.Item>

                    <Form.Item
                        label="内容"
                        name="content"
                        rules={[{ required: true, message: '请输入Blog内容' }]}
                        style={{ height: 240 }}

                    >
                        <ReactQuill
                            className="publish-quill"
                            theme="snow"
                            ref={quillEdit}
                            placeholder="请输入Blog内容"
                            modules={modules}
                            formats={formats}
                            onChange={handleChangeQuill}
                        />
                    </Form.Item>

                    <Form.Item wrapperCol={{ offset: 4 }}>
                        <Button size="large" type="primary" htmlType="submit">
                            {blogId ? '编辑Blog' : '新建Blog'}
                        </Button>
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
        </div>
    )
}

export default Publish