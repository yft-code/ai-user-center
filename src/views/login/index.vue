<template>
  <div class="login-container">
    <div class="logoImg">
      <img :src="imgs" alt>
      <div class="text">|</div>
      <div class="text">用户中心管理</div>
    </div>
    <div>
      <div class="login-form">
        <div class="login_word">登 录</div>
        <div class="login_input">
          <el-alert
            v-if="isShowErrorMessage"
            :title="errorMessage"
            type="warning"
            show-icon
            :closable="false"
          />
          <el-form
            ref="loginForm"
            :model="loginForm"
            :rules="loginRules"
            class="input_ruleForm"
          >
            <el-form-item prop="username">
              <el-input
                v-model.trim="loginForm.username"
                placeholder="请输入用户名"
                maxlength="20"
                @keyup.enter.native="handleLogin"
              />
            </el-form-item>
            <el-form-item prop="password">
              <el-input
                v-model.trim="loginForm.password"
                type="password"
                placeholder="请输入密码"
                autocomplete="off"
                @keyup.enter.native="handleLogin"
              />
            </el-form-item>
            <el-button
              type="primary"
              class="loginButton"
              :loading="loading"
              @click="handleLogin"
            >登 录</el-button>
          </el-form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getMenuByUser } from '@/api/userInfo'
export default {
  name: 'Login',
  data() {
    const validateUsername = (rule, value, callback) => {
      if (!value.trim()) {
        callback(new Error('请输入用户名！'))
      } else if (value.indexOf(' ') !== -1) {
        callback(new Error('用户名不能包含空格'))
      } else if (value.trim().length >= 16) {
        callback(new Error('用户名最大长度为16！'))
      } else {
        callback()
      }
    }
    // 密码校验
    const validatePassword = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请输入密码！'))
      } else if (!value) {
        callback(new Error('密码输入错误！'))
      } else {
        callback()
      }
    }
    return {
      loginForm: {
        password: '',
        username: ''
      },
      loginRules: {
        username: [
          { required: true, trigger: 'blur', validator: validateUsername }
        ],
        password: [
          { required: true, trigger: 'blur', validator: validatePassword },
          {
            pattern: /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{6,16}$/,
            message: '密码必须包含大小写字母和数字且长度在6-16之间'
          }
        ]
      },
      loading: false,
      isShowErrorMessage: false,
      errorMessage: '',
      imgs: require('@/assets/img/logo.svg')
    }
  },
  methods: {
    // 跳转到首页第一个显示菜单
    handleToPage() {
      this.$router.replace({ path: '/generalView' })
    },
    // handleLogin() {
    //   this.$router.push({ name: 'user' })
    // }
    // 登录功能
    handleLogin() {
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          this.loading = true
          const params = {}
          params.username = this.loginForm.username
          params.password = this.loginForm.password
          this.$store.dispatch('user/login', params).then(() => {
            const res = this.$store.getters.res
            if (res.code === 0) {
              this.loading = false
              this.isShowErrorMessage = false
              getMenuByUser({ platId: '2' }).then(res => {
                const { result } = res
                if (result && result.length > 0) {
                  this.$message({
                    type: 'success',
                    message: '登录成功'
                  })
                  this.$router.push({ name: 'user' })
                } else {
                  this.$message({
                    type: 'warning',
                    message: '该用户没有角色权限，请联系管理员设置'
                  })
                  localStorage.clear()
                  sessionStorage.clear()
                  this.$router.push({ path: '/login' })
                }
              }).catch()
            } else {
              this.loading = false
              this.isShowErrorMessage = true
              this.errorMessage = res.message
            }
          }).catch(res => {
            this.isShowErrorMessage = true
            this.errorMessage = res.message
            this.loading = false
          })
        }
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.login-container {
  .logoImg{
    display: flex;
    img{
      width:160px;
      height:40px
    }
    .text{
      font-size: 33px;
      color: white;
      margin-left: 20px;
    }
    margin-left: 20px;
    margin-top: 20px;
  }
  font-size: 30px;
  height: 100%;
  width: 100%;
  background-image: url("~@/assets/img/login.jpg");
  background-size: 100% 100%;
  position: fixed;
  .login-form {
    background-color: white;
    // height:55vh;
    width: 28vw;
    position: fixed;
    border-radius: 20px;
    right: 9%;
    top: 22%;
  }
  v::deep .el-button {
    display: inline-block;
    line-height: 1;
    white-space: nowrap;
    cursor: pointer;
    border: 1px solid #DCDFE6;
    -webkit-appearance: none;
    text-align: center;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    outline: 0;
    margin: 0;
    -webkit-transition: .1s;
    transition: .1s;
    font-weight: 500;
    padding: 0.6vh 0.6vw;
    font-size:25px;
    border-radius: 4px;
}
  .login_word {
    width: 100%;
    height: 18vh;
    text-align: center;
    font-weight: bold;
    line-height: 18vh;
    color: #0a1933;
    font-size:40px;
    // background-color: #ff3a3a;
  }
 v::deep .el-alert__title {
    font-size: 18px;
    line-height: 18px;
}
 v::deep .el-form-item__error {
    font-size: 18px;
}
  v::deep .el-input__inner {
     height: 5vh;
     line-height: 5vh;
     padding: 0.2vh 1vh;
     width: 100%;
     font-size: 20px;
}
 v::deep .el-form-item {
    margin-bottom: 2.5vh;

}
  .login_input {
    width: 78%;
    margin: 0 auto;
  }
  .input_ruleForm {
    width: 100%;
    // margin-top: -2vh;
  }
  .input_word {
    width: 100%;
  }
  .loginButton {
    width: 100%;
    border-radius: 6px;
    height:6.3vh;
    margin-top:2vh;
    margin-bottom: 11vh;
    font-size: 28px;
  }
  .el-alert--warning.is-light {
    color: #ff3a3a;
    background: #fff;
    padding-top: 0px;
    padding-left: 0px;
    display: flex;
    align-items: center;
  }
}
 </style>
<style lang="scss">
 .el-alert__content {
    display: flex;
  }
 </style>
