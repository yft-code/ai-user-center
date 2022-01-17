<template>
  <el-form :model="tempForm" ref="form" label-width="100px" class="form">
    <div class="container">
      <el-form-item
        class="form-item"
        label="所属机构"
        prop="orgId"
        :rules="[
          { required: true, message: '所属机构不能为空'},
        ]"
      >
        <el-cascader
          v-model="tempForm.orgId"
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
        class="form-item"
        prop="platId"
        :rules="[
          { required: true, message: '所属平台不能为空'},
        ]"
      >
        <el-select
          v-model="tempForm.platId"
          placeholder="请选择所属平台"
          :disabled="!isAdd"
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
        label="岗位名称"
        prop="positionName"
        class="form-item"
        :rules="[
          { required: true, message: '岗位名称不能为空' },
          { validator: validatePositionName, trigger: ['blur', 'change'] }
        ]"
      >
        <el-input
          placeholder="请输入岗位名称"
          autocomplete="off"
          maxlength="20"
          minlength="1"
          v-model="tempForm.positionName"
        ></el-input>
      </el-form-item>

      <el-form-item
        label="岗位编码"
        class="form-item"
        prop="positionCode"
        :rules="[
          { required: true, message: '岗位编码不能为空' },
          { validator: validatePositionCode, trigger: ['blur', 'change'] }
        ]"
      >
        <el-input
          v-model="tempForm.positionCode"
          placeholder="请输入岗位编码"
          :disabled="!isAdd"
          autocomplete="off"
          maxlength="20"
          minlength="1"
        ></el-input>
      </el-form-item>

      <el-form-item
        label="岗位备注"
        prop="remarks"
        class="form-item-remarks"
      >
        <el-input
          type="textarea"
          :rows="4"
          placeholder="请输入岗位备注"
          v-model="tempForm.remarks"
          maxlength="100"
        >
        </el-input>
      </el-form-item>

      <el-form-item class="operate-button">
        <el-button type="primary" @click="submitForm" size="small">确定</el-button>
        <el-button size="small" @click="handleCancel">取消</el-button>
      </el-form-item>
    </div>
  </el-form>
</template>

<script>
import { getPlatform, getNodeTree } from '../../api/menu'
import { isPositionExist } from '../../api/post'

export default {
  name: 'PositionForm',
  props: {
    // 是否为新增
    isAdd: {
      type: Boolean,
      default: false
    },
    // 表格数据
    formData: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      tempForm: {
        orgId: [],
        platId: '',
        positionName: '',
        positionCode: '',
        remarks: ''
      },
      // 平台数据
      platformOptions: [],
      // 机构数据
      organizationOptions: []
    }
  },
  created() {
    if (!this.isAdd) {
      this.tempForm = Object.assign({}, this.formData)
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
        this.$message.error('获取机构信息失败')
      }
    }).catch(e => {
      this.$message.error('获取机构信息失败')
    })
  },
  methods: {
    // 验证岗位名字或编码的重复性
    async validatePositionName(rule, value, callback) {
      if (this.tempForm.orgId.length < 0 || this.tempForm.platId === '') {
        callback(new Error('请先选择所属机构和所属平台'))
        return
      }
      const params = {
        orgId: this.tempForm.orgId[this.tempForm.orgId.length - 1],
        platId: this.tempForm.platId,
        positionName: value
      }
      const { code } = await isPositionExist(params)
      if (code === 1024) {
        callback(new Error('该岗位名称已存在, 请重新填写'))
      }
      callback()
      // if (type === 0) {
      //   params.positionName = this.tempForm.positionName
      //   isPositionExist(params).then(res => {
      //     if (res.code === 402) {
      //       callback(new Error('该岗位名称已存在, 请重新填写'))
      //     }
      //   })
      // } else if (type === 1) {
      //   params.positionCode = this.tempForm.positionCode
      //   isPositionExist(params).then(res => {
      //     console.log(res);
      //   })
      // }
    },
    // 验证岗位编码是否存在
    async validatePositionCode(rule, value, callback) {
      if (this.tempForm.orgId.length < 0 || this.tempForm.platId === '') {
        callback(new Error('请先选择所属机构和所属平台'))
        return
      }
      const params = {
        orgId: this.tempForm.orgId[this.tempForm.orgId.length - 1],
        platId: this.tempForm.platId,
        positionCode: value
      }
      const { code } = await isPositionExist(params)
      if (code === 1024) {
        callback(new Error('该岗位编码已存在, 请重新填写'))
      }
      callback()
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
    // 重置表单
    resetForm() {
      this.$refs.form.resetFields()
    },
    // 提交
    submitForm() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          if (this.isAdd) {
            this.$emit('post-add', this.tempForm)
          } else {
            this.$emit('post-edit', this.tempForm)
          }
        } else {
          this.$message.error('请重新填写错误项或缺省项')
          return false
        }
      })
    },
    // 取消按钮点击事件
    handleCancel() {
      this.$emit('cancel-add')
    }
  },
  watch: {
    formData(val) {
      if (this.isAdd) {
        this.tempForm = {
          orgId: [],
          platId: '',
          positionName: '',
          positionCode: '',
          remarks: ''
        }
      } else {
        this.tempForm = Object.assign({}, val)
      }
    }
  }
}
</script>

<style scoped lang="scss">
  .container {
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    margin-left: -1.5%;
    .form-item {
      width: 50%;
    }
    .form-item-remarks {
      width: 100%;
    }
    .operate-button {
      width: 100%;
      text-align: right;
      margin-bottom: -10px;
      padding-right: 25px;
    }
    ::v-deep .el-cascader {
      width: 100%;
    }
    ::v-deep .el-select {
      width: 100%;
    }
    ::v-deep .el-input {
      width: 100%;
    }
    ::v-deep .el-textarea {
      width: 100%;
    }
  }
</style>
