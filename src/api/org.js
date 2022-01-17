import request from '@/utils/request'
// 获取组织树
export function getOrganization() {
  return request({
    url: 'organization/listOrganizationTree',
    method: 'post'
  })
}
// 添加组织节点
export function addOrganization(data) {
  return request({
    url: 'organization/addOrganization',
    method: 'post',
    data
  })
}
// 删除节点
export function deleteOrgById(params) {
  return request({
    url: 'organization/deleteOrgById',
    method: 'get',
    params
  })
}
// 编辑
export function updateOrganization(data) {
  return request({
    url: 'organization/updateOrganization',
    method: 'post',
    data
  })
}
// 根据id查找机构信息
export function queryOrgById(params) {
  return request({
    url: 'organization/queryOrgById',
    method: 'get',
    params
  })
}
// 关联用户
export function bindUser(data) {
  return request({
    url: 'userOrg/bindUser',
    method: 'post',
    data
  })
}
// 根据组织id删除用户
export function deleteNodeUser(url, data) {
  return request({
    url,
    method: 'post',
    data
  })
}
