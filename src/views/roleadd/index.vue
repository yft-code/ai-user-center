<template>
  <el-form :model="tempForm" ref="form" label-width="100px" class="form">
    <div class="container">

      <div :class="!isOpen ? 'left-without-btn' : 'left'">

        <div class="title">角色信息</div>

        <el-form-item
          label="角色名称"
          prop="roleName"
          :rules="[
            { required: true, message: '角色名称不能为空' }
          ]"
        >
          <el-input
            placeholder="请输入角色名称"
            autocomplete="off"
            maxlength="20"
            minlength="1"
            v-model="tempForm.roleName"
          ></el-input>
        </el-form-item>

        <el-form-item
          label="所属机构"
          prop="organizationList"
          :rules="[
            { required: true, message: '所属机构不能为空'},
          ]"
        >
          <el-cascader
            v-model="tempForm.organizationList"
            :options="organizationOptions"
            placeholder="请选择所属机构"
            :disabled="!isAdd"
            :props="{
              checkStrictly: true,
              label: 'name',
              value: 'id',
              children: 'children'
            }"
            clearable
          ></el-cascader>
        </el-form-item>

        <el-form-item
          label="所属平台"
          prop="platformList"
          :rules="[
          { required: true, message: '所属平台不能为空'},
        ]"
        >
          <el-select
            v-model="tempForm.platformList"
            placeholder="请选择所属平台"
            :disabled="!isAdd"
            @change="handlePlatformChange"
            clearable
          >
            <el-option
              v-for="item in platformOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item
          label="角色描述"
          prop="roleDescription"
        >
          <el-input
            type="textarea"
            :rows="4"
            placeholder="请输入备注"
            v-model="tempForm.roleDescription"
            maxlength="100"
          >
          </el-input>
        </el-form-item>

      </div>

      <div :class="!isOpen ? 'right-without-btn' : 'right'">

        <div class="right-box">

          <div class="title" style="margin-left: 0">页面权限</div>

          <div class="page-wrapper">

            <el-form-item
              label-width="-1"
              prop="roleName"
              style="height: 100%"
            >
              <div class="right-box-content">
                <el-input
                  suffix-icon="el-icon-search"
                  placeholder="输入关键字进行过滤"
                  v-model="filterText">
                </el-input>

                <el-tree
                  ref="tree"
                  class="filter-tree"
                  show-checkbox
                  :data="menuData"
                  node-key="id"
                  :props="{
                    value: 'id',
                    label: 'name'
                  }"
                  :default-checked-keys="defaultNode"
                  :default-expanded-keys="defaultNode"
                  :expand-on-click-node="false"
                  :filter-node-method="filterNode"
                  @node-click="handleNodeClick"
                  @check="handleCheck"
                >
                </el-tree>
              </div>
            </el-form-item>

          </div>

        </div>

        <div class="right-box" v-if="isOpen">

          <div class="title" style="margin-left: 0">按钮权限</div>

          <div style="display: block; height: 100%">

            <el-form-item
              label-width="-1"
              prop="btn"
              style="height: 100%"
            >
              <div class="right-box-content">
                <el-checkbox-group v-model="currentBtn" style="display: inline-block; width: 100%">
                  <el-checkbox
                    v-for="(item, index) in originalBtn"
                    :key="index"
                    class="btn-checkbox"
                    :label="item.id"
                  >{{item.name}}</el-checkbox>
                </el-checkbox-group>
              </div>

            </el-form-item>

          </div>

        </div>

      </div>

    </div>
    <!--操作按钮-->
    <el-form-item class="operate-button">
      <div class="pos">
        <el-button size="small" @click="handleCancel">返回</el-button>
        <el-button type="primary" @click="handleSave" size="small">保存</el-button>
      </div>
    </el-form-item>
  </el-form>
</template>

<script>
import { getMenuTree, getButtonByMenuId, getPlatform, getNodeTree, getSelectMenuTree, getMenuCheckedButton } from '../../api/menu'
import { addRole, updateRole } from '../../api/role'

