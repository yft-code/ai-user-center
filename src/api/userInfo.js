import request from '@/utils/request'
// 获取用户列表
export function getUserList(url, params) {
  return request({
    url,
    method: 'post',
    params
  })
}
export function getOrganization() {
  return request({
    url: 'organization/listOrganizationTree',
    method: 'post'
  })
}
// 批量删除用户
export function Muldelete(url, data) {
  return request({
    url,
    method: 'post',
    data
  })
}
// 批量插入
export function insertUserByExcel(data) {
  return request({
    url: 'user/insertUserByExcel',
    method: 'post',
    data
  })
}
// 修改状态
export function updateUser(data) {
  return request({
    url: '/user/updateUser',
    method: 'post',
    data
  })
}

// 新增用户
export function addUser(data) {
  return request({
    url: '/user/insertUser',
    method: 'post',
    data
  })
}

// 上传图片
export function uploadAvatar(data) {
  return request({
    url: '/user/uploadImage',
    method: 'post',
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    data
  })
}

// 判断手机号是否重复
export function isPhoneConflict(params) {
  return request({
    url: '/user/isPhoneConflict',
    method: 'get',
    params
  })
}

// 判断用户账号是否重复
export function isAccountConflict(params) {
  return request({
    url: '/user/isAccountConflict',
    method: 'get',
    params
  })
}

// 用户绑定角色
export function userBindRoles(data) {
  return request({
    url: 'role/bindUserRoles',
    method: 'post',
    data
  })
}

// 根据登陆用户获取菜单权限
export function getMenuByUser(params) {
  return request({
    headers: {
      'Authorization': localStorage.getItem('token')
    },
    url: 'custom/getMenus',
    method: 'post',
    params
  })
}

