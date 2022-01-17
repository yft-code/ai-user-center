<template>
  <div class="userContainer viewIndex banner" style="padding:20px">
    <div class="content">
      <common-table
        ref="table"
        :data-flag="dataFlag"
        :url="urlList.tableDataUrl"
        :del-url="urlList.delUrl"
        :top-search-config="topSearchConfig"
        :table-data="tableData"
        :page-config="pageConfig"
        :alter-flag="alterFlag"
        :operation-cols="operationCols"
        :table-column-match="roleCol"
        @search-info="getSearchInfo"
        @get-table-data="getData"
        @reset="reset"
      >
        <template #selectTree>
          <el-form-item size="mini" label="所属机构" style="width: 100%">
            <tree-select
              v-model="value"
              :no-results-text="text"
              :clearable="false"
              :options="data"
              :normalizer="normalizer"
              placeholder="请选择"
            />
          </el-form-item>
        </template>
        <template #dateDemo>
          <el-form-item size="mini" label="创建时间" style="width: 100%">
            <!-- 不带时分秒 -->
            <!-- <el-date-picker
              v-model="warningTime"
              style="width: 100%"
              value-format="yyyy-MM-dd"
              type="daterange"
              range-separator="~"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              @change="changeTime"
            /> -->
            <el-date-picker
              v-model="warningTime"
              style="width: 100%"
              format="yyyy-MM-dd HH:mm:ss"
              value-format="yyyy-MM-dd HH:mm:ss"
              type="datetimerange"
              range-separator="~"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              @change="changeTime"
            />
          </el-form-item>
        </template>
        <template #optionDemo>
          <el-form-item size="mini" label="所属平台" style="width: 100%">
            <el-select v-model="platId" placeholder="请选择" style="width: 100%">
              <el-option
                v-for="item in platArr"
                :key="item.id"
                :label="item.platName"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </template>
        <template #operBtn>
          <div class="btn_group">
            <el-button size="mini" type="primary" @click="handleAdd">添加角色</el-button>
          </div>
        </template>
        <template v-slot:userType="data">
          {{ data.row.userType===0?'内部用户':'外部用户' }}
        </template>
        <template v-slot:organizationList="data">
          <span v-if="data.row.organizationList.length <= 0">--</span>
          <span v-else>{{ getShowOrganization(data.row.organizationList) }}</span>
        </template>
        <template v-slot:platformList="data">
          <span v-if="data.row.platformList.length <= 0">--</span>
          <span v-else>{{ getShowOrganization(data.row.platformList) }}</span>
        </template>
        <template v-slot:roleDescription="data">
          {{ data.row.roleDescription?data.row.roleDescription:'--' }}
        </template>
      </common-table>
    </div>
  </div>
