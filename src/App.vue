<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>
<style lang="scss" scoped>
#app{
::v-deep .el-table--fit {
    border-right: 1px solid #EBEEF5;
    border-left: 1px solid #EBEEF5;
}
}
</style>
<style lang="scss">
#app{
  .el-table th {
  font-weight: 400;
  color: rgba(10, 25, 51, 0.5);
  font-size: 16PX;
  background: rgba(10, 25, 51, 0.03) !important;

}
.el-table td {
  padding: 10px 0px;
  height: 20px;
  font-size: 15PX;
  font-weight: 400;
  color: #0a1933;
  line-height: 30px;
}
}

</style>
