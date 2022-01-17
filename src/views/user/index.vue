<template>
  <div class="userContainer viewIndex banner" style="padding:20px">
    <div class="content">
      <common-table
        ref="table"
        :data-flag="dataFlag"
        :get-table-data="getTableData"
        :delete-actions-in-data="deleteActionsInData"
        :url="urlList.tableDataUrl"
        :del-url="urlList.delUrl"
        :top-search-config="topSearchConfig"
        :table-data="tableData"
        :page-config="pageConfig"
        :alter-flag="alterFlag"
        :operation-cols="operationCols"
        :table-column-match="manageUser"
        @search-info="getSearchInfo"
        @get-table-data="getData"
        @del-data="delData"
        @delete="muldeteData"
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
        <template #operBtn>
          <div class="btn_group">
            <el-button size="mini" type="primary" @click="addNewUser">添加新员工</el-button>
            <el-button size="mini" @click="mulImport">批量导入</el-button>
            <el-button size="mini" :disabled="flag" @click="delData">批量删除</el-button>
            <el-button size="mini" type="primary" disabled @click="checkTasks">查看任务</el-button>
          </div>
        </template>
        <template v-slot:userType="data">
          {{ data.row.userType===0?'内部用户':'外部用户' }}
        </template>
        <template v-slot:status="data">
          <el-switch
            v-model="data.row.status"
            active-color="#347FFF"
            inactive-color="#9B9FAC"
            :active-value="0"
            :inactive-value="1"
            @change="switchChange($event,data.row.status,data.row)"
          />
        </template>
        <template v-slot:organizations="data">
          <span v-if="data.row.organizations.length <= 0">--</span>
          <span v-else>{{ getShowOrganization(data.row.organizations) }}</span>
        </template>
      </common-table>

      <!--新增数据弹出框-->
      <el-dialog
        :title="modalTitle"
        :visible="addOrEditVisible"
        :width="modalWidth"
        :close-on-click-modal="false"
        destroy-on-close
        @close="handleModalCancel"
      >
        <user-form
          ref="userForm"
          :form-data="!isDisabled ? {} : userFormData"
          :is-disabled="isDisabled"
          @user-add="handleAddUser"
          @user-edit="handleEditUser"
          @cancel-add="handleModalCancel"
        />
      </el-dialog>

      <!-- 批量导入导出 -->
      <export-file :visible="mulVisible" @close-callback="handleClose" />
      <!-- 查看任务 -->
      <check-tasks :check-flag="checkFlag" :visible="checkVisible" @close-callback="handleClose1" />
    </div>
  </div>
