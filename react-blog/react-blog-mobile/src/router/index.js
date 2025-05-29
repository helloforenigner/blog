import { Login } from "@/pages/Login";
import { Register } from "@/pages/Register";
import { BlogLayout } from '@/pages/Layout'
import { createBrowserRouter } from "react-router-dom";

import ContentManager from "@/pages/Content";
import AccountManager from "@/pages/Account";
import AbnormalDetect from "@/pages/Abnormal";
import Publish from "@/pages/Publish";
import UserCenter from "@/pages/UserCenter";
import HomePage from '@/pages/Home';
import BlogDetail from '@/pages/BlogDetail';
import NotFound from "@/pages/NotFound";

const router = createBrowserRouter([
    {
        path: '/',
        element: <Login />
    },
    {
        path: '/register',
        element: <Register />
    },
    {
        path: '/home',
        element: <HomePage />
    },
    {
        path: '/blog/:id',
        element: <BlogDetail />
    },
    {
        path: '/user-center',
        element: <UserCenter />
    },
    {
        path: '/layout',
        element: <BlogLayout />,
        children: [
            {
                path: '',
                element: <ContentManager />
            },
            {
                path: 'accountManager',
                element: <AccountManager />
            },
            {
                path: 'abnormalDetect',
                element: <AbnormalDetect />
            }, {
                path: 'publish',
                element: <Publish />
            }
        ]
    },
    {
        path: '*',
        element: <NotFound />
    },
])

export default router