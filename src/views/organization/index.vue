<template>
  <div class="orgContainer viewIndex banner">
    <div class="org_tree">
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="部门" name="first">
          <div class="inner_container">
            <org ref="org" @fetch="fetch" />
          </div>
        </el-tab-pane>
        <el-tab-pane label="员工" name="second">
          <employee />
        </el-tab-pane>
      </el-tabs>
    </div>
    <div class="message_user">
      <div class="inner_user">
        <p class="base_message">基本信息</p>
        <div class="sencod_container">
          <div class="company_name">{{ company?company:'etaas' }}</div>
          <div><el-button size="mini" @click="editOrg">编辑</el-button></div>
        </div>
        <p>员工信息</p>
        <div>
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
            :table-column-match="orgCol"
            @search-info="getSearchInfo"
            @get-table-data="getData"
            @del-data="delData"
            @delete="muldeteData"
          >
            <template #operBtn>
              <div class="btn_group">
                <el-button size="mini" type="primary" @click="handleAdd">添加员工</el-button>
                <el-button size="mini" @click="handleRelated">关联员工</el-button>
                <el-button size="mini" :disabled="flag" @click="delData">批量删除</el-button>
                <el-button size="mini" @click="mulImport">批量导入</el-button>
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
                @change="switchEdit($event,data.row.status,data.row)"
              />
            </template>
          </common-table>
        </div>
      </div>
    </div>
    <el-dialog
      :title="viewDialogTitle"
      :visible="viewDialog"
      :width="viewDialogWidth"
      :close-on-click-modal="false"
      destroy-on-close
      @close="handleViewClose"
    >
      <template v-if="this.viewType === 0">
        <org-user-form
          ref="userForm"
          :form-data="!isDisabled ? {} : userFormData"
          @user-add="handleAddUser"
          @user-edit="handleEditUser"
          @cancel-add="handleViewClose"
        />
      </template>
      <template v-if="this.viewType === 1">
        <related-worker
          :organization-id="organizationId"
          @relate-success="handleRelateSuccess"
          @dialog-cancel="handleViewClose"
        />
      </template>
    </el-dialog>
    <!-- 批量导入导出 -->
    <export-file :visible="mulVisible" @close-callback="handleClose" />
    <!-- 查看任务 -->
    <check-tasks :check-flag="checkFlag" :visible="checkVisible" @close-callback="handleClose1" />
    <!-- 编辑组织机构 -->
    <div>
      <el-dialog
        title="编辑部门"
        :visible.sync="orgVisible"
        width="30%"
        :before-close="closeOrg"
      >
        <div class="add_form">
          <div class="inner_form">
            <el-form ref="form" :model="form" label-width="40px" size="mini">
              <el-form-item label="编码">
                <el-input v-model="organizationId" disabled />
              </el-form-item>
              <el-form-item label="名称">
                <el-input v-model="orgName" />
              </el-form-item>
              <el-form-item label="状态">
                <el-switch
                  v-model="status"
                  active-color="#347FFF"
                  inactive-color="#9B9FAC"
                  :active-value="0"
                  :inactive-value="1"
                  @change="switchChange"
                />
              </el-form-item>
            </el-form>
          </div>
        </div>
        <span slot="footer" class="dialog-footer">
          <el-button size="mini" @click="closeOrg">取消</el-button>
          <el-button size="mini" type="primary" @click="addOrg">确定</el-button>
        </span>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import CheckTasks from '@/views/user/checkTasks'
