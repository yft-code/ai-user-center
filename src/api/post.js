import request from '@/utils/request'
// 获取岗位列表
export function getPostion(url, data) {
  return request({
    url,
    method: 'post',
    data
  })
}
// 获取组织
export function getOrganization() {
  return request({
    url: 'organization/listCompanyTree',
    method: 'post'
  })
}
// 删除岗位
export function deleteRoleById(url, params) {
  return request({
    url,
    method: 'get',
    params
  })
}

// 新增岗位
export function addPosition(data) {
  return request({
    url: 'position/addPosition',
    method: 'post',
    data
  })
}
// 更新岗位
export function updatePosition(data) {
  return request({
    url: 'position/updatePosition',
    method: 'post',
    data
  })
}
// 验证岗位名称或编码是否重复
export function isPositionExist(data) {
  return request({
    url: 'position/queryPositionIsNotExist',
    method: 'post',
    data
  })
}