export default {
  name: 'RoleAdd',
  data() {
    return {
      // 暂时表单数据
      tempForm: {
        roleName: '',
        organizationList: '',
        platformList: '',
        roleDescription: ''
      },
      // 所属机构选项
      organizationOptions: [],
      // 所属平台选项
      platformOptions: [],
      // 是否打开按钮界面
      isOpen: false,
      // 搜索字段
      filterText: '',
      // 菜单树的数据
      menuData: [],
      // 角色拥有的菜单及其按钮权限
      menuObj: [],
      // 当前选择的菜单
      currentMenu: {},
      // 当前选中的按钮
      currentBtn: [],
      // 发请求拿到的按钮数据
      originalBtn: [],
      // 第一次打开
      firstOpen: true,
      // 半勾节点数组
      halfChecked: [],
      // 已请求的菜单、按钮映射关系
      menuMap: {},
      // 默认勾选节点
      defaultNode: [],
      // 是否为新增
      isAdd: false,
      // 角色ID
      roleId: ''
    }
  },
  async created() {
    this.isAdd = this.$route.params.isAdd
    if (this.isAdd) {
      this.tempForm = {
        roleName: '',
        organizationList: [],
        platformList: '',
        roleDescription: ''
      }
    } else {
      this.tempForm = this.$route.params.formData
      this.roleId = this.tempForm.roleId
      // 获取选择树
      const { result } = await getSelectMenuTree({ platId: this.tempForm.platformList, roleId: this.roleId })
      this.defaultNode = []
      this.getDefaultNode(result)
      for (const obj of this.defaultNode) {
        // 根据菜单ID获取对应的按钮权限
        getButtonByMenuId({ menuId: obj }).then(res => {
          const temp = []
          if (res.code === 0) {
            for (const item of res.result) {
              temp.push({
                id: item.id,
                name: item.menuName
              })
            }
            this.menuMap[obj] = temp
          } else {
            this.$message.error('获取该菜单按钮失败')
          }
        }).catch(e => {
          this.$message.error('获取该菜单按钮失败')
        })
        // 获取菜单对应的已勾选按钮
        getMenuCheckedButton({ menuId: obj, roleId: this.roleId }).then(res => {
          if (res.code === 0) {
            const button = []
            for (const item of res.result) {
              if (item.select === 1) {
                button.push({
                  id: item.id,
                  name: item.menuName
                })
              }
            }
            this.menuObj.push({
              id: obj,
              name: '',
              buttons: button
            })
          } else {
            this.$message.error('获取菜单数据失败')
          }
        }).catch(e => {
          this.$message.error('获取菜单数据失败')
        })
      }
      // 请求菜单树数据
      getMenuTree({ platId: this.tempForm.platformList }).then(res => {
        if (res.code === 0) {
          this.menuData = [this.getMenu(res.result)]
        } else {
          this.$message.error('获取菜单数据失败')
        }
      }).catch(e => {
        this.$message.error('获取菜单数据失败')
      })
    }

    // 获取平台数据
    getPlatform().then(res => {
      if (res.code === 0) {
        for (const item of res.result) {
          this.platformOptions.push({
            id: item.id,
            name: item.platName
          })
        }
      } else {
        this.$message.error('获取平台数据失败')
      }
    }).catch(e => {
      this.$message.error('获取平台数据失败')
    })

    // 获取机构信息
    getNodeTree().then(res => {
      if (res.code === 0) {
        const tempNode = this.getNewOrganization(res.result, {})
        this.organizationOptions = [tempNode]
      } else {
        this.$message.error('获取机构信息')
      }
    }).catch(e => {
      this.$message.error('获取机构信息')
    })
  },
  methods: {
    // 当选择平台时
    handlePlatformChange(val) {
      // 请求菜单树数据
      getMenuTree({ platId: val }).then(res => {
        if (res.code === 0) {
          this.menuData = [this.getMenu(res.result)]
          this.originalBtn = []
          this.currentBtn = []
          this.currentMenu = {}
          this.menuObj = []
          this.menuMap = {}
        } else {
          this.$message.error('获取菜单数据失败')
        }
      }).catch(e => {
        this.$message.error('获取菜单数据失败')
      })
    },
    // 遍历获取新的机构信息
    getNewOrganization(node, res) {
      res.name = node.name
      res.id = node.id
      if (node.children && node.children.length > 0) {
        res.children = []
        for (const item of node.children) {
          const newNode = this.getNewOrganization(item, {})
          res.children.push(newNode)
        }
      }
      return res
    },

    // 处理默认勾选节点
    getDefaultNode(node) {
      if ((!node.childNodes || node.childNodes.length === 0) && node.attribute) {
        if (node.attribute.select === 1) {
          this.defaultNode.push(node.nodeId)
        }
      }
      if (node.childNodes && node.childNodes.length > 0) {
        for (const obj of node.childNodes) {
          this.getDefaultNode(obj)
        }
      }
    },

    // 处理拿到的菜单树数据
    getMenu(node) {
      const temp = {
        id: node.nodeId,
        name: node.nodeName
      }
      if (node.childNodes && node.childNodes.length > 0) {
        temp.children = []
        for (const obj of node.childNodes) {
          temp.children.push(this.getMenu(obj))
        }
      }
      return temp
    },

    // 过滤节点
    filterNode(value, data) {
      if (!value) return true
      return data.name.indexOf(value) !== -1
    },

    // 存储菜单及其按钮节点
    saveMenu() {
      const index = this.menuObj.findIndex((item) => { return item.id === this.currentMenu.id })
      if (index > -1) {
        const res = []
        const mapArray = this.menuMap[this.currentMenu.id].slice()
        for (const item of this.currentBtn) {
          for (const obj of mapArray) {
            if (obj.id === item) {
              res.push(obj)
              break
            }
          }
        }
        this.menuObj[index].buttons = res
      }
    },

    // 树节点点击事件
    handleNodeClick(node, nodeInfo) {
      const index = this.halfChecked.findIndex(item => item.id === node.id)
      if (!nodeInfo.checked && index === -1) {
        this.$message.warning('请先勾选该页面权限')
        return
      }
      // 是否为第一次打开
      if (this.firstOpen && (!node.children || node.children.length === 0)) {
        // 开启按钮权限界面
        this.isOpen = true
        this.firstOpen = false
      } else {
        // 如果为相同节点，则无需请求
        if (node.id === this.currentMenu.id) return
        // 做按钮的更新
        this.saveMenu()
      }

      if (!node.children || node.children.length === 0) {
        this.currentMenu = node
        const objIndex = this.menuObj.findIndex(item => item.id === node.id)
        this.currentBtn = []
        for (const item of this.menuObj[objIndex].buttons) {
          this.currentBtn.push(item.id)
        }
        this.originalBtn = this.menuMap[node.id]
      }
    },

    // 递归将勾选节点存入MenuObj
    saveNode(node) {
      const index = this.menuObj.findIndex((item) => item.id === node.id)
      if (index > -1 && (!node.children || node.children.length === 0)) return
      if (index === -1 && (!node.children || node.children.length === 0)) {
        const temp = []
        getButtonByMenuId({ menuId: node.id }).then(res => {
          if (res.code === 0) {
            for (const item of res.result) {
              temp.push({
                id: item.id,
                name: item.menuName
              })
            }
            this.menuObj.push({
              id: node.id,
              name: node.label,
              buttons: temp
            })
            this.menuMap[node.id] = temp
            if (node.children && node.children.length > 0) {
              for (const item of node.children) {
                this.saveNode(item)
              }
            }
          } else {
            this.$message.error('获取该菜单按钮失败')
          }
        }).catch(e => {
          this.$message.error('获取该菜单按钮失败')
        })
      } else {
        if (node.children && node.children.length > 0) {
          for (const item of node.children) {
            this.saveNode(item)
          }
        }
      }
    },

    // 递归将勾选节点从menuObj删除
    deleteNode(node) {
      const index = this.menuObj.findIndex((item) => item.id === node.id)
      if (index > -1) {
        this.menuObj.splice(index, 1)
        if (node.id === this.currentMenu.id) {
          // 如果去掉勾选的节点，刚好是展示的节点，则右侧清空
          this.currentBtn = []
          this.currentMenu = {}
          this.originalBtn = []
        }
      } else {
        if (node.children && node.children.length > 0) {
          for (const item of node.children) {
            this.deleteNode(item)
          }
        }
      }
    },

    // 处理节点被选中
    handleCheck(node, info) {
      const index = info.checkedNodes.findIndex(item => item.id === node.id)
      this.halfChecked = info.halfCheckedNodes
      if (index > -1) {
        this.saveNode(node)
      } else {
        this.deleteNode(node)
      }
    },

    // 获取组织名字
    getOrganizationName(node, key, res) {
      if (node.id === key) {
        res.organizationList = {
          id: node.id,
          name: node.name
        }
        return
      }
      if (node.children && node.children.length > 0) {
        for (const item of node.children) {
          this.getOrganizationName(item, key, res)
        }
      }
    },

    // 保存
    handleSave() {
      // 需要将当前节点存入 之后再进行保存
      this.saveMenu()
      const checkedNodes = this.$refs.tree.getCheckedNodes()
      const halfCheckedNodes = this.$refs.tree.getHalfCheckedNodes()
      const catelogue = []
      for (const item of checkedNodes) {
        if (item.children && item.id) {
          catelogue.push(item.id)
        }
      }
      for (const item of halfCheckedNodes) {
        if (item.id) {
          catelogue.push(item.id)
        }
      }
      this.$refs.form.validate((valid) => {
        if (valid) {
          // 操作数据，然后调用接口保存，并进行路由跳转
          const res = {}
          res.contentIds = catelogue
          for (const key in this.tempForm) {
            if (key === 'platformList') {
              for (const item of this.platformOptions) {
                if (this.tempForm.platformList === item.id) {
                  res[key] = [item]
                  break
                }
              }
            } else if (key === 'organizationList') {
              const keyWord = this.tempForm.organizationList[this.tempForm.organizationList.length - 1]
              res[key] = [
                {
                  id: keyWord,
                  name: ''
                }
              ]
            } else if (key === 'roleId') {
              res.id = this.tempForm[key]
            } else {
              res[key] = this.tempForm[key]
            }
          }
          res.menuTrees = [
            {
              id: this.tempForm.platformList,
              menuNodes: this.menuObj
            }
          ]
          if (this.isAdd) {
            addRole(res).then(result => {
              if (result.code === 0) {
                this.$message.success('添加角色成功')
              }
            }).catch(e => {
              this.$message.error('添加角色失败')
            }).finally(() => {
              this.$router.push({
                name: 'role'
              })
            })
          } else {
            updateRole(res).then(result => {
              if (result.code === 0) {
                this.$message.success('更新角色信息成功')
              }
            }).catch(e => {
              this.$message.error('更新角色信息失败')
            }).finally(() => {
              this.$router.push({
                name: 'role'
              })
            })
          }
        } else {
          this.$message.error('请重新填写错误项或缺省项')
        }
      })
    },

    // 返回
    handleCancel() {
      // 进行路由跳转
      this.$router.push({
        name: 'role'
      })
    }
  },
  watch: {
    // 监听过滤字段
    filterText(val) {
      this.$refs.tree.filter(val)
    }
  }
}
</script>

