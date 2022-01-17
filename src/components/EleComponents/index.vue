<template>
  <div>
    <template v-if="item.type === 'input'">
      <el-form-item :label="item.label" style="width: 100%">
        <el-input
          v-model.trim="value"
          style="width: 100%"
          :name="item.name"
          :placeholder="item.placeholder"
        />
      </el-form-item>
    </template>
    <template v-else-if="item.type === 'date'">
      <el-form-item :label="item.label" style="width: 100%">
        <el-date-picker
          v-model="value"
          style="width: 100%"
          :name="item.name"
          :type="item.dateType"
          :placeholder="item.placeholder"
        />
      </el-form-item>
    </template>
    <template v-else-if="item.type === 'searchCascader'">
      <el-form-item :label="item.label" style="width: 100%">
        <el-popover
          placement="bottom"
          width="400"
          trigger="manual"
        />
      </el-form-item>
    </template>
    <template v-else-if="item.type === 'select'">
      <el-form-item :label="item.label">
        <el-select
          v-model="value"
          style="width:100%"
          :name="item.name"
          :placeholder="item.placeholder"
        >
          <el-option
            v-for="(opt, index) in item.options"
            :key="index"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
      </el-form-item>
    </template>
    <template v-else-if="item.type === 'button'">
      <el-form-item class="form-btn">
        <el-button
          :type="item.btnType"
          @click="item.callback()"
        >{{
          item.name
        }}</el-button>
      </el-form-item>
    </template>
    <template v-else-if="item.type === 'btnInline'">
      <el-form-item class="form-btn">
        <el-button
          v-for="(btn, index) in item.btnList"
          :key="index"
          :size="btn.size"
          :normalizer="normalizer"
          :type="btn.btnType"
          @click="btn.callback()"
        >{{ btn.name }}</el-button>
      </el-form-item>
    </template>
    <!-- 布局字段占位内容 -->
    <template v-else-if="item.type === 'seat'">
      <el-form-item class="seat" />
    </template>
    <template v-else-if="item.type === 'select-demo'">
      <slot ref="selectTree" name="selectTree" />
    </template>
    <template v-else-if="item.type === 'date-demo'">
      <slot ref="dateDemo" name="dateDemo" />
    </template>
    <template v-else-if="item.type === 'option-demo'">
      <slot ref="optionDemo" name="optionDemo" />
    </template>
  </div>
</template>
<script>
import SearchCascader from '@/components/SearchCascader'
export default {
  components: {
    SearchCascader
  },
  props: {
    // 字段配置
    item: {
      type: Object,
      default: () => {
        return {}
      }
    },
    // 是否清空标志
    clearFlag: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      // 子组件中绑定的值
      value: ''
    }
  },
  watch: {
    // 组件中的值发生变化则传递给父组件
    value(newvalue, oldvalue) {
      this.$emit('update-value', { value: newvalue, key: this.item.name })
    },
    // 变化则清空组件中的值
    clearFlag() {
      this.value = ''
    }
  },
  methods: {
  }
}
</script>
<style lang="scss" scoped>
::v-deep .form-btn {
  .el-form-item__content {
    margin-left: 0 !important;
  }
}
</style>
