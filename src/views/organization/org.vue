<template>
  <div class="org_container">
    <div class="search">
      <!-- <el-input
        v-model="value"
        size="mini"
        placeholder="请输入内容"
      >
        <i slot="suffix" class="el-input__icon el-icon-search" />
      </el-input> -->
      <el-input
        v-model="value"
        size="mini"
        placeholder="请输入内容"
        @keyup.enter.native="search"
      >
        <i slot="suffix" class="el-input__icon el-icon-search" @click="search" />
      </el-input>
    </div>
    <div class="custom-tree-container">
      <div class="block">
        <el-tree
          ref="tree"
          v-loading="loading"
          :data="data"
          class="tree-line filter-tree"
          node-key="id"
          :filter-node-method="filterNode"
          :props="defaultProps"
          default-expand-all
          :expand-on-click-node="false"
          @node-click="deptNodeClick"
        >
          <div slot-scope="{ node, data }" class="custom-tree-node tree">
            <div v-if="node.level===1" style="color:#0A1933;font-weight:550">{{ node.label }}</div>
            <div v-else-if="node.level===2" style="color:black">{{ node.label }}</div>
            <div v-else style="color:#9FA6B0">{{ node.label }}</div>
            <div>
              <el-button
                type="text"
                size="mini"
              >
                <el-dropdown class="drop_down">
                  <span class="point el-dropdown-link">
                    <i class="el-icon-more el-icon--right" />
                  </span>
                  <el-dropdown-menu slot="dropdown" class="newDrop">
                    <el-dropdown-item v-if="node.level!==1" class="new-item" @click.native="() => levelAppend(node, data)"><span>+新增同级</span></el-dropdown-item>
                    <el-dropdown-item class="new-item" @click.native="() => append(node,data)"><span>+新增下一级</span></el-dropdown-item>
                    <el-dropdown-item v-if="node.level!==1" class="new-item" @click.native="editOrg(node,data)"><span>编辑</span></el-dropdown-item>
                    <el-dropdown-item v-if="node.level!==1" :disabled="!node.isLeaf" class="new-item" @click.native="() => deleteOrg(data)"><span>删除</span></el-dropdown-item>
                  </el-dropdown-menu>
                </el-dropdown>
              </el-button>
            </div>
          </div>
        </el-tree>
      </div>
    </div>
    <!-- 编辑和添加-->
    <div>
      <el-dialog
        :title="title"
        :visible.sync="visible"
        width="30%"
        :before-close="handleClose"
      >
        <div class="add_form">
          <div class="inner_form">
            <el-form ref="form" :model="form" label-width="40px" size="mini">
              <el-form-item v-if="edit" label="编码">
                <el-input v-model="id" disabled />
              </el-form-item>
              <el-form-item label="名称">
                <el-input v-model="orgName" />
              </el-form-item>
              <el-form-item label="状态">
                <el-switch
                  v-model="status"
                  active-color="#cccccc"
                  inactive-color="#347FFF"
                  :active-value="1"
                  :inactive-value="0"
                  @change="switchChange"
                />
              </el-form-item>
            </el-form>
          </div>
        </div>
        <span slot="footer" class="dialog-footer">
          <el-button size="mini" @click="handleClose">取消</el-button>
          <el-button size="mini" type="primary" @click="add">确定</el-button>
        </span>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import * as api from '@/api/org'
