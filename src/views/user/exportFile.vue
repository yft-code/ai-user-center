<template>
  <div class="importFileContainer">
    <el-dialog
      title="文件批量导入"
      :visible.sync="visible"
      width="600px"
      :close-on-click-modal="false"
      :before-close="handleClose"
    >
      <div>
        <el-upload
          v-if="flag"
          ref="upload"
          class="upload-demo"
          drag
          action="#"
          accept=".xlsx,.xls"
          :http-request="submitUpload"
          :before-upload="beforeUpload"
        >
          <div class="before-upload">
            <i class="iconfont icon-file_line text" />
            <div class="el-upload__text textOne">您可以直接拖拽文件到这里或点击上传</div>
            <div class="el-upload__text textTwo">通过.xlsx. xls格式的文件批量上传人员清单</div>
          </div>
        </el-upload>
        <div class="btn-group">
          <el-button v-if="flag" type="primary" class="btn" size="mini" @click="handleMould">下载模板</el-button>
        </div>
      </div>
      <div v-if="flagLoading">
        <div class="uploading">文件正在上传，请不要关闭弹窗和浏览器</div>
        <div class="uploading-word">
          <span style="float: left">
            <i class="iconfont icon-file_link_line textThree" />{{ fileNameShow }}
          </span>
          <i style="float:right " class="iconfont icon-close_line" @click.stop="handleCancel" />
        </div>
        <el-progress class="progress" :percentage="percentage" />
      </div>
      <div v-if="flagEnd" style="text-align: center">
        <div>
          <i v-if="success" class="iconfon el-icon-circle-check textFour" />
          <i v-if="fail" class="iconfon el-icon-circle-close  textSix" />
        </div>
        <div class="result">{{ result }}</div>
        <div />
      </div>

      <span slot="footer" class="dialog-footer">
        <el-button v-if="flagLoading" size="mini" @click="handleCancel">取 消</el-button>
        <el-button v-if="flagEnd" size="mini" @click="handleClose">取 消</el-button>
        <el-button v-if="!flag" type="primary" size="mini" :disabled="!flagEnd" @click="handleResult">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import * as api from '@/api/userInfo'
