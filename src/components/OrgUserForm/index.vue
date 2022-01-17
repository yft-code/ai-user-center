<template>
  <el-form ref="form" :model="tempData" label-width="105px" :class="!isDisabled ? 'addForm' : 'editForm'">
    <!--头像-->
    <div class="avatar-outer">
      <el-form-item
        label="头像"
        prop="photo"
      >
        <el-upload
          class="avatar-uploader"
          action="string"
          :show-file-list="false"
          :http-request="uploadImgs"
          :on-success="handleAvatarSuccess"
          :before-upload="beforeAvatarUpload"
        >
          <template v-if="tempData.photo">
            <div class="avatar-shadow">
              <span style="display: inline-block; height: 100px; line-height: 100px; color: #fff">更换照片</span>
            </div>
            <img v-if="tempData.photo" :src="tempData.photo" class="avatar">
            <span class="el-upload-list__item-actions">
              <span
                class="el-upload-list__item-delete"
                @click="handleDeleteAvater"
              >
                <i class="el-icon-delete" />
              </span>
            </span>
          </template>
          <i v-else class="el-icon-plus avatar-uploader-icon" />
        </el-upload>
      </el-form-item>
    </div>
    <!--姓名-->
    <div class="name-outer">
      <el-form-item
        label="姓名"
        prop="name"
        style="width: 100%; position: absolute; bottom: -20px"
        :rules="[
          { required: true, message: '姓名不能为空'},
        ]"
      >
        <el-input
          v-model="tempData.name"
          placeholder="请输入姓名"
          autocomplete="off"
          maxlength="20"
          minlength="1"
        />
      </el-form-item>
    </div>
    <!--性别-->
    <el-form-item
      label="性别"
      class="form-item"
      prop="sex"
    >
      <!--      <el-radio-group v-model="tempData.sex" placeholder="请选择">-->
      <!--        <el-radio-button label=""></el-radio-button>-->
      <!--        <el-radio-button label="北京"></el-radio-button>-->
      <!--        <el-radio-button label="广州"></el-radio-button>-->
      <!--        <el-radio-button label="深圳"></el-radio-button>-->
      <!--      </el-radio-group>-->
      <el-select v-model="tempData.sex" placeholder="请选择" clearable>
        <el-option
          v-for="item in genderOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
    </el-form-item>
    <!--生日-->
    <el-form-item
      label="生日"
      class="form-item"
      prop="birthday"
      :rules="[
        { validator: validateBirthday, trigger: ['change'] }
      ]"
    >
      <el-date-picker
        v-model="tempData.birthday"
        type="date"
      />
    </el-form-item>
    <!--手机号-->
    <el-form-item
      label="手机号"
      prop="phone"
      class="form-item"
      :rules="[
        { required: true, message: '手机号不能为空'},
        { validator: validatePhoneNumber, trigger: ['blur'] }
      ]"
    >
      <el-input
        v-model="tempData.phone"
        placeholder="请输入手机号"
        :disabled="isDisabled"
        autocomplete="off"
        maxlength="11"
      />
    </el-form-item>
    <!--邮箱-->
    <el-form-item
      label="邮箱"
      prop="email"
      class="form-item"
      :rules="[
        { required: true, message: '邮箱不能为空'},
        { validator: validateEmail, trigger: ['blur'] }
      ]"
    >
      <el-input
        v-model="tempData.email"
        placeholder="请输入邮箱"
        autocomplete="off"
        maxlength="30"
      />
    </el-form-item>
    <!--账户-->
    <el-form-item
      label="用户账号"
      prop="userAccount"
      class="form-item"
      :rules="[
        { required: true, message: '用户账号不能为空'},
        { validator: validateAccount, trigger: ['blur']}
      ]"
    >
      <el-input
        v-model="tempData.userAccount"
        placeholder="请输入账号"
        :disabled="isDisabled"
        autocomplete="off"
        maxlength="20"
      />
    </el-form-item>
    <!--登陆密码-->
    <el-form-item
      label="登陆密码"
      prop="password"
      class="form-item"
      :rules="[
        { required: true, message: '密码不能为空'},
        { validator: validatePassword, trigger: ['blur']}
      ]"
    >
      <el-input
        v-model="tempData.password"
        :disabled="isDisabled"
        placeholder="请输入登陆密码"
        autocomplete="off"
        maxlength="20"
        minlength="6"
        show-password
      />
    </el-form-item>
    <!--工号 -->
    <el-form-item
      label="工号"
      prop="empNum"
      class="form-item"
      :rules="[
        { validator: validateLetterAndNumber, trigger: ['blur'] }
      ]"
    >
      <el-input
        v-model="tempData.empNum"
        placeholder="请输入工号"
        autocomplete="off"
        maxlength="15"
      />
    </el-form-item>
    <!--岗位-->
    <el-form-item
      label="岗位"
      class="form-item"
      prop="postId"
    >
      <el-select v-model="tempData.postId" placeholder="请选择" clearable>
        <el-option
          v-for="item in occupationOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
    </el-form-item>
    <!--有效期-->
    <template v-if="!isDisabled">
      <el-form-item
        label="有效期"
        class="form-item"
        prop="validDate"
        :rules="[
          { validator: validateExpire, trigger: ['change'] }
        ]"
      >
        <el-date-picker
          v-model="tempData.validDate"
          type="date"
        />
      </el-form-item>
    </template>
    <!--状态-->
    <el-form-item
      label="状态"
      :class="!isDisabled ? 'form-item' : 'state-edit'"
      prop="status"
    >
      <el-switch
        v-model="tempData.status"
        :active-value="0"
        :inactive-value="1"
      />
    </el-form-item>
    <!--新增备注-->
    <template v-if="!isDisabled">
      <div style="width: 100%;">
        <el-form-item
          label="备注"
          prop="remarks"
        >
          <el-input
            v-model="tempData.remarks"
            type="textarea"
            :rows="2"
            placeholder="请输入备注"
            maxlength="100"
          />
        </el-form-item>
      </div>
    </template>
    <!--操作按钮-->
    <el-form-item class="operate-button">
      <el-button type="primary" size="small" @click="submitForm">确定</el-button>
      <el-button size="small" @click="handleCancel">取消</el-button>
    </el-form-item>
  </el-form>
