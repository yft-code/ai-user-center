<template>
  <div class="navbar">
    <!--    <hamburger :is-active="sidebar.opened" class="hamburger-container" @toggleClick="toggleSideBar" />-->

    <!--    <breadcrumb class="breadcrumb-container" />-->
    <div class="logo-container">
      <div style="width: 45.4%; height: 75%; margin: 0 auto">
        <img src="@/assets/logo/logo.svg" alt="" style="width: 100%; height: 100%;">
      </div>
    </div>
    <div class="right-menu">
      <el-dropdown class="avatar-container" trigger="hover">
        <div class="avatar-wrapper">
          <img :src="photo" class="user-avatar">
          <div class="user-name">{{ name }}</div>
        </div>
        <el-dropdown-menu slot="dropdown" class="user-dropdown">
          <el-dropdown-item @click.native="logout">
            <span style="display:block;">退出登陆</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
// import Breadcrumb from '@/components/Breadcrumb'
// import Hamburger from '@/components/Hamburger'

export default {
  components: {
    // Breadcrumb,
    // Hamburger
  },
  data() {
    return {
      name: '',
      photo: JSON.parse(localStorage.getItem('userInfo')).photo !== '' ? JSON.parse(localStorage.getItem('userInfo')).photo : require('@/assets/img/default_avatar.jpg')
    }
  },
  computed: {
    ...mapGetters([
      'sidebar',
      'avatar'
    ])
  },
  created() {
    const userInfo = (localStorage.getItem('userInfo') && JSON.parse(localStorage.getItem('userInfo'))) || {}
    this.name = userInfo.userAccount
  },
  methods: {
    toggleSideBar() {
      this.$store.dispatch('app/toggleSideBar')
    },
    async logout() {
      localStorage.clear()
      sessionStorage.clear()
      this.$message.success('登出成功')
      localStorage.setItem('flag', '')
      this.$router.push({ path: '/login' })
    }
  }
}
</script>

<style lang="scss" scoped>
.navbar {
  height: 3.3rem;
  overflow: hidden;
  position: fixed;
  background: #fff;
  box-shadow: 0 4px 5px rgba(0,21,41,.08);

  .hamburger-container {
    line-height: 46px;
    height: 100%;
    float: left;
    cursor: pointer;
    transition: background .3s;
    -webkit-tap-highlight-color:transparent;

    &:hover {
      background: rgba(0, 0, 0, .025)
    }
  }

  .breadcrumb-container {
    float: left;
  }

  .right-menu {
    float: right;
    height: 100%;
    line-height: 50px;
    &:focus {
      outline: none;
    }

    .right-menu-item {
      display: inline-block;
      padding: 0 8px;
      height: 100%;
      font-size: 18px;
      color: #5a5e66;
      vertical-align: text-bottom;

      &.hover-effect {
        cursor: pointer;
        transition: background .3s;

        &:hover {
          background: rgba(0, 0, 0, .025)
        }
      }
    }
    .avatar-container {
      margin-right: 30px;
      margin-top: 12px;
      position: relative;
     .avatar-wrapper {
        display: flex;
        .user-avatar {
          cursor: pointer;
          width: 30px;
          height: 30px;
          border-radius: 50%;
        }
        .user-name {
          margin-left: 20px;
          line-height: 30px;
          cursor: pointer;
          font-size: 18px;
        }
      }
    }
  }
  .logo-container {
    float: left;
    width: 14.6%;
    height: 3.3rem;
    background-color: rgb(69, 129, 247);
    padding-top: 10px;
  }
}
</style>
