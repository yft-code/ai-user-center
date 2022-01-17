<template>
  <div>
    <tree-transfer
      filter
      openAll
      :title="title"
      :mode='mode'
      height='540px'
      :from_data='leftData'
      :to_data='rightData'
      :defaultProps="{label:'label'}"
      placeholder="请输入"
      :checkOnClickNode="true"
      @left-check-change="handleLeftChecked"
      @right-check-change="handleRightChecked"
      @add-btn='add'
      @remove-btn='remove'
      >
    </tree-transfer>
  </div>
</template>

<script>
import TreeTransfer from 'el-tree-transfer'

export default {
  name: 'SearchTreeTransfer',
  components: {
    TreeTransfer
  },
  props: {
    // 左侧数据
    leftData: {
      type: Array,
      default: () => []
    },
    // 右侧数据
    rightData: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      /* eslint-disable*/
      mode: "transfer",
      // 穿梭框标题
      title: ['来源', '目标'],
      // 左侧总数
      leftTotal: 0,
      // 右侧总数
      rightTotal: 0,
      // 左侧选中数
      leftChecked: 0,
      // 右侧选中数
      rightChecked: 0,
      // 左侧父节点数组
      leftFatherNode: [],
      // 右侧父节点数组
      rightFatherNode: []
    }
  },
  created() {
    // 数据、标题初始化
    this.leftTotal = 0
    this.rightTotal = 0
    this.leftFatherNode = []
    this.rightFatherNode = []
    for (const item of this.leftData) {
      this.leftFatherNode.push(item.id)
      this.leftTotal += item.children.length
    }
    for (const item of this.rightData) {
      this.rightFatherNode.push(item.id)
      this.rightTotal += item.children.length
    }
    this.title = ['来源' + `(0/${this.leftTotal})`, '目标' + `(0/${this.rightTotal})`]
  },
  methods: {
    // 处理左侧数据勾选
    handleLeftChecked(nodeObj, treeObj) {
      this.checkOperation(nodeObj, treeObj, 0)
    },
    // 处理右侧数据勾选
    handleRightChecked(nodeObj, treeObj) {
     this.checkOperation(nodeObj, treeObj, 1)
    },
    // 数据勾选处理
    checkOperation(nodeObj, treeObj, type) {
      let count = 0
      const fatherNode = type === 0 ? this.leftFatherNode : this.rightFatherNode
      for (const item of treeObj.checkedNodes) {
        if (fatherNode.indexOf(item.id) > -1) count++
      }
      const total = type === 0 ? this.leftTotal : this.rightTotal
      const index = type === 0 ? 0 : 1
      const title = type === 0 ? '来源' : '目标'
      this.title.splice(index, 1, title + `(${treeObj.checkedNodes.length - count}/${total})`)
    },
    // 右侧添加角色
    add(fromData, toData, obj) {
      this.selectedRoleChange(fromData, toData, obj, 0)
    },
    // 右侧移除角色
    remove(fromData, toData, obj) {
      this.selectedRoleChange(fromData, toData, obj, 1)
    },
    // 右侧数据改变处理
    selectedRoleChange(fromData, toData, obj, type) {
      let count = 0
      for (const item of obj.nodes) {
        if (this.leftFatherNode.indexOf(item.id) > -1 || this.rightFatherNode.indexOf(item.id) > -1) {
          count++
        }
      }
      const calNum = obj.nodes.length - count
      this.leftTotal += type === 0 ? -calNum : calNum
      this.rightTotal += type === 0 ? calNum : -calNum
      this.title = ['来源' + `(0/${this.leftTotal})`, '目标' + `(0/${this.rightTotal})`]
      const selectIds = []
      for (const item of toData) {
        for (const obj of item.children) {
          selectIds.push({ id: obj.id })
        }
      }
      this.$emit('selectId-change', selectIds)
    }
  },
  watch: {
    // 监听左侧数据变化
    leftData(val) {
      this.leftTotal = 0
      this.leftFatherNode = []
      for (const item of val) {
        this.leftFatherNode.push(item.id)
        this.leftTotal += item.children.length
      }
      const temp = ['来源' + `(0/${this.leftTotal})`, this.title[1]]
      this.title = temp
    },
    // 监听右侧数据变化
    rightData(val) {
      this.rightTotal = 0
      this.rightFatherNode = []
      for (const item of val) {
        this.rightFatherNode.push(item.id)
        this.rightTotal += item.children.length
      }
      const temp = [this.title[0], '目标' + `(0/${this.rightTotal})`]
      this.title = temp
    }
  }
}
</script>

<style scoped>

</style>
