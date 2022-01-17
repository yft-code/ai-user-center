import request from '@/utils/request'
// 获取角色列表
export function queryByParameters(url, params) {
  return request({
    url,
    method: 'post',
    params
  })
}
// 删除角色
export function deleteRoleById(url, params) {
  return request({
    url,
    method: 'post',
    params
  })
}
// 查询平台
export function queryPlatList(params) {
  return request({
    url: 'plat/queryPlatList',
    method: 'get',
    params
  })
}
// 获取组织
export function getOrganization() {
  return request({
    url: 'organization/listCompanyTree',
    method: 'post'
  })
}
// 添加角色
export function addRole(data) {
  return request({
    url: 'role/insertRole',
    method: 'post',
    data
  })
}
// 更新角色信息
export function updateRole(data) {
  return request({
    url: 'role/updateRole',
    method: 'post',
    data
  })
}
// 查询用户已选择角色
export function queryUserRole(params) {
  return request({
    url: 'role/queryUserRoleByPlatId',
    method: 'get',
    params
  })
}
// 查询用户未选择角色
export function queryUserRoleWithout(params) {
  return request({
    url: 'role/queryUserRoleWithoutByPlatId',
    method: 'get',
    params
  })
}
