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
        :table-column-match="postCol"
        @search-info="getSearchInfo"
        @get-table-data="getData"
        @reset="reset"
      >
        <template #selectTree>
          <el-form-item size="mini" label="所属公司" style="width: 100%">
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
        <template #operBtn>
          <div class="btn_group">
            <el-button size="mini" type="primary" @click="handleAdd">添加岗位</el-button>
          </div>
        </template>
        <template v-slot:remarks="data">
          {{ data.row.remarks?data.row.remarks:'--' }}
        </template>
      </common-table>
    </div>
    <el-dialog
      :title="viewDialogTitle"
      :visible="viewDialog"
      width="41.5%"
      :close-on-click-modal="false"
      destroy-on-close
      @close="handleViewClose"
    >
      <position-form
        ref="positionForm"
        :form-data="isAdd ? {} : positionFormData"
        :is-add="isAdd"
        @post-add="handleAddPosition"
        @post-edit="handleEditPosition"
        @cancel-add="handleViewClose"
      />
    </el-dialog>
  </div>
</template>
<script>
import TreeSelect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import CommonTable from '@/components/CommonTable'
import PositionForm from '@/components/PositionForm'
import { postCol } from '@/utils/table-column-match'
import * as api from '@/api/post'
import { addPosition, updatePosition } from '../../api/post'

export default {
  name: 'Banner',
  components: {
    CommonTable,
    TreeSelect,
    PositionForm
  },
  data() {
    return {
      // 是否第一次打开
      firstOpen: true,
      // 岗位表单数据
      positionFormData: {},
      // 是否为新增
      isAdd: true,
      // dialog标题
      viewDialogTitle: '',
      // 是否开启dialog
      viewDialog: false,
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
      postCol,
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
                this.viewDialogTitle = '编辑岗位'
                this.isAdd = false
                this.positionFormData = row
                if (!this.firstOpen) {
                  this.$refs.positionForm.resetForm()
                } else {
                  this.firstOpen = false
                }
                this.viewDialog = true
              }
            },
            {
              name: '删除',
              type: 'text',
              size: 'mini',
              callback: (index, row) => {
                const params = { positionId: row.id }
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
            label: '岗位名称',
            // 控件name必传,参数名称
            name: 'positionName',
            // 样式可传可不传
            style: {},
            // 占位内容 可传可不传
            placeholder: '请输入',
            // 每列所占的份额  一共24
            // 每个屏幕各个字段所占份额
            lg: 6,
            md: 6,
            sm: 6,
            xl: 6
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
            type: 'date-demo',
            label: '创建时间',
            placeholder: '请选择',
            // xl: 4,
            lg: 8,
            md: 8,
            sm: 8,
            xl: 8
          },
          {
            type: 'btn',
            lg: 4,
            md: 4,
            sm: 4,
            xl: 4,
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
        tableDataUrl: 'position/queryPosition',
        delUrl: 'position/deletePosition'
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
        const params = {
          pageSize: this.pageConfig.pageSize,
          pageNum: this.pageConfig.currentPage
        }
        this.getData(params)
      }
    })
  },
  methods: {
    // 更新岗位
    handleEditPosition(obj) {
      updatePosition(obj).then(res => {
        if (res.code === 0) {
          this.$message.success('添加岗位成功')
          this.getData({})
          this.viewDialog = false
          if (!this.firstOpen) {
            this.$refs.positionForm.resetForm()
          } else {
            this.firstOpen = false
          }
        }
      }).catch(e => {
        this.$message.error('添加岗位失败')
      })
    },
    // 添加岗位
    handleAddPosition(obj) {
      obj.orgId = obj.orgId[obj.orgId.length - 1]
      addPosition(obj).then(res => {
        if (res.code === 0) {
          this.$message.success('添加岗位成功')
          this.getData({})
          this.viewDialog = false
          if (!this.firstOpen) {
            this.$refs.positionForm.resetForm()
          } else {
            this.firstOpen = false
          }
        }
      }).catch(e => {
        this.$message.error('添加岗位失败')
      })
    },
    // 关闭模态框
    handleViewClose() {
      this.viewDialog = false
    },
    // 新增角色
    handleAdd() {
      this.viewDialogTitle = '添加岗位'
      if (!this.firstOpen) {
        this.$refs.positionForm.resetForm()
      } else {
        this.firstOpen = false
      }
      this.isAdd = true
      this.viewDialog = true
    },
    // 对时间处理
    changeTime(e) {
      if (e) {
        this.startTime = e[0]
        this.endTime = e[1]
      }
    },
    // 清空数据
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
      api.getPostion(this.urlList.tableDataUrl, params).then(res => {
        const { result } = res
        this.tableData = result.list
        this.pageConfig.total = result.total
        this.$refs.table.getShowCols(this.tableData, postCol)
        this.$refs.table.loading = false
      }).catch(() => {
        this.$refs.table.loading = false
        this.$refs.table.getShowCols(this.tableData, postCol)
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
