import request from '@/utils/request'

// 获取表格数据
export function getTableData(url, data) {
  return request({
    url,
    method: 'POST',
    data
  })
}
export function deleteActionsInData(url, data) {
  return request({
    url,
    method: 'post',
    data
  })
}
export function getList(url, data) {
  return request({
    url,
    method: 'post',
    data
  })
}