import exportFile from '@/views/user/exportFile'
import * as api from '@/api/userInfo'
import * as orgApi from '@/api/org'
import { getTableData, deleteActionsInData } from '@/api/table'
import { addUser, updateUser } from '../../api/userInfo'
import { orgCol } from '@/utils/table-column-match'
import RelatedWorker from '@/components/UserForm/relatedWorker'
import CommonTable from '@/components/CommonTable'
import employee from '@/views/organization/employee'
import Org from './org.vue'
import OrgUserForm from '@/components/OrgUserForm/index'
export default {
  name: 'Index',
  components: {
    Org,
    employee,
    CommonTable,
    exportFile,
    CheckTasks,
    RelatedWorker,
    OrgUserForm
  },
  data() {
    return {
      form: {},
      orgName: '',
      orgVisible: false,
      status: '1',
      company: '',
      organizationId: '',
      // 是否禁用
      isDisabled: false,
      // 编辑用户传入表格的数据
      userFormData: {},
      // 第一次打开用户新增表
      firstOpen: true,
      // 批量导入
      mulVisible: false,
      // 任务查看
      checkVisible: false,
      // 查看类型
      viewType: 0,
      // dialog显隐
      viewDialog: false,
      // dialog标题
      viewDialogTitle: '',
      // dialog宽度
      viewDialogWidth: '',
      activeName: 'first',
      checkFlag: false,
      // 查看任务
      flag: true,
      // 批量删除的数据
      selectArr: [],
      getTableData,
      deleteActionsInData,
      orgCol,
      // 批量操作选中的数据
      length: 0,
      // 新增、编辑、查看
      isAdd: false,
      width: 300,
      isEdit: false,
      isView: false,
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
                this.viewDialogTitle = '编辑员工信息'
                this.viewDialogWidth = '86%'
                this.viewType = 0
                this.isDisabled = true
                this.userFormData = row
                this.viewDialog = true
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
                const bindUserOrgVOS = []
                const user = {
                  userId: row.id
                }
                bindUserOrgVOS.push(user)
                const delParams = {
                  organizationId: this.organizationId,
                  bindUserOrgVOS: bindUserOrgVOS
                }
                this.$confirm('确认要删除这条员工数据吗?', '提示', {
                  confirmButtonText: '确定',
                  cancelButtonText: '取消',
                  type: 'warning'
                }).then(() => {
                  api.Muldelete(this.urlList.delUrl, delParams).then(() => {
                    const params = {
                      pageSize: this.pageConfig.pageSize,
                      pageNum: this.pageConfig.currentPage,
                      organizationId: this.organizationId
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
        rowCount: 5
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
        delUrl: 'userOrg/deleteNodeUser'
      }
    }
  },
  created() {
    // 父组件中调用接口获取后端数据
    this.$nextTick(() => {
      if (this.dataFlag) {
        const params = {
          pageSize: this.pageConfig.pageSize,
          pageNum: this.pageConfig.currentPage
        }
        this.getData(params)
      }
    })
    // api.getUserList('user/queryByParameters')
  },
  methods: {
    // 编辑修改状态
    switchEdit(callback, state, row) {
      const params = {
        pageSize: this.pageConfig.pageSize,
        pageNum: this.pageConfig.currentPage,
        organizationId: this.organizationId
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
    // 修改状态
    switchChange(data) {
      this.status = data
    },
    // 修改组织部门
    editOrg() {
      this.orgVisible = true
      const params = {
        id: this.organizationId
      }
      orgApi.queryOrgById(params).then(res => {
        const { result } = res
        this.orgName = result.orgName
        this.status = result.status
      }).catch()
    },
    // 关闭组织机构
    closeOrg() {
      this.orgVisible = false
    },
    // 编辑
    addOrg() {
      const params = {
        id: this.organizationId,
        status: this.status,
        orgName: this.orgName
      }
      orgApi.updateOrganization(params).then(() => {
        this.$message.success('修改成功')
        this.$refs.org.getOrangized()
        this.closeOrg()
        const param = {
          id: this.organizationId
        }
        orgApi.queryOrgById(param).then(res => {
          const { result } = res
          this.company = result.orgName
          const params = {
            pageSize: this.pageConfig.pageSize,
            pageNum: this.pageConfig.currentPage,
            organizationId: this.organizationId
          }
          this.getData(params)
        }).catch
      }).catch()
    },
    handleRelateSuccess() {
      // 重新获取列表数据
      this.getData({})
      this.handleViewClose()
    },
    // 更新用户
    handleEditUser(obj) {
      updateUser(obj).then(res => {
        if (res.code === 0) {
          this.$message.success('更新用户信息成功')
          this.$refs.userForm.resetForm()
          const params = {
            pageSize: this.pageConfig.pageSize,
            pageNum: this.pageConfig.currentPage,
            organizationId: this.organizationId
          }
          this.getData(params)
        } else {
          this.$message.error('更新用户信息失败')
        }
      }).catch(e => {
        this.$message.error('更新用户信息失败')
      })
      this.viewDialog = false
    },
    // 查询
    fetch(id, name) {
      this.company = name
      this.organizationId = id
      this.pageConfig.pageSize = 10
      this.pageConfig.currentPage = 1
      const params = {
        pageSize: this.pageConfig.pageSize,
        pageNum: this.pageConfig.currentPage,
        organizationId: this.organizationId
      }
      this.getData(params)
    },
    // 添加用户
    handleAddUser(obj) {
      obj.orgId = this.organizationId
      addUser(obj).then(res => {
        if (res.code === 0) {
          this.$message.success('添加用户成功')
          this.$refs.userForm.resetForm()
          this.pageConfig.pageSize = 10
          this.pageConfig.currentPage = 1
          const params = {
            pageSize: this.pageConfig.pageSize,
            pageNum: this.pageConfig.currentPage,
            organizationId: this.organizationId
          }
          this.getData(params)
          this.viewDialog = false
        } else {
          this.$message.error('添加用户失败')
          this.viewDialog = false
        }
      }).catch(e => {
        this.$message.error('添加用户失败')
        this.viewDialog = false
      })
    },
    // dialog 关闭
    handleViewClose() {
      this.viewDialog = false
    },
    // 添加员工
    handleAdd() {
      this.viewDialogTitle = '添加员工'
      this.isDisabled = false
      this.viewDialogWidth = '45%'
      this.viewType = 0
      this.viewDialog = true
      if (!this.firstOpen) {
        this.$refs.userForm.resetForm()
      } else {
        this.firstOpen = false
      }
    },
    // 关联员工
    handleRelated() {
      // 发请求去请求数据
      this.viewDialogTitle = '关联员工'
      this.viewDialogWidth = '59.6%'
      this.viewType = 1
      this.viewDialog = true
    },
    // 查看任务
    handleViewTask() {
      this.viewDialogTitle = '查看任务'
      this.viewDialogWidth = '86%'
      this.viewType = 2
      this.viewDialog = true
    },
    handleClick(tab, event) {
      console.log(tab, event)
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
      const bindUserOrgVOS = []
      this.selectArr && this.selectArr.map(item => {
        const user = {
          userId: ''
        }
        user.userId = item.id
        bindUserOrgVOS.push(user)
      })
      const delParams = {
        organizationId: this.organizationId,
        bindUserOrgVOS: bindUserOrgVOS
      }
      this.$confirm('确认要删除这条员工数据吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        api.Muldelete(this.urlList.delUrl, delParams).then(() => {
          const params = {
            pageSize: this.pageConfig.pageSize,
            pageNum: this.pageConfig.currentPage,
            organizationId: this.organizationId
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
    getData(params) {
      params.organizationId = this.organizationId
      // this.params = params
      // params.pageSize = this.pageConfig.pageSize
      // params.pageNum = this.pageConfig.currentPage
      api.getUserList(this.urlList.tableDataUrl, params).then(res => {
        const { result } = res
        this.tableData = result.list
        this.pageConfig.total = result.total
        this.$refs.table.getShowCols(this.tableData, orgCol)
        this.$refs.table.loading = false
      }).catch(() => {
        this.$refs.table.loading = false
        this.$refs.table.getShowCols(this.tableData, orgCol)
      })
    },
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
      this.getData(filterParams)
    }
  }
}
</script>

<style lang="scss" scoped>
.orgContainer{
    width:97%;
    display: flex;
    margin: 24px auto;
    border-radius: 8px;
    box-sizing: border-box;
    box-shadow: 0px 0px 7px -3px rgba(33, 72, 141, 0.2);
    .org_tree{
        width: 25%;
        border-right: 1px solid #f3f3f5 ;
        // background: blue;
    }
    .message_user{
        width: 75%;
        .inner_user{
          margin: 15px;
        }
        .sencod_container{
          width: 100%;
          display: flex;
          margin-top: 15px;
          justify-content: space-between;
          padding-bottom: 15px;
          border-bottom: 1px solid #f3f3f5;
        }
        .base_message{
          color:#0A1933;
          font-weight: 550;
          font-size: 14px;
        }
        .company_name{
            color: rgba(10, 25, 51, 0.75);
        }
         .btn_group{
          margin-bottom: 20px;
      // margin-top: -10px;
    }
        // background: brown;
    }
    ::v-deep .el-tabs__nav-scroll{
        width:50%;
        margin:0 auto
      }
}
</style>
