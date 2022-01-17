import request from '@/utils/request'

// 获取菜单树
export function getMenuTree(params) {
  return request({
    url: 'menu/menuTree',
    method: 'get',
    params
  })
}

// 根据菜单id获取对应按钮
export function getButtonByMenuId(params) {
  return request({
    url: 'menu/queryButtonByid',
    method: 'get',
    params
  })
}

// 已经勾选菜单按钮
export function getMenuCheckedButton(params) {
  return request({
    url: 'menu/roleSelectButton',
    method: 'get',
    params
  })
}

// 角色已勾选菜单树查询
export function getSelectMenuTree(params) {
  return request({
    url: 'menu/roleSelectMenuTree',
    method: 'get',
    params
  })
}

// 获取平台数据
export function getPlatform(params) {
  return request({
    url: 'plat/queryPlatList',
    method: 'get',
    params
  })
}

// 获取包含公司节点的组织树
export function getNodeTree(params) {
  return request({
    url: 'organization/listCompanyTree',
    method: 'post',
    params
  })
}

// 获取角色的页面和菜单权限
export function getMenuWithButton(data) {
  return request({
    url: 'menu/roleSelectMenuTreeWithButton',
    method: 'post',
    data
  })
}
