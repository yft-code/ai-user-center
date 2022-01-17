<template>
  <div class="table-box">
    <!-- 传入search配置项 -->
    <el-form ref="form" :size="copyTopSearchConfig.size?copyTopSearchConfig.size : 'auto'" :label-width="copyTopSearchConfig.labelWidth?copyTopSearchConfig.labelWidth : 'auto'">
      <el-row
        :gutter="
          copyTopSearchConfig.gutterList ? copyTopSearchConfig.gutterList : 20
        "
      >
        <!-- 搜索框组件 -->
        <template v-for="(ele, eIndex) in copyTopSearchConfig.eleComponents">
          <el-col
            v-show="(eIndex+1)/copyTopSearchConfig.rowCount<=2 ? true : !collepsis && ele.type!=='btn' "
            v-if="ele.type !== 'btn'"
            :key="eIndex"
            :sm="ele.sm ? ele.sm:'10'"
            :md="ele.md ? ele.md:'10'"
            :lg="ele.lg ? ele.lg:'10'"
            :xl="ele.xl ? ele.xl:'10'"
          >
            <ele-components
              :style="ele.style"
              :item="ele"
              :clear-flag="clearFlag"
              @update-value="getFilterParams"
            >
              <!-- 树形选择框 -->
              <template #selectTree>
                <slot ref="selectTree" name="selectTree" />
              </template>
              <!-- 时间选择器 -->
              <template #dateDemo>
                <slot ref="dateDemo" name="dateDemo" />
              </template>
              <!-- option自定义 -->
              <template #optionDemo>
                <slot ref="optionDemo" name="optionDemo" />
              </template>
            </ele-components>
          </el-col>
          <el-col
            v-else
            :key="eIndex"
            :sm="ele.sm ? ele.sm:'4'"
            :md="ele.md ? ele.md:'4'"
            :lg="ele.lg ? ele.lg:'4'"
            :xl="ele.xl ? ele.xl:'4'"
          >
            <el-form-item class="form-btn" :style="ele.style">
              <el-button
                :size="ele.btnList[0].size"
                :type="ele.btnList[0].btnType"
                @click="submitFormInfo('form')"
              >{{ ele.btnList[0].name }}
              </el-button>
              <el-button
                :size="ele.btnList[1].size"
                :type="ele.btnList[1].btnType"
                @click="resetForm('form')"
              >{{ ele.btnList[1].name }}</el-button>
              <el-link v-if="collepsisFlag" type="primary" style="padding-left:5px" :underline="false" @click="collepsis = !collepsis">{{ collepsis ?'展开':'收起' }}<i :class=" !collepsis?'el-icon-arrow-up':'el-icon-arrow-down'" /></el-link>
            </el-form-item>
          </el-col>
        </template>
      </el-row>
      <!-- 自定义头部字段 -->
      <slot ref="selfSlot" name="operBtn" />
    </el-form>

    <!-- 批量操作按钮 -->

    <el-alert
      v-show="alterFlag"
      type="info"
      :closable="false"
      show-icon
    >
      <template slot="title">
        已选择<span style="color:blue;padding:0 5px">{{ selectArr.length }}</span>项数据
        <!-- <div class="batchBtn" style="cursor: pointer;float:right">
          <el-dropdown @command="handleBatch">
            <span class="el-dropdown-link">
              批量操作<i class="el-icon-arrow-down el-icon--right" />
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="del">删除</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div> -->
      </template>
    </el-alert>

    <el-table
      v-loading="loading"
      :header-cell-class-name="'tableHeaderCell'"
      :data="dataFlag ? tableData : urlTableData"
      :height="tableConfig.height"
      :max-height="maxHeight"
      :width="tableConfig.width"
      :stripe="tableConfig.stripe"
      :border="tableConfig.border"
      :fit="tableConfig.fit"
      :highlight-current-row="tableConfig.light"
      :empty-text="tableConfig.emptyText ? tableConfig.emptyText : '数据为空!'"
      @sort-change="handleSort"
      @selection-change="handleSelectionChange"
    >
      <template v-for="(item, index) in cols">
        <!-- 自定义列 -->
        <el-table-column
          v-if="item.slot"
          :key="index"
          :prop="item.prop"
          :sortable="item.sortable"
          :label="item.label"
          :min-width="item.minWidth"
          :align="item.align ? item.align : 'center'"
          :width="item.width ? item.width : ''"
          :show-overflow-tooltip="item.ellipsis ? item.ellipsis : true"
        >
          <template slot-scope="{ row }">
            <slot :name="item.prop" :row="row" />
          </template>
          <template slot="header">
            <el-tooltip class="item" effect="dark" :content="item.label" placement="top">
              <span>{{ item.label }}</span>
            </el-tooltip>
          </template>
        </el-table-column>
        <!-- 操作列 -->
        <el-table-column
          v-else-if="item.prop === 'operation'"
          :key="index"
          class="operation"
          :fixed="item.fixed"
          :label="item.label"
          :min-width="item.minWidth"
          :align="item.align ? item.align : 'center'"
          :width="item.width ? item.width : ''"
          :show-overflow-tooltip="item.ellipsis ? item.ellipsis : true"
        >
          <template slot-scope="scope">
            <el-button
              v-for="(btn, i) in item.btnBox"
              :key="i"
              sortable="custom"
              :plain="btn.plain"
              :size="btn.size ? btn.size : 'medium'"
              :type="btn.type"
              @click="btn.callback(scope.$index, scope.row)"
            >{{ btn.name }}</el-button>
          </template>
        </el-table-column>
        <!-- 普通列 -->
        <el-table-column
          v-else
          :key="index"
          :type="item.prop"
          :min-width="item.minWidth"
          :sortable="item.sortable"
          :fixed="item.fixed"
          :prop="item.prop"
          :label="item.label"
          :align="item.align ? item.align : 'center'"
          :width="item.width ? item.width : ''"
          :show-overflow-tooltip="item.ellipsis ? item.ellipsis : true"
        >
          <template slot="header">
            <el-tooltip class="item" effect="dark" :content="item.label" placement="top">
              <span>{{ item.label }}</span>
            </el-tooltip>
          </template>
        </el-table-column>
      </template>
      <slot name="append" />
    </el-table>

    <div v-if="isPagination" class="pagination" :style="{ justifyContent: pageConfig.flex }">
      <el-pagination
        style="overflow-x: auto"
        :background="pageConfig.background"
        :small="pageConfig.small"
        class="pagin"
        :current-page="pageConfig.currentPage"
        :page-sizes="pageConfig.pageSizes"
        :page-size="pageConfig.pageSize"
        :layout="pageConfig.layout"
        :total="dataFlag ? pageConfig.total : total"
        :pager-count="pageConfig.pagerCount"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>