export default {
  name: 'Org',
  components: {

  },
  data() {
    return {
      nodeId: '',
      isLevel: false,
      company: '',
      parentId: '',
      status: '1',
      organizationId: '',
      orgName: '',
      id: '',
      edit: false,
      loading: true,
      form: {},
      title: '',
      visible: false,
      defaultProps: {
        children: 'children',
        label: 'name'
      },
      value: '',
      flag: false,
      data: []
    //   data: JSON.parse(JSON.stringify(data))
    }
  },
  // watch: {
  //   value(val) {
  //     this.$refs.tree.filter(val)
  //   }
  // },
  created() {
    this.getOrangize()
  },
  methods: {
    // 修改状态
    switchChange(data) {
      this.status = data
    },
    // 添加
    add() {
      if (!this.orgName) {
        this.$message.warning('部门名称不能为空')
      } else {
        if (!this.edit) {
        // 添加同一级传自身id
          if (this.isLevel) {
            if (this.level === 2) {
              const params = {
                orgName: this.orgName,
                parentId: this.parentId,
                orgTag: 0,
                orgType: 0,
                status: this.status
              }
              api.addOrganization(params).then(res => {
                this.getOrangize()
                this.$message({
                  type: 'success',
                  message: '添加成功'
                })
              }).catch()
            } else {
              const params = {
                orgName: this.orgName,
                parentId: this.parentId,
                orgTag: 0,
                orgType: 1,
                status: this.status
              }
              api.addOrganization(params).then(res => {
                this.$message({
                  type: 'success',
                  message: '添加成功'
                })
                this.getOrangize()
              }).catch()
              this.handleClose()
            }
          } else {
            if (this.level === 1) {
              const params = {
                orgName: this.orgName,
                parentId: this.id,
                orgTag: 0,
                orgType: 0,
                status: this.status
              }
              api.addOrganization(params).then(res => {
                this.$message({
                  type: 'success',
                  message: '添加成功'
                })
                this.getOrangize()
              }).catch()
            } else {
              const params = {
                orgName: this.orgName,
                parentId: this.id,
                orgTag: 0,
                orgType: 1,
                status: this.status
              }
              api.addOrganization(params).then(res => {
                this.$message({
                  type: 'success',
                  message: '添加成功'
                })
                this.getOrangize()
              }).catch()
            }
            // 添加下一级节点的传父子点的id
          }
        } else {
          const params = {
            orgName: this.orgName,
            id: this.id,
            status: this.status
          }
          api.updateOrganization(params).then(() => {
            this.$message({
              type: 'success',
              message: '编辑成功'
            })
            this.getOrangize()
          }).catch()
        }
        this.handleClose()
      }
      // 添加和编辑的判断
    },
    // 添加
    // add() {
    //   if (!this.edit) {
    //     if (this.level === 1) {
    //       const params = {
    //         orgName: this.orgName,
    //         parentId: this.parentId,
    //         orgTag: 0,
    //         orgType: 0
    //       }
    //       api.addOrganization(params).then(res => {
    //         console.log('res', res)
    //         this.getOrangize()
    //       }).catch()
    //       this.handleClose()
    //     } else {
    //       const params = {
    //         orgName: this.orgName,
    //         parentId: this.parentId,
    //         orgTag: 0,
    //         orgType: 1
    //       }
    //       api.addOrganization(params).then(res => {
    //         console.log('res', res)
    //         this.getOrangize()
    //       }).catch()
    //       this.handleClose()
    //     }
    //   } else {
    //     console.log('编辑')
    //     const params = {
    //       orgName: this.orgName,
    //       parentId: this.parentId,
    //       orgTag: 0,
    //       orgType: 1
    //     }
    //     api.updateOrganization(params).then(() => {
    //       this.getOrangize()
    //     }).catch()
    //   }
    // },
    // 删除
    deleteOrg(data) {
      const params = { id: data.id }
      this.$confirm('此操作将永久删除该节点，是否继续', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        api.deleteOrgById(params).then(() => {
          this.getOrangize()
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
    handleClose() {
      this.visible = false
      this.orgName = ''
      this.status = '1'
    },
    // 将id传给父组件
    sendMessage() {
      this.$emit('fetch', this.organizationId, this.company)
    },
    // 搜索
    search() {
      this.$refs.tree.filter(this.value)
    },
    filterNode(value, data) {
      if (!value) return true
      return data.name.indexOf(value) !== -1
    },
    // 搜索时将节点进行收缩方法
    // getShrink() {
    //   console.log('获取的node', this.nodeId)
    //   if (this.nodeId) {
    //     this.$refs.tree.store.nodesMap[this.nodeId].expanded = false
    //   }
    // },
    // 查找节点ff
    // filterNode(value, data, node) {
    //   if (!value) return true
    //   if (node.label.indexOf(this.value) !== -1) {
    //     this.nodeId = data.id
    //     console.log('node')
    //   }
    //   const _array = [] // 这里使用数组存储 只是为了存储值。
    //   if (node.level !== 1) {
    //     this.getReturnNode(node, _array, value)
    //   }
    //   let result = false
    //   _array.forEach(item => {
    //     result = result || item
    //   })
    //   return result
    // },
    // getReturnNode(node, _array, value) {
    //   const isPass =
    //     node.data &&
    //     node.data.name &&
    //     node.data.name.indexOf(value) !== -1
    //   isPass ? _array.push(isPass) : ''
    //   if (!isPass && node.level !== 1 && node.parent) {
    //     this.getReturnNode(node.parent, _array, value)
    //   }
    //   this.getShrink()
    // },
    // 点击当前节点获取id
    deptNodeClick(item, e) {
      this.organizationId = e.key
      this.company = e.label
      this.sendMessage()
    },
    // 新增下一级
    append(node, data) {
      if (node.level === 21) {
        this.$message({
          message: '不支持新增20层以上节点',
          type: 'warning'
        })
      } else {
        this.isLevel = false
        this.level = node.level
        this.id = data.id
        this.parentId = node.parent.key
        this.edit = false
        this.title = '添加部门'
        this.visible = true
      }
    },
    // 编辑1
    editOrg(node, data) {
      this.title = '编辑部门'
      this.edit = true
      this.level = node.level
      this.id = data.id
      this.orgName = data.name
      this.visible = true
      const params = {
        id: this.id
      }
      api.queryOrgById(params).then(res => {
        const { result } = res
        this.status = result.status
      }).catch()
    },
    // append(data) {
    //   console.log('添加节点data', data)
    //   const newChild = { id: id++, label: 'testtest', children: [] }
    //   if (!data.children) {
    //     this.$set(data, 'children', [])
    //   }
    //   data.children.push(newChild)
    // },
    // 获取组织树1
    getOrangize() {
      this.loading = true
      api.getOrganization().then(res => {
        const data = []
        const { result } = res
        data.push(result)
        this.organizationId = result.id
        this.company = result.name
        this.sendMessage()
        this.data = data
        this.loading = false
      }).catch
    },
    // 没有赋值1
    getOrangized() {
      this.loading = true
      api.getOrganization().then(res => {
        const data = []
        const { result } = res
        data.push(result)
        this.data = data
        this.loading = false
      }).catch
    },
    // 添加同一级
    levelAppend(node, data) {
      this.isLevel = true
      this.level = node.level
      this.id = data.id
      this.parentId = node.parent.key
      this.edit = false
      this.title = '添加部门'
      this.visible = true
    },
    // levelAppend(node, data) {
    //   console.log('nodeXXX', node)
    //   console.log('dataXXX', data)
    //   console.log('node父节点', node.parent)
    //   const Data = node.parent.data
    //   const childNodes = node.parent.data.children
    //   const newNode = { id: id++, label: '新添加节点', children: [] }
    //   if (Array.isArray(Data)) {
    //     Data.push(newNode)
    //   } else {
    //     childNodes.push(newNode)
    //   }
    // },
    remove(node, data) {
      const parent = node.parent
      const children = parent.data.children || parent.data
      const index = children.findIndex(d => d.id === data.id)
      children.splice(index, 1)
    }
  }

}
</script>
<style lang="scss" scoped>
.org_container{
  margin-right:20px;
  // background-color: burlywood;
  .custom-tree-container{
    margin-top: 10px;
  }
  .block{
    width: 100%;
    height: 100%;
  }
  .search{
    margin-left: 16px;
  }
  .add_form{
    width: 99%;
    margin-top: -27px;
    border-top: 1px solid  #f3f3f5;
  }
  .inner_form{
     width: 80%;
     margin: 20px auto;
  }
.tree{
  height: 35px;
  width:100%;
  display:flex;
  line-height: 35px;
  justify-content: space-between;
}
.el-icon-more{
  color:lightgrey;
}
.point {
  height: 100%;
  line-height: 100%;
}
::v-deep .el-dropdown-menu__item--divided:before {
    content: '';
    height: 0px;
    display: block;
    border-bottom: 1px dotted;
    margin: 0 -20px;
    background-color: #FFF;
}
}
</style>
<style lang="scss">
// .drop_down{
//    ::v-deep .el-popper .popper__arrow {
//     display: none !important;
// }
// }
.el-popper .popper__arrow {
    display: none !important;
}
.newDrop{
    padding: 0px;
  }
  .new-item{
   color: darkgray;
  }
  .new-item:hover{
    color: #fff !important;
      background-color: #347FFF !important;
  }
.tree-line{
     max-height: 2000px;
     overflow-y:hidden;
     overflow-x:auto;
 .el-tree-node {
      position: relative;
      padding-left: 10px;
    }
    .vue-treeselect__menu{
      display: block;
    }
    // 子集像右偏移 给数线留出距离
    .el-tree-node__children {
      overflow: visible !important;
      padding-left: 10px;
    }
 .el-tree-node__content {
    line-height: 30px;
    height: 30px;
    padding-left: 0px !important;
}
    //这是竖线
    .el-tree-node :last-child:before {
      height: 25px;
    }
    .el-tree > .el-tree-node:before {
      border-left: none;
    }
    .el-tree > .el-tree-node:after {
      border-top: none;
    }
    //这自定义的线 的公共部分
    .el-tree-node:before,
    .el-tree-node:after {
      content: "";
      left: -4px;
      position: absolute;
      right: auto;
      border-width: 1px;
    }
    .tree :first-child .el-tree-node:before {
      border-left: none;
    }
    // 竖线
    .el-tree-node:before {
      border-left: 1px solid #e3e3e3;
      bottom: 0px;
      height: 100%;
      top: -8px;
      width: 1px;
      left: 2px;
    }
    //横线
    .el-tree-node:after {
      border-top: 1px solid #e3e3e3;
      height: 20px;
      top: 17px;
      width: 12px;
      left: 2px;
    }
    .el-tree-node__expand-icon.is-leaf {
      width: 8px;
    }
    //去掉elementui自带的展开按钮  一个向下的按钮,打开时向右
    // .el-tree-node__content > .el-tree-node__expand-icon {
    //   display: none;
    // }
    //每一行的高度
    .el-tree-node__content {
      line-height: 30px;
      height: 30px;
    }
  }
  //去掉最上级的before  after 即是去电最上层的连接线
   .el-tree > div {
    &::before {
      display: none;
    }
    &::after {
      display: none;
    }
}
</style>