</template>
<script>
import TreeSelect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import exportFile from '@/views/user/exportFile'
import CommonTable from '@/components/CommonTable'
import { getTableData, deleteActionsInData } from '@/api/table'
import { manageUser } from '@/utils/table-column-match'
import * as api from '@/api/userInfo'
import { addUser, updateUser } from '@/api/userInfo'
// import ExportFile from './exportFile.vue'
import CheckTasks from './checkTasks.vue'
import UserForm from '@/components/UserForm'
export default {
  name: 'Banner',
  components: {
    CommonTable,
    exportFile,
    CheckTasks,
    UserForm,
    TreeSelect
  },
  data() {
    return {
      text: '无数据',
      value: null,
      // 组织树数据
      data: [],
      // 第一次打开Form
      firstOpen: true,
      checkFlag: false,
      // 查看任务
      flag: true,
      // 批量删除的数据
      selectArr: [],
      // 编辑用户传入表格的数据
      userFormData: {},
      // 弹出框标题
      modalTitle: '',
      modalWidth: '45%',
      // addOredit
      addOrEditVisible: false,
      // 是否禁用
      isDisabled: false,
      // 表数据
      formData: {},
      // 参数
      params: {},
      getTableData,
      deleteActionsInData,
      manageUser,
      // 批量操作选中的数据
      length: 0,
      // 新增、编辑、查看
      isAdd: false,
      width: 300,
      isEdit: false,
      isView: false,
      // 批量导入
      mulVisible: false,
      // 任务查看
      checkVisible: false,
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
                this.modalTitle = '编辑员工数据'
                this.modalWidth = '86%'
                this.isDisabled = true
                this.userFormData = row
                this.addOrEditVisible = true
                if (!this.firstOpen) {
                  this.$refs.userForm.resetForm()
                } else {
                  this.firstOpen = false
                }
              }
            },
            {
              name: '删除',
              type: 'text',
              size: 'mini',
              callback: (index, row) => {
                const ids = []
                ids.push(row.id)
                this.$confirm('确认要删除这条员工数据吗?', '提示', {
                  confirmButtonText: '确定',
                  cancelButtonText: '取消',
                  type: 'warning'
                }).then(() => {
                  api.Muldelete(this.urlList.delUrl, ids).then(() => {
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
            label: '账号',
            // 控件name必传,参数名称
            name: 'userAccount',
            // 样式可传可不传
            style: {},
            // 占位内容 可传可不传
            placeholder: '请输入',
            // 每列所占的份额  一共24
            // 每个屏幕各个字段所占份额
            lg: 5,
            md: 6,
            sm: 6,
            xl: 5
          },
          // 同一块布局中可以包含多个按钮
          {
            type: 'input',
            label: '姓名',
            name: 'name',
            placeholder: '请输入',
            // xl: 4,
            lg: 5,
            md: 6,
            sm: 6,
            xl: 5

          },
          {
            type: 'input',
            label: '手机号',
            name: 'phone',
            placeholder: '请输入',
            // xl: 4,
            lg: 5,
            md: 6,
            sm: 6,
            xl: 5

          },
          {
            type: 'select',
            label: '用户类型',
            placeholder: '请选择',
            name: 'userType',
            options: [
            //   {
            //   value: 'all',
            //   label: '全部'
            // },
              {
                value: '1',
                label: '外部用户'
              },
              {
                value: '0',
                label: '内部用户'
              }
            ],
            // xl: 4,
            lg: 5,
            md: 6,
            sm: 6,
            xl: 5
          },
          {
            placeholder: '请选择',
            type: 'select',
            label: '状态',
            name: 'status',
            options: [
              {
                value: 0,
                label: '启用'
              },
              {
                value: 1,
                label: '禁用'
              }
            ],
            lg: 4,
            md: 6,
            sm: 6,
            xl: 4
          },
          // // 布局占位内容字段
          {
            placeholder: '请选择',
            type: 'select-demo',
            label: '所属机构',
            name: 'organizationId',
            // xl: 16,
            lg: 15,
            md: 6,
            sm: 6,
            xl: 15
          },
          {
            type: 'btn',
            // xl: 4,
            lg: 9,
            md: 12,
            sm: 12,
            xl: 9,
            style: {
              float: 'right',
              marginRight: '0px'
              // background:'red'
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
                name: '重置',
                size: 'mini',
                btnType: '',
                callback: (values) => {
                  this.value = null
                }
              }
            ]
          }
        ]
      },
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
        tableDataUrl: 'user/queryByParameters',
        delUrl: 'user/deleteByIds'
      }
    }
  },
  mounted() {

  },
  created() {
    // 父组件中调用接口获取后端数据
    this.$nextTick(() => {
      this.getOrangize()
      if (this.dataFlag) {
        // pagesize,pageNo,升降序等参数
        // const params = {
        //   rules: [

        //   ]
        // }
        const params = {
          pageSize: this.pageConfig.pageSize,
          pageNum: this.pageConfig.currentPage
        }
        this.getData(params)
      }
    })
  },
  methods: {
    reset() {
      this.value = null
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
        res.push(item.organizationName)
      }
      return res.join(',')
    },
    //  getShowOrganization(obj) {
    //   const res = []
    //   for (const item of obj) {
    //     if (item.organizationName === null) {
    //       res.push('--')
    //     } else {
    //       res.push(item.organizationName)
    //     }
    //   }
    //   return res.join(',')
    // },
    // 模态框取消调用
    handleModalCancel() {
      // 不可添加 否则编辑提交时会重置数据，导致修改结果被重置
      // this.$refs.userForm.resetForm()
      this.addOrEditVisible = false
    },
    // 修改状态
    switchChange(callback, state, row) {
      const params = {
        pageSize: this.pageConfig.pageSize,
        pageNum: this.pageConfig.currentPage
      }
      api.updateUser(row).then(res => {
        if (res.code === 0) {
          this.$message({
            type: 'success',
            message: '修改状态成功'
          })
          this.getData(params)
        } else {
          this.getData(params)
          this.$message({
            type: 'warning',
            message: '修改状态失败'
          })
        }
      }).catch(() => {
        this.getData(params)
        this.$message({
          type: 'warning',
          message: '修改状态失败'
        })
      })
    },
    // 更新用户信息
    handleEditUser(obj) {
      if (obj.birthday && obj.birthday instanceof Date) {
        obj.birthday = obj.birthday.toLocaleDateString().replace(/\//g, '-') + ' 00:00:00'
      }
      updateUser(obj).then(res => {
        if (res.code === 0) {
          this.$message.success('更新用户信息成功')
          this.$refs.userForm.resetForm()
          this.modalWidth = '45%'
          this.getData({})
        } else {
          this.$message.error('更新用户信息失败')
        }
      }).catch(e => {
        this.$message.error('更新用户信息失败')
      })
      this.addOrEditVisible = false
    },
    // 添加用户
    handleAddUser(obj) {
      if (obj.birthday) {
        obj.birthday = obj.birthday.toLocaleDateString().replace(/\//g, '-') + ' 00:00:00'
      }
      if (obj.validDate) {
        obj.validDate = obj.validDate.toLocaleDateString().replace(/\//g, '-') + ' 00:00:00'
      }
      obj.orgId = obj.orgId[obj.orgId.length - 1] + ''
      addUser(obj).then(res => {
        if (res.code === 0) {
          this.$message.success('添加用户成功')
          this.$refs.userForm.resetForm()
          this.getData({})
          this.addOrEditVisible = false
        } else {
          this.$message.error('添加用户失败')
          this.addOrEditVisible = false
        }
      }).catch(e => {
        this.$message.error('添加用户失败')
        this.addOrEditVisible = false
      })
    },
    // 点击新增员工触发
    addNewUser() {
      this.modalTitle = '添加用户'
      this.isDisabled = false
      this.modalWidth = '45%'
      this.addOrEditVisible = true
      if (!this.firstOpen) {
        this.$refs.userForm.resetForm()
      } else {
        this.firstOpen = false
      }
    },
    // 关闭批量导入弹框
    handleClose() {
      this.mulVisible = false
    },
    // 关闭任务查看弹框
    handleClose1() {
      this.checkFlag = false
      this.checkVisible = false
    },
    // 任务查看
    checkTasks() {
      this.checkFlag = true
      this.checkVisible = true
    },
    // 批量导入
    mulImport() {
      this.mulVisible = true
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
    // 获取批量删除数据
    muldeteData(val) {
      this.selectArr = val
      if (this.selectArr.length > 0) {
        this.flag = false
      } else {
        this.flag = true
      }
    },
    // 批量删除接口
    delData() {
      const ids = []
      this.selectArr && this.selectArr.map(item => {
        ids.push(item.id)
      })
      this.$confirm('确认要删除这条员工数据吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        api.Muldelete(this.urlList.delUrl, ids).then(() => {
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
    },
    // 获取人员列表
    getData(params) {
      // params.pageSize = this.pageConfig.pageSize
      // params.pageNum = this.pageConfig.currentPage
      api.getUserList(this.urlList.tableDataUrl, params).then(res => {
        const { result } = res
        this.tableData = result.list
        this.pageConfig.total = result.total
        this.$refs.table.getShowCols(this.tableData, manageUser)
        this.$refs.table.loading = false
      }).catch(() => {
        this.$refs.table.loading = false
        this.$refs.table.getShowCols(this.tableData, manageUser)
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
      filterParams.organizationId = this.value
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
