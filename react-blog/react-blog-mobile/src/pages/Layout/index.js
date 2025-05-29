import { NavBar, TabBar } from 'antd-mobile'
import {
  Outlet,
  Link, useLocation, useNavigate
} from 'react-router-dom'
import {
  AppOutline,
  FileWrongOutline,
  UnorderedListOutline,
  UserOutline,
} from 'antd-mobile-icons'
import './index.scss'
import { useDispatch, useSelector } from 'react-redux'
import { useEffect } from 'react'
import { fetchUserInfo, clearUserInfo } from '@/store/modules/user'


const Bottom = () => {

  const navigate = useNavigate()


  const location = useLocation()
  const { pathname } = location

  const setRouteActive = (value) => {
    navigate(value)
  }

  const tabs = [
    {
      key: '/layout',
      title: '内容管理',
      icon: <AppOutline />,
    },
    {
      key: '/layout/accountManager',
      title: '账户管理',
      icon: <UnorderedListOutline />,
    },
    {
      key: '/layout/abnormalDetect',
      title: '异常管理',
      icon: <FileWrongOutline />,
    },
    {
      key: '/user-center',
      title: '个人中心',
      icon: <UserOutline />,
    }
  ]

  //触发用户个人信息action
  const dispatch = useDispatch()
  useEffect(() => {
    dispatch(fetchUserInfo())
  }, [dispatch])

  //用户退出，返回登录页面
  const confirm = () => {
    dispatch(clearUserInfo())
    navigate('/')
  }

  //从redux中获取用户信息
  const userInfo = useSelector(state => state.user.userInfo)
  const name = userInfo.name
  // 优先从 localStorage 读取 role（本地模拟登录），否则用 redux
  let role = localStorage.getItem('userRole')
  if (role === null || role === undefined) {
    role = userInfo.role
  } else {
    // 兼容字符串/数字
    role = Number(role)
  }



  return (
    <TabBar activeKey={pathname} onChange={value => setRouteActive(value)}>
      {tabs.map(item => (
        <TabBar.Item key={item.key} icon={item.icon} title={item.title} />
      ))}
    </TabBar>
  )
}

export const BlogLayout = () => {
  return (

    <div className="app">
      <div className="top">
        Blog管理系统
      </div>
      <div className="body">
        {/* 使用 Outlet 作为子路由的渲染出口 */}
        <Outlet />
      </div>
      <div className="bottom">
        <Bottom />
      </div>
    </div>
  )
}