</template>

<script>
import { uploadAvatar, isAccountConflict, isPhoneConflict } from '../../api/userInfo'

export default {
  name: 'OrgUserForm',
  props: {
    // 是否禁用
    isDisabled: {
      type: Boolean,
      default: false
    },
    // 表数据
    formData: {
      type: Object,
      default: () => {
      }
    }
  },
  data() {
    return {
      dataFlag: true,
      // 所属平台数据, 通过接口请求
      platformOptions: [
        {
          label: '平台1',
          value: 0
        }
      ],
      // 所属机构数据, 通过接口请求
      organizationOptions: [
      ],
      // 岗位数据，通过接口请求
      occupationOptions: [
        {
          label: '开发岗',
          value: '0'
        },
        {
          label: '综合岗',
          value: '1'
        }
      ],
      // 性别选项
      genderOptions: [
        {
          label: '男',
          value: 0
        },
        {
          label: '女',
          value: 1
        }
      ],
      // 表头
      columns: {
        specialCols: [],
        organizationName: {
          label: '机构名称'
        },
        oaUserNum: {
          label: 'OA用户编码',
          slot: true
        },
        erpUserNum: {
          label: 'ERP用户编码',
          slot: true
        },
        erpEmpNum: {
          label: 'ERP职员编码',
          slot: true
        },
        empNum: {
          label: '工号',
          slot: true
        },
        subOrganizationNames: {
          label: '部门',
          slot: true
        },
        postId: {
          label: '岗位',
          slot: true
        },
        isMain: {
          label: '主企业',
          slot: true
        }
      },
      // 操作列
      operationCols: [
        {
          prop: 'operation',
          label: '操作',
          width: '120px',
          align: 'center',
          fixed: 'right',
          btnBox: [
            {
              name: '角色配置',
              type: 'text',
              size: 'mini',
              callback: (index, row) => {
                console.log(index, row)
              }
            }
          ]
        }
      ],
      // formData的代替数据，因为单向数据流
      tempData: {}
    }
  },
  watch: {
    formData(val) {
      if (this.isDisabled) {
        this.tempData = Object.assign({}, this.formData)
      } else {
        this.tempData = {
          photo: '',
          userAccount: '',
          name: '',
          sex: 0,
          birthday: '',
          phone: '',
          email: '',
          empNum: '',
          postId: '',
          password: '',
          remarks: '',
          validDate: '',
          status: 0
        }
      }
    }
  },
  mounted() {
    if (this.dataFlag && this.isDisabled === true) {
      this.getData()
    }
  },
  created() {
    if (this.isDisabled) {
      this.tempData = Object.assign({}, this.formData)
    } else {
      this.tempData = {
        photo: '',
        userAccount: '',
        name: '',
        sex: 0,
        birthday: '',
        phone: '',
        email: '',
        empNum: '',
        postId: '',
        password: '',
        remarks: '',
        validDate: '',
        status: 0
      }
    }
  },
  methods: {
    // 取消按钮点击事件
    handleCancel() {
      this.$emit('cancel-add')
    },
    // 上传头像
    uploadImgs(file) {
      const formData = new FormData()
      formData.append('file', file.file)
      uploadAvatar(formData).then(res => {
        if (res.code === 0) {
          this.tempData.photo = res.result
          this.$message.success(res.message)
        } else {
          this.$message.error('上传头像失败')
        }
      })
    },
    // 头像上传成功触发函数
    handleAvatarSuccess(res, file) {
      this.formData.avatar = URL.createObjectURL(file.raw)
    },
    // 头像上传前触发
    beforeAvatarUpload(file) {
      const isCommandType = file.type === 'image/jpeg' || file.type === 'image/jpg' || file.type === 'image/png'
      const isLt4M = file.size / 1024 / 1024 < 4

      if (!isCommandType) {
        this.$message.error('上传头像图片只能为jpg、jpeg或者png格式!')
      }

      if (!isLt4M) {
        this.$message.error('上传头像图片大小不能超过 4MB！')
      }
      return isCommandType && isLt4M
    },
    // 重置表单
    resetForm() {
      this.$refs.form.resetFields()
    },
    // 提交
    submitForm() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          if (!this.isDisabled) {
            this.$emit('user-add', this.tempData)
          } else {
            this.tempData.organizations = []
            this.$emit('user-edit', this.tempData)
          }
        } else {
          this.$message.error('请重新填写错误项或缺省项')
          return false
        }
      })
    },
    // 重置密码触发
    resetPassword() {
      this.$message.success('重置密码成功!')
    },
    // 验证有效期
    validateExpire(rule, value, callback) {
      if (value) {
        const expireDate = Date.parse(value)
        const current = Date.parse(new Date())
        if (expireDate < current) {
          callback(new Error('有效期不得早于当前日期'))
        } else {
          callback()
        }
      }
      callback()
    },
    // 校验生日
    validateBirthday(rule, value, callback) {
      if (value) {
        const birthdayTime = Date.parse(value)
        const start = Date.parse('1900-01-01')
        const current = Date.parse(new Date())
        if (birthdayTime < start) {
          callback(new Error('生日日期不得早于1900-01-01'))
        } else if (birthdayTime > current) {
          callback(new Error('生日日期不得晚于当前日期'))
        }
        callback()
      }
      callback()
    },
    // 校验employeeID
    validateLetterAndNumber(rule, value, callback) {
      const pattern = /^[a-z\d]*$/i
      if (!pattern.test(value)) {
        callback(new Error('工号只能是字母和数字的组合'))
      }
      callback()
    },
    // 校验邮箱
    validateEmail(rule, value, callback) {
      const pattern = /^[A-Za-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/
      if (!pattern.test(value)) {
        callback(new Error('邮箱格式错误'))
      }
      callback()
    },
    // 校验账号重复性
    async validateAccount(rule, value, callback) {
      if (value.length < 6) {
        callback(new Error('账户需不小于6个字符'))
      }
      if (!this.isDisabled) {
        const { result } = await isAccountConflict({ userAccount: value })
        if (result) {
          callback(new Error('该用户账号已存在，请重新填写'))
        }
      }
      // 发请求校验
      callback()
    },
    // 校验手机号重复性
    async validatePhoneNumber(rule, value, callback) {
      const pattern = /^[1](([3][0-9])|([4][0,1,4-9])|([5][0-3,5-9])|([6][2,5,6,7])|([7][0-8])|([8][0-9])|([9][0-3,5-9]))[0-9]{8}$/
      if (!pattern.test(value)) {
        callback(new Error('手机格式错误'))
      }
      if (!this.isDisabled) {
        const { result } = await isPhoneConflict({ phone: value })
        if (result) {
          callback(new Error('该手机号已存在，请重新填写'))
        }
      }
      // 调用接口查找是否已被注册, 是的话调出相关数据
      callback()
    },
    // 校验密码
    validatePassword(rule, value, callback) {
      const pattern = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{6,16}$/
      if (!pattern.test(value)) {
        callback(new Error('包含大小写字母和数字且长度在6-16'))
      }
      callback()
    },
    // 删除头像
    handleDeleteAvater() {
      this.tempData.avatar = ''
    }
  }
}
</script>