</template>
<script>
import TreeSelect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import CommonTable from '@/components/CommonTable'
import { roleCol } from '@/utils/table-column-match'
import * as api from '@/api/role'
export default {
  name: 'Banner',
  components: {
    CommonTable,
    TreeSelect
  },
  data() {
    return {
      platId: '',
      // 平台
      platArr: [],
      warningTime: '',
      // 时间查询参数
      startTime: '',
      endTime: '',
      text: '无数据',
      value: null,
      // 组织树数据
      data: [],
      // 表格头数据
      roleCol,
      // commontable组件数据
      formConfig: {
        eleComponents: [
          {
            type: 'input',
            name: 'elVehicle',
            label: '关联车辆',
            rules: [{ required: true, message: '请输入关联车辆信息' }]
          }, {
            type: 'input',
            name: 'alarmInfo',
            label: '报警情况',
            rules: [{ required: false }]
          }
        ]
      },
      modelConfig: {
        visibleFlag: false
      },
      alterFlag: false,
      // 操作列
      operationCols: [
        {
          prop: 'operation',
          label: '操作',
          width: '200px',
          align: 'center',
          fixed: 'right',
          btnBox: [
            {
              name: '编辑',
              type: 'text',
              size: 'mini',
              callback: (index, row) => {
                const formData = {}
                for (const key in row) {
                  if (key === 'roleDescription' || key === 'roleName') {
                    formData[key] = row[key]
                  } else if (key === 'platformList') {
                    formData[key] = row[key][0].id
                  } else if (key === 'organizationList' && row[key].length > 0) {
                    formData[key] = row[key][0].id
                  } else if (key === 'id') {
                    formData.roleId = row[key]
                  }
                }
                this.$router.push({
                  name: 'addRole',
                  params: {
                    isAdd: false,
                    formData: formData
                  }
                })
              }
            },
            {
              name: '删除',
              type: 'text',
              size: 'mini',
              callback: (index, row) => {
                const params = { id: row.id }
                this.$confirm('确认要删除这条内容吗?', '提示', {
                  confirmButtonText: '确定',
                  cancelButtonText: '取消',
                  type: 'warning'
                }).then(() => {
                  api.deleteRoleById(this.urlList.delUrl, params).then(() => {
                    const params = {
                      pageSize: this.pageConfig.pageSize,
                      pageNum: this.pageConfig.currentPage
                    }
                    this.getData(params)
                    this.$message({
                      type: 'success',
                      message: '删除成功'
                    })
                  }).catch()
                }).catch(() => {
                  this.$message({
                    type: 'info',
                    message: '取消删除'
                  })
                })
              }
            }
          ]
        }
      ],
      // 表格数据
      tableData: [],
      // 表格相关配置
      tableConfig: { height: '' },
      // 顶部搜索配置
      topSearchConfig: {
        // 行之间的间距
        gutterList: 20,
        labelWidth: '80px',
        size: 'mini',
        // 一行几个搜索字段 必传
        rowCount: 5,
        // 搜索框组件配置
        eleComponents: [
          // 每个对象为一列
          {
            // 类型必传
            type: 'input',
            // 左边字段名称 可传可不传
            label: '角色名称',
            // 控件name必传,参数名称
            name: 'roleName',
            // 样式可传可不传
            style: {},
            // 占位内容 可传可不传
            placeholder: '请输入',
            // 每列所占的份额  一共24
            // 每个屏幕各个字段所占份额
            lg: 5,
            md: 5,
            sm: 5,
            xl: 5
          },
          // 同一块布局中可以包含多个按钮
          {
            placeholder: '请选择',
            type: 'select-demo',
            label: '所属机构',
            name: 'organizationId',
            // xl: 16,
            lg: 6,
            md: 6,
            sm: 6,
            xl: 6
          },
          {
            type: 'option-demo',
            label: '所属平台',
            name: 'platId',
            placeholder: '请选择',
            // xl: 4,
            lg: 6,
            md: 6,
            sm: 6,
            xl: 6

          },
          {
            type: 'date-demo',
            label: '创建时间',
            placeholder: '请选择',
            // xl: 4,
            lg: 7,
            md: 7,
            sm: 7,
            xl: 7
          },
          {
            type: 'btn',
            lg: 24,
            md: 24,
            sm: 24,
            xl: 24,
            style: {
              float: 'right',
              marginRight: '0px'
            },
            btnList: [
              {
                name: '查询',
                size: 'mini',
                btnType: 'primary',
                callback: (values) => {
                }
              },
              {
                name: '清空',
                size: 'mini',
                btnType: '',
                callback: (values) => {
                }
              }
            ]
          }
        ]
      },
      // 分页配置
      pageConfig: {
        style: {},
        background: true,
        // 每页显示条目个数
        pageSize: 10,
        // 小型分页样式
        small: false,
        // width: "100%",
        // 分页按钮的对齐方式  flex-start  flex-end  center
        flex: 'flex-end',
        // 页码按钮的数量大于5的基数
        pagerCount: 5,
        // 当前页码
        currentPage: 1,
        total: 0,
        layout: 'prev, pager, next, jumper,sizes,total',
        pageSizes: [10, 20, 30, 40]
      },
      // 为true时父组件获取数据，false时只需传入对应url子组件即可自动获取数据
      dataFlag: true,
      urlList: {
        // 给父链接则从父组件中请求  子链接传值则从子组件中请求
        tableDataUrl: 'role/queryByParameters',
        delUrl: 'role/deleteById'
      }
    }
  },
  mounted() {

  },
  created() {
    // 父组件中调用接口获取后端数据
    this.$nextTick(() => {
      this.queryPlat()
      this.getOrangize()
      if (this.dataFlag) {
        const params = {
          pageSize: this.pageConfig.pageSize,
          pageNum: this.pageConfig.currentPage
        }
        this.getData(params)
      }
    })
  },
  methods: {
    // 新增角色
    handleAdd() {
      this.$router.push({
        name: 'addRole',
        params: {
          isAdd: true
        }
      })
    },
    // 平台查询
    queryPlat() {
      api.queryPlatList().then(res => {
        this.platArr = res.result
      }).catch()
    },
    // 对时间处理
    changeTime(e) {
      if (e) {
        this.startTime = e[0]
        this.endTime = e[1]
      } else {
        this.startTime = ''
        this.endTime = ''
      }
    },
    // 清空时间数据
    reset() {
      this.value = null
      this.warningTime = ''
      this.platId = ''
      this.startTime = ''
      this.endTime = ''
    },
    // 树
    normalizer(node) {
      // 去掉children=[]的children属性
      if (node.children && !node.children.length) {
        delete node.children
      }
      return {
        label: node.name,
        children: node.children
      }
    },
    // 获取展示结构
    getShowOrganization(obj) {
      const res = []
      for (const item of obj) {
        res.push(item.name)
      }
      return res.join(',')
    },
    // 组织机构
    getOrangize() {
      api.getOrganization().then(res => {
        const data = []
        const { result } = res
        data.push(result)
        this.data = data
      }).catch
    },
    // 获取列表
    getData(params) {
      params.startTime = this.startTime
      params.endTime = this.endTime
      params.orgId = this.value
      params.platId = this.platId
      api.queryByParameters(this.urlList.tableDataUrl, params).then(res => {
        const { result } = res
        this.tableData = result.list
        this.pageConfig.total = result.total
        this.$refs.table.getShowCols(this.tableData, roleCol)
        this.$refs.table.loading = false
      }).catch(() => {
        this.$refs.table.loading = false
        this.$refs.table.getShowCols(this.tableData, roleCol)
      })
    },
    // 表格数据请求接口
    // getData(params) {
    //   // getTableData(this.urlList.tableDataUrl, params)
    //   //   .then((res) => {
    //   this.$refs.table.loading = false
    //   // this.tableData = res.result.records
    //   const data = [
    //     {
    //       account: 'text1',
    //       name: '里哈哈',
    //       phone: 1354564678,
    //       userType: '内部用户',
    //       organization: '叮当公司',
    //       email: '123@xxx.com',
    //       status: true
    //     },
    //     {
    //       account: 'text2',
    //       name: '歪哈哈',
    //       phone: 1354564678,
    //       userType: '内部用户',
    //       organization: '供应商',
    //       email: '323@xxx.com',
    //       status: false
    //     },
    //     {
    //       account: 'text3',
    //       name: '娃哈哈',
    //       phone: 1354564678,
    //       userType: '内部用户',
    //       organization: '叮当公司',
    //       email: '523@xxx.com',
    //       status: true
    //     }
    //   ]
    //   this.tableData = data
    //   // console.log(this.tableData)
    //   // this.pageConfig.total = res.result.total
    //   this.pageConfig.total = 10

    //   this.$refs.table.getShowCols(this.tableData, manageUser)
    //   // this.pageConfig.total = this.urlTableData.length;
    //   // })
    //   // .catch((e) => {
    //   //   console.log(e)
    //   // })
    // },
    // 获取搜索字段内容
    getSearchInfo(filterParams) {
      const rules = []
      for (const key in filterParams) {
        rules.push({
          key: key,
          relation: 'like',
          value: filterParams[key]
        })
      }
      filterParams.startTime = this.startTime
      filterParams.endTime = this.endTime
      filterParams.orgId = this.value
      filterParams.platId = this.platId
      this.getData(filterParams)
    }
  }
}
</script>
<style lang="scss" scoped>
.userContainer{
    width:97%;
    margin: 24px auto;
    border-radius: 8px;
    box-sizing: border-box;
    box-shadow: 0px 0px 7px -3px rgba(33, 72, 141, 0.2);
    .btn_group{
      padding-top: 20px;
      border-top:1px solid #f3f3f5;
      margin-bottom: 20px;
      // margin-top: -10px;
    }
   ::v-deep .vue-treeselect__control {
    width: 100%;
    height: 28px;
}
::v-deep .vue-treeselect div, .vue-treeselect span {
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    font-size: 12px;
    padding-top: -4px;
}
::v-deep .el-icon-time:before {
    content: "\e78e";
}
}

</style>
<style  lang="scss">
.vue-treeselect_placeholder{
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    font-size: 12px;
    padding-top: -1px !important;
}
</style>
