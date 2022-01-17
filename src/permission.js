import router, { resetRouter } from './router'
// import store from './store'
// import { Message } from 'element-ui'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style
import Layout from '@/layout/index'
import { getMenuByUser } from './api/userInfo'
// import { getToken } from '@/utils/auth' // get token from cookie
// import getPageTitle from '@/utils/get-page-title'
NProgress.configure({ showSpinner: false }) // NProgress Configuration

// const whiteList = ['/login'] // no redirect whitelist

// 用于存储获取到的动态路由数组
// 处理获取到的动态路由数据
const generateMenu = (routers, data) => {
  data && data.forEach((item) => {
    const menu = {
      path: item.path === '/user_center' ? item.path : item.path.slice(1),
      name: item.name,
      component: item.path === '/user_center' ? Layout : (resolve) => require([`@/views${item.path}/index`], resolve),
      meta: { title: item.meta.title }
    }
    if (item.path === '/user_center') {
      menu.meta.icon = 'PersonnelControl'
    }
    if (item.children) {
      menu.children = []
      generateMenu(menu.children, item.children)
    }
    routers.push(menu)
    if (item.path === '/role') {
      routers.push({
        path: 'addRole',
        name: 'addRole',
        hidden: true,
        component: (resolve) => require([`@/views/roleadd/index`], resolve)
      })
    }
  })
}

// 是否需要获取菜单
let isFirstGetMenu = true
router.beforeEach(async(to, from, next) => {
  if (to.path === '/' || to.path === '/login') {
    if (localStorage.getItem('token')) {
      next({ path: '/user_center/user' })
    } else {
      next()
    }
  } else {
    if (localStorage.getItem('token')) {
      const flag = localStorage.getItem('flag')
      if (flag && isFirstGetMenu === false) {
        isFirstGetMenu = true
        localStorage.setItem('flag', '')
      }
      if (to.path && to.path !== '/' && to.path !== '/login') {
        if (isFirstGetMenu) {
          isFirstGetMenu = false
          let menu = []
          const routers = []
          // 获取动态路由菜单
          const { code, result } = await getMenuByUser({
            platId: '2' // 用户中心平台
          })
          if (code !== 0) {
            this.$message.error('获取菜单数据失败')
          } else {
            menu = result
            generateMenu(routers, menu)
            // 一定要在最后加上404路由, 否则页面找不到时不会跳转到404
            routers.push({
              path: '*',
              redirect: '/404',
              hidden: true
            })
            router.options.routes = []
            const newRoutes = router.options.routes.concat(routers)
            router.options.routes = newRoutes
            resetRouter()
            router.addRoutes(routers) // 动态添加可访问路由表
            next({ ...to, replace: true })
          }
        } else {
          if (to.fullPath === '/user_center/addRole' && JSON.stringify(to.params) === '{}') {
            next({ path: '/user_center/role' })
          } else {
            next()
          }
        }
      } else {
        next()
      }
    } else {
      next({ path: '/login' })
    }
  }
  // if (JSON.stringify(to.params) !== {})
  //   // start progress bar
  //   NProgress.start()

  //   // set page title
  //   document.title = getPageTitle(to.meta.title)

  //   // determine whether the user has logged in
  //   const hasToken = getToken()

  //   if (hasToken) {
  //     if (to.path === '/login') {
  //       // if is logged in, redirect to the home page
  //       next({ path: '/' })
  //       NProgress.done()
  //     } else {
  //       const hasGetUserInfo = store.getters.name
  //       if (hasGetUserInfo) {
  //         next()
  //       } else {
  //         try {
  //           // get user info
  //           await store.dispatch('user/getInfo')

  //           next()
  //         } catch (error) {
  //           // remove token and go to login page to re-login
  //           await store.dispatch('user/resetToken')
  //           Message.error(error || 'Has Error')
  //           next(`/login?redirect=${to.path}`)
  //           NProgress.done()
  //         }
  //       }
  //     }
  //   } else {
  //     /* has no token*/

//     if (whiteList.indexOf(to.path) !== -1) {
//       // in the free login whitelist, go directly
//       next()
//     } else {
//       // other pages that do not have permission to access are redirected to the login page.
//       next(`/login?redirect=${to.path}`)
//       NProgress.done()
//     }
//   }
})

router.afterEach(() => {
  // finish progress bar
  NProgress.done()
})