<script>
import EleComponents from '@/components/EleComponents'

export default {
  components: {
    EleComponents
  },
  props: {
    // 批量操做
    // 是否显示分页
    isPagination: {
      type: Boolean,
      default: true
    },
    // 操作列
    operationCols: {
      type: Array,
      default: () => {
        return []
      }
    },
    // 选中计数提示框标志
    alterFlag: {
      type: Boolean,
      default: false
    },
    // 展示列映射项
    tableColumnMatch: {
      type: Object,
      default: () => {
        return {}
      }
    },
    // table自动获取组件标志 true为父组件调用接口获取数据
    dataFlag: {
      type: Boolean,
      default: false
    },
    // 获取表格数据函数
    getTableData: {
      type: Function,
      default: () => {
        return new Promise(function(resolve, reject) {
          resolve()
        })
      }
    },
    // 批量删除表格数据函数
    deleteActionsInData: {
      type: Function,
      default: () => {
        return new Promise(function(resolve, reject) {
          resolve()
        })
      }
    },
    // 获取数据的url  后端数据格式见下方获取函数
    url: {
      type: String,
      default: ''
    },
    // 删除数据url
    delUrl: {
      type: String,
      default: ''
    },
    // 接口查询参数
    params: {
      type: Object,
      default: () => {
        return {
          relation: 'and',
          rules: []
        }
      }
    },
    // 分页配置项:
    pageConfig: {
      type: Object,
      default: () => {
        return {
          background: true,
          // 每页显示条目个数
          pageSize: 10,
          // 小型分页样式
          small: false,
          // width: "100%",
          // 分页按钮的对齐方式  flex-start  flex-end  center
          flex: 'flex-end',
          total: 0,
          // 页码按钮的数量大于等于5的基数
          pagerCount: 5,
          // 当前页码
          currentPage: 1,
          layout: 'prev, pager, next, jumper,sizes,total',
          pageSizes: [10, 20, 30, 40]
        }
      }
    },
    // 表格数据
    tableData: {
      type: Array,
      default: () => []
    },
    // 显示的表格列
    tableColumn: {
      type: Array,
      default: () => []
    },
    // 表格配置项
    tableConfig: {
      type: Object,
      default: () => {
        return {
          // 固定表头
          height: undefined,
          // 表格最大高度
          maxHeight: undefined,

          width: '',
          // 表格斑马线
          stripe: false,
          // 纵向边框
          border: false,
          size: 'medium',
          // 列宽度是否自动撑开
          fit: true,
          // 是否显示头部
          showHeader: true,
          // 高亮行
          highlightRow: false,
          // 没数据时显示内容
          emptyText: '当前数据为空'
        }
      }
    },
    // 顶部搜索配置项
    topSearchConfig: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data() {
    return {
      collepsis: false,
      // 表格加载
      loading: true,
      // 数据总数
      total: 0,
      // table最大高度
      maxHeight: undefined,
      selectArr: [],
      // // 批量操作按钮显示flag
      // batchFlag: false,
      // 当前页
      currentPage: 1,
      // 过滤参数
      filterParams: {},
      // 子组件通过url获取的table数据
      urlTableData: [],
      // 一页最多显示多少数据
      pageSize: 10,
      // 当前页
      pageNum: 1,
      // 子组件会监听此值是否变化，变化的话则会清空子组件中的值
      clearFlag: false,
      // 表格展示的对应列
      cols: [],
      // 顶部搜索配置copy 方便在组件中对它进行操作
      copyTopSearchConfig: [],
      // 选中的数据具体所有信息
      selectInfo: [],
      // 批量操作选中的数据
      length: 0
    }
  },
  computed: {
    collepsisFlag() {
      return (this.copyTopSearchConfig.eleComponents.length - 1) / this.copyTopSearchConfig.rowCount > 2
    }
  },
  watch: {
    // 获取数据取消加载
    tableData() {
      this.loading = false
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.copyTopSearchConfig = this.topSearchConfig
      this.maxHeight = this.tableConfig.maxHeight
      // 获取屏幕高度
      this.getBodyHeight()
      if (!this.dataFlag) {
        this.getData(this.params)
      }
    })
    window.addEventListener('resize', () => {
      this.getBodyHeight()
    })
  },
  methods: {
    getShowCols(data, fieldInfo) {
      this.cols = []
      // 通过字段配置循环获取对应的信息
      // 添加特殊列 像序号、多选框
      if (fieldInfo && fieldInfo.specialCols) {
        this.cols.push(...fieldInfo.specialCols)
      }
      // 循环获取映射列
      for (const key in fieldInfo) {
        if (key !== 'specialCols') {
          this.cols.push({
            prop: key,
            label: fieldInfo[key].label,
            width: fieldInfo[key].width ? fieldInfo[key].width : '',
            minWidth: fieldInfo[key].minWidth,
            align: fieldInfo[key].align ? fieldInfo[key].align : 'center',
            slot: fieldInfo[key].slot ? fieldInfo[key].slot : false,
            sortable: fieldInfo[key].sortable ? fieldInfo[key].sortable : false
          })
        }
      }
      // 添加操作列
      this.cols.push(...this.operationCols)
    },
    // 通过映射关系获取展示列
    // getShowCols(data, fieldInfo) {
    //   this.cols = []
    //   // 通过字段配置循环获取对应的信息
    //   if (data && data.length > 0) {
    //     // 添加特殊列 像序号、多选框
    //     this.cols.push(...fieldInfo.specialCols)
    //     // 循环获取映射列
    //     for (const key in fieldInfo) {
    //       if (key !== 'specialCols') {
    //         this.cols.push({
    //           prop: key,
    //           label: fieldInfo[key].label,
    //           width: fieldInfo[key].width ? fieldInfo[key].width : '',
    //           minWidth: fieldInfo[key].minWidth,
    //           align: fieldInfo[key].align ? fieldInfo[key].align : 'center',
    //           slot: fieldInfo[key].slot ? fieldInfo[key].slot : false,
    //           sortable: fieldInfo[key].sortable ? fieldInfo[key].sortable : false
    //         })
    //       }
    //     }
    //     // 添加操作列
    //     this.cols.push(...this.operationCols)
    //   }
    // },
    // 获取表格最大高度
    getBodyHeight() {
      if (this.$refs.forml) {
        // 获取屏幕高度
        const screenHeight =
          document.documentElement.clientHeight || document.body.clientHeight
        // 获取table顶部搜索框高度
        const formHeight = this.$refs.form.$el.offsetHeight
        // 底部距离高度
        const bottomHeight = 0.05 * screenHeight
        // 最终高度
        const resultHeight = screenHeight - formHeight - bottomHeight
        this.maxHeight = resultHeight
        // this.$forceUpdate()
      }
    },
    // 排序从后端获取数据
    handleSort({ column, prop, order }) {
      this.loading = true
      console.log(order, prop)
      // params中字段自行修改
      const params = {
        rules: [],
        // 排序字段
        isDesc: order,
        // 升序、降序
        orderBy: prop,
        pageSize: this.pageSize,
        pageNum: 1
      }
      if (!this.dataFlag) {
        this.getData(params)
      } else {
        // 启用父组件接口
        this.$emit('get-table-data', params)
      }
    },
    // 获取勾选数据
    handleSelectionChange(val) {
      this.length = val.length
      this.selectArr = []
      this.selectInfo = []
      // 向父组件传递选中的值
      this.selectInfo.push(val)
      this.$emit('delete', val)
      this.$emit('relate-worker', val)
      for (const item of val) {
        this.selectArr.push(item.id)
      }
    },
    // 批量删除功能
    handleBatch(command) {
      if (command === 'del') {
        if (!this.dataFlag) {
          this.deleteActionsInData(this.delUrl, this.selectArr)
            .then((res) => {
              this.$message.success(`已成功删除${res.result.length}条数据`)
              this.getData({})
            })
        } else {
          this.$emit('del-data', this.selectArr)
        }
      }
    },
    // 获取表格数据
    getData(params) {
      this.getTableData(this.url, params)
        .then((res) => {
          this.loading = false
          this.urlTableData = res.result.records
          this.total = res.result.total
          this.getShowCols(this.urlTableData, this.tableColumnMatch)
          this.$emit('get-cols', this.urlTableData)
        })
        .catch(() => {
          // console.log(e)
        })
    },
    // 使父组件获取搜索数据
    submitFormInfo() {
      this.loading = true
      const rules = []
      for (const key in this.filterParams) {
        rules.push({
          key,
          relation: 'like',
          value: this.filterParams[key]
        })
      }
      const params = {
        rules
      }
      if (this.dataFlag) {
        this.filterParams.pageNum = 1
        this.filterParams.pageSize = this.pageConfig.pageSize
        this.$emit('search-info', this.filterParams)
      } else {
        this.getData(params)
      }
    },
    // 获取表格中的数据
    getFilterParams(val) {
      // console.log(val)
      // 当有一个字段属性为空值时去除该查询字段
      if (val.value === null || val.value.length < 1) {
        const filterParams = {}
        for (const key in this.filterParams) {
          if (key !== val.key) {
            filterParams[key] = this.filterParams[key]
          }
        }
        this.filterParams = filterParams
      } else { this.filterParams[val.key] = val.value }
    },
    //
    // 置空搜索栏
    resetForm() {
      this.$emit('reset')
      this.filterParams = {}
      this.clearFlag = !this.clearFlag
      this.loading = true
      this.pageConfig.pageSize = 10
      this.pageConfig.currentPage = 1
      const params = {
        pageSize: this.pageConfig.pageSize,
        pageNum: this.pageConfig.currentPage
      }
      if (this.dataFlag) {
        this.$emit('get-table-data', params)
      } else {
        this.getData(params)
      }
    },
    // 改变显示个数时获取数据
    handleSizeChange(val) {
      this.loading = true
      this.pageConfig.pageSize = val
      // 当前为传入url自动获取
      if (!this.dataFlag) {
        const params = {
          pageSize: this.pageConfig.pageSize,
          pageNum: this.pageConfig.currentPage,
          rules: []
        }
        this.getData(params)
      } else {
        // 对params查询条件进行赋值
        // const params = {
        //   pageNum: this.pageNum,
        //   pageSize: this.pageSize,
        //   rules: []
        // }
        // 分页查询参数
        this.filterParams.pageNum = this.pageConfig.currentPage
        this.filterParams.pageSize = this.pageConfig.pageSize
        this.$emit('get-table-data', this.filterParams)
      }
    },
    // 改变当前页时获取数据
    handleCurrentChange(val) {
      this.loading = true
      this.pageConfig.currentPage = val
      if (!this.dataFlag) {
        // 对查询条件进行赋值
        const params = {
          pageNum: this.pageConfig.currentPage,
          pageSize: this.pageConfig.pageSize,
          rules: []
        }
        this.getData(params)
      } else {
        // 对params查询条件进行赋值
        // const params = {
        //   pageNum: this.pageNum,
        //   pageSize: this.pageSize,
        //   rules: []
        // }
        this.filterParams.pageNum = this.pageConfig.currentPage
        this.filterParams.pageSize = this.pageConfig.pageSize
        this.$emit('get-table-data', this.filterParams)
      }
    }
  }
}
</script>
<style lang="scss" scoped>
@import "~@/styles/table.scss";
</style>
