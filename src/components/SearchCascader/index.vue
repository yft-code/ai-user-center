<template>
  <div
    ref="reference"
    :class="[
      'el-cascader',
      realSize && `el-cascader--${realSize}`,
      { 'is-disabled': isDisabled }
    ]"
    v-clickoutside="() => toggleDropDownVisible(false)"
    @mouseenter="inputHover = true"
    @mouseleave="inputHover = false"
    @click="() => toggleDropDownVisible(readonly ? undefined : true)"
    @keydown="handleKeyDown">

    <el-input
      ref="input"
      v-model=" inputValue"
      :size="realSize"
      :placeholder="placeholder"
      :readonly="readonly"
      :disabled="isDisabled"
      :validate-event="false"
      :class="{ 'is-focus': dropDownVisible }"
      @focus="handleFocus"
      @blur="handleBlur"
      @input="handleInput">
      <template slot="suffix">
        <i
          v-if="clearBtnVisible"
          key="clear"
          class="el-input__icon el-icon-circle-close"
          @click.stop="handleClear"></i>
        <i
          v-else
          key="arrow-down"
          :class="[
            'el-input__icon',
            'el-icon-arrow-down',
            dropDownVisible && 'is-reverse'
          ]"
          @click.stop="toggleDropDownVisible()"></i>
      </template>
    </el-input>

    <transition name="el-zoom-in-top" @after-leave="handleDropdownLeave">
      <div
        v-show="dropDownVisible"
        ref="popper"
        :class="['el-popper', 'el-cascader__dropdown', popperClass]">
        <el-cascader-panel
          ref="panel"
          v-show="!filtering"
          v-model="checkedValue"
          :options="sampleOptions"
          :props="config"
          :border="false"
          :render-label="$scopedSlots.default"
          @expand-change="handleExpandChange"
          @close="toggleDropDownVisible(false)"></el-cascader-panel>
      </div>
    </transition>
  </div>
</template>

<script>
import Popper from 'element-ui/src/utils/vue-popper';
import Clickoutside from 'element-ui/src/utils/clickoutside';
import Emitter from 'element-ui/src/mixins/emitter';
import Locale from 'element-ui/src/mixins/locale';
import Migrating from 'element-ui/src/mixins/migrating';
import AriaUtils from 'element-ui/src/utils/aria-utils';
import { t } from 'element-ui/src/locale';
import { isEqual, isEmpty, kebabCase } from 'element-ui/src/utils/util';
import { isUndefined, isFunction } from 'element-ui/src/utils/types';
import { isDef } from 'element-ui/src/utils/shared';
import { addResizeListener, removeResizeListener } from 'element-ui/src/utils/resize-event';
import debounce from 'throttle-debounce/debounce';

const { keys: KeyCode } = AriaUtils;
const MigratingProps = {
  expandTrigger: {
    newProp: 'expandTrigger',
    type: String
  },
  changeOnSelect: {
    newProp: 'checkStrictly',
    type: Boolean
  },
  hoverThreshold: {
    newProp: 'hoverThreshold',
    type: Number
  }
};

const PopperMixin = {
  props: {
    placement: {
      type: String,
      default: 'bottom-start'
    },
    appendToBody: Popper.props.appendToBody,
    visibleArrow: {
      type: Boolean,
      default: true
    },
    arrowOffset: Popper.props.arrowOffset,
    offset: Popper.props.offset,
    boundariesPadding: Popper.props.boundariesPadding,
    popperOptions: Popper.props.popperOptions
  },
  methods: Popper.methods,
  data: Popper.data,
  beforeDestroy: Popper.beforeDestroy
};

const InputSizeMap = {
  medium: 36,
  small: 32,
  mini: 28
};

