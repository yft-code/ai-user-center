<template>
  <div class="wrapper">
    <common-table
      ref="table"
      :data-flag="dataFlag"
      :table-config="tableConfig"
      :top-search-config="topSearchConfig"
      :table-data="formData"
      :is-pagination="false"
      @search-info="getSearchInfo"
      @get-table-data="getData"
    />
  </div>
</template>

<script>
import CommonTable from '@/components/CommonTable'
export default {
  name: 'ViewTask',
  components: {
    CommonTable
  },
  props: {
    formData: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      // 由父组件传递数据
      dataFlag: true,
      // 搜索栏
      topSearchConfig: {
        // 行之间的间距
        gutterList: 20,
        // 搜索框组件配置
        eleComponents: [
          {
            // 类型必传
            type: 'date',
            // 时间范围类型
            dateType: 'daterange',
            // 左边字段名称 可传可不传
            label: '操作时间',
            // 搜索字段绑定的值，必穿
            value: '',
            // 控件name可传可不传
            name: 'operateTime',
            // 样式可传可不传
            style: {
            },
            // 每列所占的份额  一共24
            // 每个屏幕各个字段所占份额
            lg: 6,
            md: 6,
            sm: 6,
            xl: 6
          },
          {
            // 类型必传
            type: 'input',
            // 左边字段名称 可传可不传
            label: '任务编码',
            // 控件name可传可不传
            name: 'taskID',
            // 样式可传可不传
            style: {
              // marginLeft: this.matchScreen()
            },
            // 占位内容 可传可不传
            placeholder: '请输入任务编码',
            // 每列所占的份额  一共24
            // 每个屏幕各个字段所占份额
            lg: 6,
            md: 6,
            sm: 6,
            xl: 6
          },
          {
            // 类型必传
            type: 'input',
            // 左边字段名称 可传可不传
            label: '操作人',
            // 搜索字段绑定的值，必穿
            value: '',
            // 控件name可传可不传
            name: 'operator',
            // 样式可传可不传
            style: {},
            // 占位内容 可传可不传
            placeholder: '请输入操作人',
            // 每列所占的份额  一共24
            // 每个屏幕各个字段所占份额
            lg: 6,
            md: 6,
            sm: 6,
            xl: 6
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
        specialCols: [],
        taskId: {
          label: '任务编码'
        },
        fileName: {
          label: '文件名'
        },
        taskState: {
          label: '任务状态'
        },
        total: {
          label: '总条数'
        },
        success: {
          label: '成功条数'
        },
        failure: {
          label: '失败条数'
        },
        operator: {
          label: '操作人'
        },
        startDate: {
          label: '开始日期'
        },
        endDate: {
          label: '结束日期'
        }
      },
      // 表格样式
      tableConfig: {
        width: '100%',
        height: '300px'
      }
    }
  },
  mounted() {
    this.getData()
  },
  methods: {
    // 表格获取数据
    getData() {
      this.$refs.table.getShowCols(this.formData, this.columns)
      this.$refs.table.loading = false
    },
    getSearchInfo(filterParams) {
      // 获取搜索字段
    }
  }
}
</script>

<style scoped>

</style>