export default {
  name: 'Index',
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      result: '',
      downloadResult: true,
      files: {},
      fileNameShow: '',
      // 刚打开没有上传文件时
      flag: true,
      // 文件正在上传时页面
      flagLoading: false,
      // 文件上传完成后的页面
      flagEnd: false,
      percentage: 0,
      success: false,
      fail: false,
      all: 0
    }
  },
  methods: {
    // 上传前 文件校验
    beforeUpload(file) {
      this.files = file
      const extension = file.name.split('.')[1] === 'xls'
      const extension2 = file.name.split('.')[1] === 'xlsx'
      // const isLt2M = file.size / 1024 / 1024 < 2
      if (!extension && !extension2) {
        this.$message.warning('上传文件只能是 xls、xlsx格式!')
        return
      }
      // if (!isLt2M) {
      //   this.$message.warning('上传文件大小不能超过 2MB!')
      //   return
      // }
      this.fileName = file.name
      // 用于页面显示
      this.fileNameShow = file.name
      this.flag = false
      this.flagLoading = true
      this.flagEnd = false
      this.percentage = 0
    },
    // 确认上传
    submitUpload() {
      // 开启定时器
      this.handleTimer()
    },
    async handleCancel() {
      this.$confirm('你确定要取消上传吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.closeTime()
        this.percentage = 0
        this.handleClose()
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消取消'
        })
      })
    },

    // 下载结果
    handleResult() {
      this.handleClose()
      // const link = document.createElement('a')
      // link.href = this.resUrl
      // // link.href = 'http://10.22.90.23:8083/static/device_template.xlsx'
      // link.download = '下载结果.xls'
      // document.body.appendChild(link)
      // link.click()
    },
    // 下载模板
    handleMould() {
      // 利用a标签自定义下载文件名
      const link = document.createElement('a')
      // link.style.display = 'none'
      // link.href = 'http://localhost:9528/static/处理人员名单.xlsx'
      let baseURL = process.env.VUE_APP_BASE_API
      const index = baseURL.lastIndexOf(':')
      baseURL = baseURL.substring(0, index)
      link.href = baseURL + ':/images/inputuser.xlsx'
      link.download = '导入人员名单模板.xlsx'
      // link.setAttribute('file','员工信息导入模板.xls')
      document.body.appendChild(link)
      link.click()
    },
    // 定时器
    handleTimer() {
      const that = this
      this.timer = setInterval(function() {
        that.countdown()
      }, 100)
    },
    countdown() {
      this.percentage += 1
      if (this.percentage >= 100) {
        this.closeTime()
        const fileFormData = new FormData()
        fileFormData.append('file', this.files) // 上传的文件
        api.insertUserByExcel(fileFormData).then(res => { // 上传请求
          this.resUrl = res.result
          if (res.message.indexOf('成功') !== -1) {
            this.success = true
            this.fail = false
            this.result = res.message
          } else {
            this.success = false
            this.fail = true
            this.result = '添加失败,账号或手机号已存在或模板错误！'
          }
          // var arr = this.message.split('，')
          // this.all = parseInt(arr[0].substring(1).substring(1))
          // this.success = parseInt(arr[1].substring(1).substring(1))
          // this.fail = parseInt(arr[2].substring(1).substring(1))
          this.flag = false
          this.flagLoading = false
          this.flagEnd = true
          this.$parent.getData({})
          // this.downloadResult = false
          // this.$emit('close-callback', 'open')
        }).catch(() => {
          this.result = '上传失败'
          this.flag = false
          this.flagLoading = false
          this.flagEnd = true
          this.fileName = ''
        })
        // 关闭定时器
        // this.closeTime()
      }
    },
    // 定时器关闭
    closeTime() {
      clearInterval(this.timer)
    },

    handleClose() { // 该方法用于关闭弹窗
      this.closeTime()
      this.percentage = 0
      this.flag = true
      this.flagLoading = false
      this.flagEnd = false
      this.$emit('close-callback', 'close')
    }
  }
}
</script>

<style scoped lang="scss">
.importFileContainer{
  ::v-deep .el-dialog__footer{
    padding-bottom: 30px;
  }
  .el-upload__text{
    margin-top: 20px;
  }
  .textFour{
    color: #52C41A;
    font-size: 80px;
  }
  .result{
    color:#0A1933;
    font-size: 20px;
    margin-top: 30px;
  }
  .textFive{
    margin-left: 20px;
    color: #52C41A;
  }
  .textSix{
    color: #FF3A3A;
    font-size: 80px;
  }
  .textThree{
    font-size: 20px;
  }
  .textSeven{
    color:#86B2FC;
    font-size: 25px;
  }
  ::v-deep .el-dialog__body{
    border-top: #F7F8F9 1px solid;
    padding-top: 20px;
    // padding:31px
  }
  .text{
    color: #347FFF;
    font-size: 40px;
  }
  .textOne{
    font-size: 20px;
    color: #0F1E37;
  }
  .textTwo{
    font-size: 16px;
    color: #969CA8;
  }

  .upload-demo{
    text-align: center;
  }
  .before-upload{
   margin-top:20px;
  }
  .btn-group{
     height: 10px;
     margin-top: 10px;
     margin-right: 8px;
    .btn{
       float: right
     }
  }
  .uploading{
    text-align: center;
    font-size: 20px;
    color: #0A1933;
  }
  .uploading-word{
    height: 20px;
    margin-left: 30px;
    margin-right: 50px;
    margin-top: 50px
  }
  .progress{
    margin-left: 30px
  }
  ::v-deep .el-upload-dragger{
    width: 552px;
    height: 224px;
    background: rgba(10, 25, 51, 0.03);
    border-radius: 2px;
    // border: 1px solid rgba(10, 25, 51, 0.05);
  }
}
</style>
