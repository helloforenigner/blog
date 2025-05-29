import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getBlogDetailAPI } from '@/apis/content';
import blogListMock from '@/mock/blogList';
import hljs from 'highlight.js';
import 'highlight.js/styles/monokai-sublime.css';
import './index.scss';

// 切换此变量即可使用 mock 数据或真实接口
const USE_MOCK = true;

const BlogDetail = () => {
    const { id } = useParams(); // 从URL获取博客ID
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);

    // 从 localStorage 初始化主题状态
    const [darkMode, setDarkMode] = useState(() => {
        return localStorage.getItem('darkMode') === 'true';
    });

    useEffect(() => {
        async function fetchBlogDetail() {
            setLoading(true);
            try {
                if (USE_MOCK) {
                    // 使用mock数据
                    const blogDetail = blogListMock.find(blog => blog.id === parseInt(id));
                    setBlog(blogDetail || null);
                } else {
                    // 使用API
                    const res = await getBlogDetailAPI(id);
                    if (res && res.data && res.data.data) {
                        setBlog(res.data.data);
                    }
                }
            } catch (error) {
                console.error('获取博客详情失败:', error);
            } finally {
                setLoading(false);
            }
        }

        if (id) {
            fetchBlogDetail();
        }
    }, [id]);

    // 应用代码高亮
    useEffect(() => {
        if (!loading && blog) {
            setTimeout(() => {
                document.querySelectorAll('pre, code, .ql-syntax, .ql-code-block').forEach((block) => {
                    hljs.highlightElement(block);
                });
            }, 100);
        }
    }, [loading, blog]);

    // 每次 darkMode 改变时，更新 body 的 class 和 localStorage
    useEffect(() => {
        if (darkMode) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
        localStorage.setItem('darkMode', darkMode);
    }, [darkMode]);

    if (loading) {
        return <div className="blog-detail-page loading">加载中...</div>;
    }

    if (!blog) {
        return <div className="blog-detail-page not-found">未找到该博客</div>;
    }

    return (
        <div className="blog-detail-page">
            <header>
                <nav className="navbar">
                    <Link className="navbar-brand" to="/home">Blog</Link>
                    <div className="navbar-right">
                        <Link to="/home" className="back-btn">
                            返回首页
                        </Link>
                        <button
                            className="mode-toggle"
                            onClick={() => setDarkMode(!darkMode)}
                            aria-label="切换日夜模式"
                        >
                            {darkMode ? '☀️' : '🌙'}
                        </button>
                    </div>
                </nav>
            </header>

            <main className="container">
                <article className="blog-content">
                    <h1 className="blog-title">{blog.title}</h1>
                    <div className="blog-meta">
                        <span className="blog-date">{blog.date || blog.pub_date}</span>
                        <span className="blog-author">{blog.author || blog.account}</span>
                    </div>
                    <div
                        className="blog-body"
                        dangerouslySetInnerHTML={{ __html: blog.content }}
                    />
                </article>
            </main>
        </div>
    );
};

export default BlogDetail;
