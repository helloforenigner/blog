import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.scss'
import router from './router';
import { RouterProvider } from 'react-router-dom';
import '@ant-design/v5-patch-for-react-19';
import { Provider } from 'react-redux';
import store from './store';

// 导入highlight.js并确保它全局可用
import hljs from 'highlight.js';
if (typeof window !== 'undefined') {
  window.hljs = hljs;
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Provider store={store}>
    <RouterProvider router={router} />
  </Provider>
);

