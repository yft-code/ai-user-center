<template>
  <div>
    <el-dialog
      title="查看任务"
      :visible.sync="visible"
      width="75%"
      :before-close="handleClose"
    >
      <div class="mul_container">
        <div class="inner_container">
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
            :table-column-match="taskCol"
            :params="params"
            @get-table-data="getData"
          >
            <template v-slot:userType="data">
              {{ data.row.userType===0?'内部用户':'外部用户' }}
            </template>
            <template v-slot:status="data">
              <el-switch
                v-model="data.row.status"
                active-color="#347FFF"
                inactive-color="#9B9FAC"
                :active-value="true"
                :inactive-value="false"
                @change="switchChange($event,data.row.status,data.row)"
              />
            </template>
          </common-table>
        </div>
      </div>
      <span slot="footer" class="dialog-footer btn_group">
        <el-button size="mini" @click="handleClose">取 消</el-button>
        <el-button size="mini" type="primary" @click="getparams">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import CommonTable from '@/components/CommonTable'
import { getTableData, deleteActionsInData } from '@/api/table'
import { taskCol } from '@/utils/table-column-match'
export default {
  name: 'CheckTasks',
  components: {
    CommonTable
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    checkFlag: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      // 参数
      params: {},
      getTableData,
      deleteActionsInData,
      taskCol,
      // 批量操作选中的数据
      length: 0,
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
          width: '50px',
          align: 'center',
          fixed: 'right',
          btnBox: [
            {
              name: '下载',
              type: 'text',
              size: 'mini',
              callback: (index, row) => {
                console.log('编辑成')
                console.log(index, row)
                console.log(this.topSearchConfig)
                this.modelConfig.visibleFlag = true
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
            type: 'date',
            // 左边字段名称 可传可不传
            label: '操作时间',
            // 控件name必传,参数名称
            name: 'account',
            // 样式可传可不传
            style: {},
            // 占位内容 可传可不传
            placeholder: '请输入状态',
            // 每列所占的份额  一共24
            // 每个屏幕各个字段所占份额
            lg: 5,
            md: 5,
            sm: 5,
            xl: 5
          },
          // 同一块布局中可以包含多个按钮
          {
            type: 'input',
            label: '任务编码',
            name: 'name',
            // xl: 4,
            lg: 5,
            md: 5,
            sm: 5,
            xl: 5

          },
          {
            type: 'input',
            label: '操作人',
            name: 'phone',
            // xl: 4,
            lg: 5,
            md: 5,
            sm: 5,
            xl: 5

          },
          // 占位
          {
            type: 'seat',
            lg: 5,
            md: 5,
            sm: 5,
            xl: 5
          },
          {
            type: 'btn',
            // xl: 4,
            lg: 4,
            md: 4,
            sm: 4,
            xl: 4,
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
                  console.log('params', this.params)
                }
              },
              {
                name: '重置',
                size: 'mini',
                btnType: '',
                callback: (values) => {
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
        pageSize: 5,
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
        pageSizes: [5]
      },
      // 为true时父组件获取数据，false时只需传入对应url子组件即可自动获取数据
      dataFlag: true,
      urlList: {
        // 给父链接则从父组件中请求  子链接传值则从子组件中请求
        tableDataUrl: 'http://vechicle.huqiapp.top/digital-mine/report/findAll',
        delUrl: 'http://vechicle.huqiapp.top/digital-mine/report/remove'
      }
    }
  },
  watch: {
    visible() {
      if (this.checkFlag) {
        this.timeout = setTimeout(() => {
          const params = {
            pageSize: this.pageConfig.pageSize,
            pageNum: this.pageConfig.currentPage
          }
          console.log('查看任务params', params)
          this.getData(params)
        }, 500)
      // this.getparams()
      }
    }
  },
  // mounted() {
  //   console.log('flag', this.checkFlag)
  //   // 父组件中调用接口获取后端数据
  //   this.$nextTick(() => {
  //     if (this.dataFlag) {
  //       this.timeout = setTimeout(() => {
  //         const params = {
  //           pageSize: this.pageConfig.pageSize,
  //           pageNum: this.pageConfig.currentPage
  //         }
  //         console.log('查看任务params', params)
  //         this.getData(params)
  //       }, 10000)
  //     }
  //   })
  // },
  methods: {
    getparams() {
      const params = {
        pageSize: this.pageConfig.pageSize,
        pageNum: this.pageConfig.currentPage
      }
      console.log('查看任务params', params)
      this.getData(params)
    },
    handleClose() {
      this.$emit('close-callback')
    },
    // 修改状态
    // 批量删除接口
    // delData() {
    //   const ids = []
    //   this.selectArr && this.selectArr.map(item => {
    //     ids.push(item.id)
    //   })
    //   console.log('删除params', ids)
    //   this.$confirm('确认要删除这条员工数据吗?', '提示', {
    //     confirmButtonText: '确定',
    //     cancelButtonText: '取消',
    //     type: 'warning'
    //   }).then(() => {
    //     api.Muldelete(this.urlList.delUrl, ids).then(() => {
    //       this.getData(this.params)
    //       this.$message({
    //         type: 'success',
    //         message: '删除成功'
    //       })
    //     }).catch()
    //   }).catch(() => {
    //     this.$message({
    //       type: 'info',
    //       message: '取消删除'
    //     })
    //   })
    //   // deleteActionsInData(this.urlList.delUrl, params).then((res) => {
    //   //   // 做些事情
    //   //   this.$message.success(`已成功删除${res.result.length}条数据`)
    //   //   this.getData({})
    //   // }).catch((err) => {
    //   //   console.log(err)
    //   // })
    // },
    // getData(params) {
    //   // params.pageSize = this.pageConfig.pageSize
    //   // params.pageNum = this.pageConfig.currentPage
    //   // console.log('yhm', params)
    //   // api.getUserList(this.urlList.tableDataUrl, params).then(res => {
    //   //   console.log('res', res)
    //   //   console.log('resXXX', res.data.list)
    //   //   this.tableData = res.data.list
    //   //   this.pageConfig.total = res.data.total
    //   //   this.$refs.table.getShowCols(this.tableData, manageUser)
    //   // }).catch(() => {
    //   //   this.$refs.table.loading = false
    //   //   this.$refs.table.getShowCols(this.tableData, manageUser)
    //   // })

    // // this.pageConfig.total = 10
    // },
    // 表格数据请求接口
    getData(params) {
      console.log('方法被调用了')
      // this.$refs.table.loading = false
      const data = [
        {
          account: '001',
          name: '里哈哈',
          status: '成功',
          total: '33',
          sucessAccount: '内部用户',
          failAccount: '叮当公司',
          userName: '123@xxx.com',
          start: '2021-1-10 3:06:08',
          end: '2021-1-09 6:09:10'
        },
        {
          account: '002',
          name: '里哈哈',
          status: '成功',
          total: '33',
          sucessAccount: '内部用户',
          failAccount: '叮当公司',
          userName: '123@xxx.com',
          start: '2021-1-10 3:06:08',
          end: '2021-1-09 6:09:10'
        },
        {
          account: '003',
          name: '里哈哈',
          status: '成功',
          total: '33',
          sucessAccount: '内部用户',
          failAccount: '叮当公司',
          userName: '123@xxx.com',
          start: '2021-1-10 3:06:08',
          end: '2021-1-09 6:09:10'
        }
      ]
      this.tableData = data
      this.pageConfig.total = 5
      this.$refs.table.getShowCols(this.tableData, taskCol)
    },
    // 获取搜索字段内容
    getSearchInfo(filterParams) {
      console.log('filterParams', filterParams)
      const rules = []
      for (const key in filterParams) {
        rules.push({
          key: key,
          relation: 'like',
          value: filterParams[key]
        })
      }
      console.log('params', rules)
      this.getData(filterParams)
    }
  }
}
</script>
<style lang="scss" scoped>
.mul_container{
    width: 99%;
    border-top: 1px solid  #f3f3f5;
    // margin: -50px auto;
    margin-top: -27px;
    // background-color:rgba(247, 248, 249);
    .inner_container{
      width: 100%;
      // background-color: lightpink;
      // height: 40px;
      margin: 20px auto;
      }
      .el-dialog__body {
    padding: 0px 20px;
}
     ::v-deep .pagination[data-v-180a9d34] {
    margin-top: 20px;
}

}
</style>
<style lang="scss">
.mul_container{
::v-deep .el-dialog__body {
    padding: 0px 20px !important;
}
}
</style>
