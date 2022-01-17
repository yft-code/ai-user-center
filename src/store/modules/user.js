import { login } from '@/api/user'
// import { getToken, setToken, removeToken } from '@/utils/auth'
// import { resetRouter } from '@/router'

const state = {
  // 存储用户名
  name: '',
  // 用户信息
  userInfo: (sessionStorage.getItem(`userInfo`) && JSON.parse(sessionStorage.getItem(`userInfo`))) || {},
  // 登录接口返回的值
  res: ''
}
const mutations = {
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_USERINFO: (state, userInfo) => {
    state.userInfo = userInfo
  },
  SET_RES: (state, res) => {
    state.res = res
  },
  SET_MENU: (state, menu) => {
    state.menu = menu
  }
}

const actions = {
  // 登录
  login({ commit }, userInfo) {
    const { username, password } = userInfo
    return new Promise((resolve, reject) => {
      // 登录以form-data形式传参
      const formData = new FormData()
      formData.set('username', username)
      formData.set('password', password)
      login(userInfo).then(res => {
        localStorage.setItem('flag', 'true')
        const { result } = res
        commit('SET_RES', res)
        if (result) {
          sessionStorage.setItem('userInfo', JSON.stringify(result.userInfo))
          localStorage.setItem('userInfo', JSON.stringify(result.userInfo))
          state.userInfo = res.result.data
          localStorage.setItem('token', result.token)
          commit('SET_NAME', result.userInfo.userAccount)
        }
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  }
  // 注销 - 登出
  // logout({ commit, state, dispatch }) {
  //   return new Promise((resolve, reject) => {
  //     const token = localStorage.getItem('token') || sessionStorage.getItem('token')
  //     logout(token).then(() => {
  //       // 去掉token
  //       sessionStorage.setItem('token', '')
  //       localStorage.setItem('token', '')
  //       resolve()
  //     }).catch(error => {
  //       reject(error)
  //     })
  //   })
  // }

}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