export default {
  name: 'SearchCascader',

  directives: { Clickoutside },

  mixins: [PopperMixin, Emitter, Locale, Migrating],

  inject: {
    elForm: {
      default: ''
    },
    elFormItem: {
      default: ''
    }
  },

  props: {
    value: {},
    options: Array,
    props: Object,
    size: String,
    placeholder: {
      type: String,
      default: () => t('el.cascader.placeholder')
    },
    disabled: Boolean,
    clearable: Boolean,
    filterable: Boolean,
    filterMethod: Function,
    separator: {
      type: String,
      default: ' / '
    },
    showAllLevels: {
      type: Boolean,
      default: true
    },
    collapseTags: Boolean,
    debounce: {
      type: Number,
      default: 300
    },
    beforeFilter: {
      type: Function,
      default: () => () => {}
    },
    popperClass: String
  },

  data() {
    return {
      dropDownVisible: false,
      checkedValue: this.value || null,
      inputHover: false,
      inputValue: null,
      presentText: null,
      presentTags: [],
      checkedNodes: [],
      filtering: false,
      inputInitialHeight: 0,
      pressDeleteCount: 0,
      sampleOptions: []
    };
  },

  computed: {
    realSize() {
      const _elFormItemSize = (this.elFormItem || {}).elFormItemSize
      return this.size || _elFormItemSize || (this.$ELEMENT || {}).size
    },
    tagSize() {
      return ['small', 'mini'].indexOf(this.realSize) > -1
        ? 'mini'
        : 'small'
    },
    isDisabled() {
      return this.disabled || (this.elForm || {}).disabled
    },
    config() {
      const config = this.props || {}
      const { $attrs } = this

      Object
        .keys(MigratingProps)
        .forEach(oldProp => {
          const { newProp, type } = MigratingProps[oldProp]
          let oldValue = $attrs[oldProp] || $attrs[kebabCase(oldProp)]
          if (isDef(oldProp) && !isDef(config[newProp])) {
            if (type === Boolean && oldValue === '') {
              oldValue = true
            }
            config[newProp] = oldValue
          }
        })

      return config
    },
    leafOnly() {
      return !this.config.checkStrictly
    },
    readonly() {
      return !this.filterable
    },
    clearBtnVisible() {
      if (!this.clearable || this.isDisabled || this.filtering || !this.inputHover) {
        return false
      }

      return !!this.inputValue
    },
    panel() {
      return this.$refs.panel
    }
  },

  watch: {
    checkedValue(val) {
      const { value, dropDownVisible } = this
      const { checkStrictly } = this.config

      if (!isEqual(val, value) || isUndefined(value)) {
        // hide dropdown when single mode
        if (!checkStrictly && dropDownVisible) {
          this.toggleDropDownVisible(false)
        }

        this.$emit('input', val)
        this.$emit('change', val)
        this.dispatch('ElFormItem', 'el.form.change', [val])
      }
    },
    options: {
      handler: function(value) {
        this.sampleOptions = JSON.parse(JSON.stringify(value))
      },
      deep: true
    },
    presentText(val) {
      this.inputValue = val
    },
    presentTags(val, oldVal) {
      if (val.length || oldVal.length) {
        this.$nextTick(this.updateStyle)
      }
    },
    filtering(val) {
      this.$nextTick(this.updatePopper)
    }
  },

  mounted() {
    const { input } = this.$refs
    if (input && input.$el) {
      this.inputInitialHeight = input.$el.offsetHeight || InputSizeMap[this.realSize] || 40
    }

    if (!isEmpty(this.value)) {
      this.computePresentContent()
    }

    this.filterHandler = debounce(this.debounce, () => {
      const { inputValue } = this

      if (!inputValue) {
        this.filtering = false
        this.sampleOptions = JSON.parse(JSON.stringify(this.options))
        return
      }

      const before = this.beforeFilter(inputValue)
      if (before && before.then) {
        before.then(this.getSuggestions)
      } else if (before !== false) {
        this.getSuggestions()
      } else {
        this.filtering = false
      }
    })

    addResizeListener(this.$el, this.updateStyle)
  },

  beforeDestroy() {
    removeResizeListener(this.$el, this.updateStyle)
  },

  methods: {
    getMigratingConfig() {
      return {
        props: {
          'expand-trigger': 'expand-trigger is removed, use `props.expandTrigger` instead.',
          'change-on-select': 'change-on-select is removed, use `props.checkStrictly` instead.',
          'hover-threshold': 'hover-threshold is removed, use `props.hoverThreshold` instead'
        },
        events: {
          'active-item-change': 'active-item-change is renamed to expand-change'
        }
      };
    },
    toggleDropDownVisible(visible) {
      if (this.isDisabled) return

      const { dropDownVisible } = this
      const { input } = this.$refs
      visible = isDef(visible) ? visible : !dropDownVisible
      if (visible !== dropDownVisible) {
        this.dropDownVisible = visible
        if (visible) {
          this.$nextTick(() => {
            this.updatePopper()
            this.panel.scrollIntoView()
          });
        }
        input.$refs.input.setAttribute('aria-expanded', visible)
        this.$emit('visible-change', visible)
      }
    },
    handleDropdownLeave() {
      this.filtering = false
    },
    handleKeyDown(event) {
      switch (event.keyCode) {
        case KeyCode.enter:
          this.toggleDropDownVisible()
          break
        case KeyCode.down:
          this.toggleDropDownVisible(true)
          this.focusFirstNode()
          event.preventDefault()
          break
        case KeyCode.esc:
        case KeyCode.tab:
          this.toggleDropDownVisible(false)
          break
      }
    },
    handleFocus(e) {
      this.$emit('focus', e)
    },
    handleBlur(e) {
      this.$emit('blur', e)
    },
    handleInput(val, event) {
      !this.dropDownVisible && this.toggleDropDownVisible(true)

      if (event && event.isComposing) return
      if (val) {
        this.filterHandler()
      } else {
        this.filtering = false
      }
    },
    handleClear() {
      this.presentText = ''
      this.sampleOptions = JSON.parse(JSON.stringify(this.options))
    },
    handleExpandChange(value) {
      this.$nextTick(this.updatePopper.bind(this))
      this.$emit('expand-change', value)
      this.$emit('active-item-change', value) // Deprecated
    },
    focusFirstNode() {
      this.$nextTick(() => {
        const { filtering } = this
        const { popper, suggestionPanel } = this.$refs
        let firstNode = null

        if (filtering && suggestionPanel) {
          firstNode = suggestionPanel.$el.querySelector('.el-cascader__suggestion-item')
        } else {
          const firstMenu = popper.querySelector('.el-cascader-menu')
          firstNode = firstMenu.querySelector('.el-cascader-node[tabindex="-1"]')
        }

        if (firstNode) {
          firstNode.focus()
          !filtering && firstNode.click()
        }
      });
    },
    computePresentTags() {
      const { isDisabled, leafOnly, showAllLevels, separator, collapseTags } = this
      const checkedNodes = this.getCheckedNodes(leafOnly)
      const tags = []

      const genTag = node => ({
        node,
        key: node.uid,
        text: node.getText(showAllLevels, separator),
        hitState: false,
        closable: !isDisabled && !node.isDisabled
      })

      if (checkedNodes.length) {
        const [first, ...rest] = checkedNodes
        const restCount = rest.length
        tags.push(genTag(first))

        if (restCount) {
          if (collapseTags) {
            tags.push({
              key: -1,
              text: `+ ${restCount}`,
              closable: false
            });
          } else {
            rest.forEach(node => tags.push(genTag(node)))
          }
        }
      }

      this.checkedNodes = checkedNodes
      this.presentTags = tags
    },
    filterProcedure(key, list) {
      return list.filter(el => {
        if (el[this.config.label] && el[this.config.label].indexOf(key) !== -1) {
          return true
        } else if (el.children) {
          const children = this.filterProcedure(key, el.children)
          if (children && children.length > 0) {
            el.children = children
            return true
          } else {
            return false
          }
        } else {
          return false
        }
      })
    },
    getSuggestions() {
      this.sampleOptions = this.filterProcedure(this.inputValue, JSON.parse(JSON.stringify(this.options))) || []
    },
    handleSuggestionKeyDown(event) {
      const { keyCode, target } = event
      switch (keyCode) {
        case KeyCode.enter:
          target.click()
          break
        case KeyCode.up:
          const prev = target.previousElementSibling
          prev && prev.focus()
          break
        case KeyCode.down:
          const next = target.nextElementSibling
          next && next.focus()
          break
        case KeyCode.esc:
        case KeyCode.tab:
          this.toggleDropDownVisible(false)
          break
      }
    },
    handleDelete() {
      const { inputValue, pressDeleteCount, presentTags } = this
      const lastIndex = presentTags.length - 1
      const lastTag = presentTags[lastIndex]
      this.pressDeleteCount = inputValue ? 0 : pressDeleteCount + 1

      if (!lastTag) return

      if (this.pressDeleteCount) {
        if (lastTag.hitState) {
          this.deleteTag(lastIndex)
        } else {
          lastTag.hitState = true
        }
      }
    },
    deleteTag(index) {
      const { checkedValue } = this
      const val = checkedValue[index]
      this.checkedValue = checkedValue.filter((n, i) => i !== index)
      this.$emit('remove-tag', val)
    },
    updateStyle() {
      const { $el, inputInitialHeight } = this
      if (this.$isServer || !$el) return

      const { suggestionPanel } = this.$refs
      const inputInner = $el.querySelector('.el-input__inner')

      if (!inputInner) return

      const tags = $el.querySelector('.el-cascader__tags')
      let suggestionPanelEl = null

      if (suggestionPanel && (suggestionPanelEl = suggestionPanel.$el)) {
        const suggestionList = suggestionPanelEl.querySelector('.el-cascader__suggestion-list')
        suggestionList.style.minWidth = inputInner.offsetWidth + 'px'
      }

      if (tags) {
        const { offsetHeight } = tags
        const height = Math.max(offsetHeight + 6, inputInitialHeight) + 'px'
        inputInner.style.height = height
        this.updatePopper()
      }
    },

    /**
     * public methods
     */
    getCheckedNodes(leafOnly) {
      return this.panel.getCheckedNodes(leafOnly)
    }
  }
};
</script>

<style scoped lang="scss">
</style>
