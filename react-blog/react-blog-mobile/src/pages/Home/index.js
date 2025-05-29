// src/index.js
import React, { useEffect, useState } from 'react';
import { getBlogListAPI } from '@/apis/content';
import blogListMock from '@/mock/blogList';
import userList from '@/mock/userList';
import './index.scss';

// 切换此变量即可使用 mock 数据或真实接口
const USE_MOCK = true;

const IndexPage = () => {
    // 从 localStorage 初始化主题状态
    const [darkMode, setDarkMode] = useState(() => {
        return localStorage.getItem('darkMode') === 'true';
    });
    // 博客列表 state
    const [blogList, setBlogList] = useState([]);

    // 获取当前登录用户头像
    const account = localStorage.getItem('userAccount');
    const currentUser = userList.find(u => u.account === account);
    const avatarSrc = currentUser ? currentUser.avatar : '/selfimg/avatar1.jpeg';

    // 拉取博客数据
    useEffect(() => {
        async function fetchBlogs() {
            if (USE_MOCK) {
                setBlogList(blogListMock);
            } else {
                const res = await getBlogListAPI({ page: 1, per_page: 20 });
                if (res && res.data && res.data.data && Array.isArray(res.data.data.results)) {
                    setBlogList(res.data.data.results);
                }
            }
        }
        fetchBlogs();
    }, []);

    // TODO: 后期如需和后端交互获取博客数据，删除 USE_MOCK 相关逻辑，直接调用 getBlogListAPI。
    // 示例：
    // useEffect(() => {
    //     async function fetchBlogs() {
    //         const res = await getBlogListAPI({ page: 1, per_page: 20 });
    //         if (res && res.data && res.data.data && Array.isArray(res.data.data.results)) {
    //             setBlogList(res.data.data.results);
    //         }
    //     }
    //     fetchBlogs();
    // }, []);
    // 其余 mock/blogList.js 相关代码可全部移除。

    // 每次 darkMode 改变时，更新 body 的 class 和 localStorage
    useEffect(() => {
        if (darkMode) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
        localStorage.setItem('darkMode', darkMode);
    }, [darkMode]);

    const handleAvatarClick = (e) => {
        e.preventDefault();
        // 判断是否登录，假设 localStorage 里有 token 字段
        const token = localStorage.getItem('token');
        // if (token) {
        //     window.location.href = '/user-center';
        // } else {
        //     window.location.href = '/login'; // 未登录跳转登录页
        // }
        window.location.href = '/user-center';
    };

    return (
        <div className="index-page">
            <header>
                <nav className="navbar">
                    <a className="navbar-brand" href="#">Blog</a>
                    <div className="navbar-right">
                        <button
                            className="manage-btn"
                            style={{ marginRight: 16, padding: '6px 16px', borderRadius: 6, border: 'none', background: '#409EFF', color: '#fff', cursor: 'pointer', fontSize: 16 }}
                            onClick={() => window.location.href = '/layout'}
                        >
                            管理
                        </button>
                        <a href="/user-center" className="avatar-link" aria-label="个人主页" onClick={handleAvatarClick}>
                            <img src={avatarSrc} alt="User Avatar" className="avatar" />
                        </a>
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
                {blogList.map(post => (
                    <article className="post-item" key={post.id}>
                        <h2 className="post-title">
                            <a href={`/blog/${post.id}`}>{post.title}</a>
                        </h2>
                        <p className="post-excerpt">{post.excerpt || (post.content ? post.content.slice(0, 80) + '...' : '')}</p>
                        <div className="post-meta">
                            <span className="post-date">{post.date || post.pub_date}</span>
                            <span className="post-author">{post.author || post.account}</span>
                        </div>
                    </article>
                ))}
            </main>
        </div>
    );
};

export default IndexPage;
