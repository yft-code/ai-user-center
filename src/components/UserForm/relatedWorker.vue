<template>
  <div class="wrapper">
    <common-table
      ref="table"
      :data-flag="dataFlag"
      :table-config="tableConfig"
      :top-search-config="topSearchConfig"
      :page-config="relatedPagination"
      :table-data="tableData"
      @search-info="getSearchInfo"
      @get-table-data="getData"
      @relate-worker="handleRecordRelatedWorker"
    />
    <div class="operation">
      <div class="wrapper">
        <el-button size="small" @click="handleCancel">取消</el-button>
        <el-button type="primary" size="small" @click="handleRelatedWorker">确定</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import CommonTable from '@/components/CommonTable'
import * as api from '@/api/userInfo'
import { bindUser } from '../../api/org'

export default {
  name: 'RelatedWorker',
  components: {
    CommonTable
  },
  props: {
    organizationId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      // 由本组件的数据传递给common-table
      dataFlag: true,
      // 搜索框
      topSearchConfig: {
        // 行之间的间距
        gutterList: 20,
        // 搜索框组件配置
        eleComponents: [
          {
            // 类型必传
            type: 'input',
            // 左边字段名称 可传可不传
            label: '手机号',
            // 搜索字段绑定的值，必穿
            value: '',
            // 控件name可传可不传
            name: 'phone',
            // 样式可传可不传
            style: {},
            // 占位内容 可传可不传
            placeholder: '请输入手机号',
            // 每列所占的份额  一共24
            // 每个屏幕各个字段所占份额
            lg: 8,
            md: 8,
            sm: 8,
            xl: 8
          },
          {
            // 类型必传
            type: 'input',
            // 左边字段名称 可传可不传
            label: '账号',
            // 搜索字段绑定的值，必穿
            value: '',
            // 控件name可传可不传
            name: 'userAccount',
            // 样式可传可不传
            style: {},
            // 占位内容 可传可不传
            placeholder: '请输入账号',
            // 每列所占的份额  一共24
            // 每个屏幕各个字段所占份额
            lg: 8,
            md: 8,
            sm: 8,
            xl: 8
          },
          {
            type: 'seat',
            // xl: 16,
            lg: 3,
            md: 3,
            sm: 3,
            xl: 3
          },
          {
            type: 'btn',
            // xl: 4,
            lg: 3,
            md: 3,
            sm: 3,
            xl: 3,
            style: { marginRight: '-250px' },
            btnList: [
              {
                name: '查询',
                size: 'small',
                btnType: 'primary',
                callback: (values) => {
                }
              },
              {
                name: '重置',
                size: 'small',
                btnType: 'primary',
                callback: (values) => {}
              }
            ]
          }
        ]
      },
      // 表头
      columns: {
        specialCols: [
          {
            prop: 'selection',
            label: '',
            width: '',
            align: 'center'
          }
        ],
        name: {
          label: '姓名'
        },
        userAccount: {
          label: '账号'
        },
        phone: {
          label: '手机号'
        },
        email: {
          label: '邮箱'
        }
      },
      // 表格样式
      tableConfig: {
        width: '100%',
        maxHeight: '300px'
      },
      // 表格分页
      relatedPagination: {
        total: 0
      },
      // 表格数据
      tableData: [],
      selectedData: []
    }
  },
  mounted() {
    this.$nextTick(() => {
      if (this.dataFlag) {
        this.getData()
      }
    })
  },
  methods: {
    // 表格获取数据
    getData(params) {
      api.getUserList('user/queryByParameters', params).then(res => {
        const { result } = res
        this.tableData = result.list
        this.relatedPagination.total = result.total
        this.$refs.table.getShowCols(this.tableData, this.columns)
        this.$refs.table.loading = false
      }).catch(() => {
        this.$refs.table.loading = false
        this.$refs.table.getShowCols(this.tableData, this.columns)
      })
      this.$refs.table.loading = false
    },
    getSearchInfo(filterParams) {
      // 获取筛选字段的值
      this.getData(filterParams)
    },
    // 获取勾选字段
    handleRecordRelatedWorker(obj) {
      this.selectedData = obj
    },
    // 关联员工
    handleRelatedWorker() {
      const param = {
        organizationId: this.organizationId,
        bindUserOrgVOS: []
      }
      for (const item of this.selectedData) {
        param.bindUserOrgVOS.push({
          userId: item.id
        })
      }
      bindUser(param).then(res => {
        if (res.code === 0) {
          this.$message.success('关联用户成功')
          this.$emit('relate-success')
        } else {
          this.$message.error(res.message)
          this.$emit('dialog-cancel')
        }
      }).catch(e => {
        this.$message.error('关联用户失败')
        this.$emit('dialog-cancel')
      })
    },
    // 取消关联
    handleCancel() {
      this.$emit('dialog-cancel')
    }
  }
}
</script>

<style scoped lang="scss">
  .operation{
    padding-top: 20px;
    width: 100%;
    height: 40px;
    position: relative;
    .wrapper {
      position: absolute;
      right: 10px;
      bottom: 0;
    }
  }
</style>