<style scoped lang="scss">
  .form {
    height: calc(100vh - 50px);
    .container {
      display: flex;
      height: 90%;
      .title {
        font-size: 15px;
        font-weight: bold;
        color: #606266;
        width: 100px;
        height: 50px;
        padding-top: 20px;
        margin-left: 30px;
        margin-bottom: 10px;
      }
      .left {
        width: 25%;
        transition: all 1s;
      }
      .left-without-btn {
        margin-left: 6%;
        width: 40%;
      }
      .right {
        width: 68%;
        height: 100%;
        display: flex;
        margin-left: 7%;
        transition: all 1s;
      }
      .right-without-btn {
        width: 35%;
        height: 100%;
        display: flex;
        margin-left: 10%;
      }
      .right-box {
        flex: 1;
        width: 43%;
        margin-right: 7%;
        height: 100%;
        .page-wrapper {
          display: block;
          height: 100%
        }
        .right-box-content {
          height: 85%;
          display: block;
          border: 1px solid lightgray;
          border-radius: 5px;
          padding: 10px 15px;
          overflow: scroll;
        }
      }
      .btn-checkbox-group {
        display: inline-block;
        width: 100%;
      }
      .btn-checkbox {
        display: block;
        margin-left: 10px;
      }
      .without-btn {
        width: 100%;
        margin-left: 1.5%;
      }
      .with-btn {
        width: 50%;
        margin-left: 1.5%;
        padding: 1% 1%;
      }
    }
    .operate-button {
      width: 100%;
      height: 600px;
      position: relative;
      .pos {
        position: absolute;
        right: 5%;
      }
    }
  }
  ::v-deep .el-cascader {
    width: 100%;
  }
  ::v-deep .el-input {
    width: 100%;
  }
  ::v-deep .el-select {
    width: 100%;
  }
  ::v-deep .el-textarea {
    width: 100%;
  }
  ::v-deep .el-form-item__content {
    height: 100%;
  }
</style>