<style scoped lang="scss">
  .avatar-uploader ::v-deep.el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }
  .avatar-uploader ::v-deep.el-upload:hover {
    border-color: #409EFF;
  }
  .avatar-outer {
    width: 50%;
    height: 100px;
    margin-bottom: 16px;
    .avatar-uploader-icon {
      font-size: 28px;
      color: #8c939d;
      width: 100px;
      height: 100px;
      line-height: 100px;
      text-align: center;
    }
    .avatar {
      width: 100px;
      height: 100px;
      line-height: 100px;
      display: block;
    }
    .avatar-shadow {
      opacity: 0;
      background-color: grey;
      width: 100px;
      height: 100px;
      position: absolute;
    }
    .avatar-shadow:hover {
      opacity: 0.8;
    }
  }
  .operate-button {
    width: 100%;
    text-align: right;
    padding-right: 25px;
  }
  .addForm {
    width: 97%;
    display: flex;
    flex-wrap: wrap;
    overflow: hidden;
    .form-item {
      width: 50%;
      height: 40px;
    }
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
  .name-outer {
    width: 50%;
    height: 100px;
    margin-bottom: 16px;
    position: relative;
  }
  .editForm {
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    overflow: hidden;
    .form-item {
      width: 25%;
      height: 40px;
    }
  }
  .reset-password-btn {
    height: 40px;
    margin-left: 20px;
    margin-top: 10px;
  }
  .state-edit {
    margin-top: 10px;
  }
</style>
