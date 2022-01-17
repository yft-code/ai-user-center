<template>
  <div class="wrapper">

    <div class="left">
      <search-tree-transfer
        :left-data="leftData"
        :right-data="rightData"
        :title="title"
        height="540px"
        @selectId-change="handleSelectedIdChange"
      ></search-tree-transfer>
    </div>

    <div class="right">

      <div class="title">页面/菜单预览</div>

      <div class="right-content">

        <el-input
          size="small"
          placeholder="请输入"
          v-model="filterText">
          <i slot="suffix" class="el-input__icon el-icon-search"></i>
        </el-input>

        <div style="overflow: scroll; height: 450px">
          <el-tree
            class="filter-tree"
            :data="treeData"
            default-expand-all
            :filter-node-method="filterNode"
            ref="tree">
          </el-tree>
        </div>

      </div>

    </div>

  </div>
</template>

<script>
import SearchTreeTransfer from '@/components/TreeTransfer'
import { queryUserRole, queryUserRoleWithout } from '../../api/role'
import { getMenuWithButton } from '../../api/menu'

export default {
  name: 'RoleConfigure',
  components: {
    SearchTreeTransfer
  },
  props: {
    // 用户ID
    userId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      // 页面菜单预览筛选文字
      filterText: '',
      // 左侧数据
      leftData: [],
      // 右侧数据
      rightData: [],
      // 标题
      title: [],
      // 预览树
      treeData: [],
      // 已选角色id集合
      selectedIds: []
    }
  },
  async created() {
    // 获取用户已选角色
    const { result } = await queryUserRole({ userId: this.userId })
    if (result) {
      for (const item of result) {
        if (item.roleSelectVo.length === 0) continue
        const temp = {}
        temp.pid = 0
        temp.id = item.platId
        temp.label = item.platName
        temp.children = []
        for (const obj of item.roleSelectVo) {
          this.selectedIds.push({
            id: obj.id
          })
          temp.children.push({
            id: obj.id,
            pid: temp.id,
            label: obj.roleName
          })
        }
        this.rightData.push(temp)
      }
    }
    // 获取最右侧菜单/按钮
    if (this.selectedIds.length > 0) {
      getMenuWithButton(this.selectedIds).then(res => {
        if (res.code === 0) {
          for (const item of res.result) {
            const result = this.getMenuwithButton(item)
            if (JSON.stringify(result) !== '{}') {
              this.treeData.push(result)
            }
          }
        }
      }).catch(e => {
        this.$message.error('获取')
      })
    }
    // 获取用户未选角色
    queryUserRoleWithout({
      userId: this.userId
    }).then(res => {
      if (res.code === 0) {
        if (res.result) {
          for (const item of res.result) {
            if (item.roleSelectVo.length === 0) continue
            const temp = {}
            temp.pid = 0
            temp.id = item.platId
            temp.label = item.platName
            temp.children = []
            for (const obj of item.roleSelectVo) {
              temp.children.push({
                id: obj.id,
                pid: temp.id,
                label: obj.roleName
              })
            }
            this.leftData.push(temp)
          }
        }
      }
    })
  },
  mounted() {
    // 修改穿梭框图标
    const right = document.querySelectorAll('.transfer-center-item i')
    for (const item of right) {
      if (item.className === 'el-icon-arrow-left') {
        item.classList.remove('el-icon-arrow-left')
        item.classList.add('el-icon-d-arrow-left')
      } else if (item.className === 'el-icon-arrow-right') {
        item.classList.remove('el-icon-arrow-right')
        item.classList.add('el-icon-d-arrow-right')
      }
    }
  },
  watch: {
    // 监听菜单/按钮权限树的过滤字段
    filterText(val) {
      this.$refs.tree.filter(val)
    }
  },
  methods: {
    // 获取菜单/按钮权限
    handleSelectedIdChange(obj) {
      this.selectedIds = obj
      if (this.selectedIds.length === 0) {
        this.treeData = []
      } else {
        getMenuWithButton(this.selectedIds).then(res => {
          if (res.code === 0) {
            this.treeData = []
            for (const item of res.result) {
              const result = this.getMenuwithButton(item)
              if (JSON.stringify(result) !== '{}') {
                this.treeData.push(result)
              }
            }
          }
        }).catch(e => {
          this.$message.error('获取')
        })
      }
    },
    // 递归获取菜单、按钮预览
    getMenuwithButton(obj) {
      if (obj.nodeId === null && obj.childNodes === null) {
        return {}
      }
      const temp = {}
      // 根节点后端返回的id是null, 遍历时自动自动生产一个随机ID
      temp.id = obj.nodeId === null ? '0000' + Math.random() * 10000 : obj.nodeId
      temp.label = obj.nodeName
      if (obj.childNodes) {
        temp.children = []
        for (const item of obj.childNodes) {
          temp.children.push(this.getMenuwithButton(item))
        }
      }
      return temp
    },
    // 过滤节点
    filterNode(value, data) {
      if (!value) return true
      return data.label.indexOf(value) !== -1
    }
  }
}
</script>

<style scoped lang="scss">
  .wrapper {
    display: flex;
    margin-top: 20px;
    .left {
      width: 62%;
      margin-right: 4%;
      margin-left: 2%;
      ::v-deep.transfer-title {
        background-color: #fff;
        margin: 0;
        span {
          font-weight: normal;
          color: rgb(63, 72, 91);
        }
      }
      ::v-deep.el-tree .el-checkbox {
        display: none;
      }
      /*::v-deep.el-tree .el-tree-node__children .el-tree-node__content {*/
      /*  padding-left: 0 !important;*/
      /*}*/
      ::v-deep.el-tree .el-tree-node__children .is-leaf + .el-checkbox {
        display: inline-block!important;
      }
      ::v-deep.transfer-center-item > button {
        width: 50px;
        height: 36px;
        border-radius: 3px;
        border: 1px solid rgb(247, 248, 249);
        color: rgb(160, 163, 175);
        background-color: rgb(247, 248, 249);
      }
    }
    .right {
      width: 26%;
      height: 540px;
      overflow: hidden;
      margin-left: 3%;
      border: 1px solid #ebeef5;
      .title {
        height: 40px;
        line-height: 40px;
        color: rgb(63, 72, 91);
        padding: 0 15px;
        border-bottom: 1px solid #ebeef5;
      }
      .right-content {
        height: 100%;
        padding: 10px 10px;
        ::v-deep.el-tree .is-leaf + .el-tree-node__label {
          color: rgb(161, 166, 175);
        }
      }
    }
  }
</style>
