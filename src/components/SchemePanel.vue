<template>
  <section class="panel scheme-panel">
    <div class="title-row">
      <div>
        <p>方案</p>
        <input
          :value="schemeName"
          class="scheme-name"
          aria-label="方案名称"
          @input="updateSchemeName"
        />
      </div>
      <span :class="['run-state', runState]">
        {{ runStateText }}
      </span>
    </div>
    <label class="template-field">
      <span>模板</span>
      <div class="template-select">
        <select
          :value="templateId"
          :disabled="runState === 'running'"
          @change="updateTemplate"
        >
          <option
            v-for="template in templates"
            :key="template.id"
            :value="template.id"
          >
            {{ template.name }}
          </option>
        </select>
      </div>
    </label>
    <div class="button-grid">
      <button type="button" @click="emit('new')">新建</button>
      <button type="button" @click="emit('open')">打开</button>
      <button type="button" @click="emit('save')">保存</button>
      <button type="button" @click="emit('saveAs')">另存</button>
    </div>
    <button
      type="button"
      class="primary-action"
      :disabled="runState === 'running' || validationErrorCount > 0"
      @click="emit('run')"
    >
      {{ runState === 'running' ? '正在出图' : '执行出图' }}
    </button>
    <input
      ref="fileInput"
      type="file"
      accept="application/json"
      hidden
      @change="emit('browserFileChange', $event)"
    />
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps([
  'schemeName',
  'runState',
  'validationErrorCount',
  'templateId',
  'templates',
])

const emit = defineEmits([
  'update:schemeName',
  'update:templateId',
  'new',
  'open',
  'save',
  'saveAs',
  'run',
  'browserFileChange',
])

const fileInput = ref(null)

// 运行状态
const runStateText = computed(() => {
  if (props.runState === 'running') {
    return '出图中'
  }
  if (props.runState === 'success') {
    return '成功'
  }
  if (props.runState === 'failed') {
    return '失败'
  }
  return '待出图'
})

// 方案名称
/**
 * 上报方案名称变化
 */
function updateSchemeName(event) {
  emit('update:schemeName', event.target.value)
}

/**
 * 切换当前模板
 */
function updateTemplate(event) {
  emit('update:templateId', event.target.value)
}

// 打开方案
/**
 * 触发浏览器文件选择框
 */
function openBrowserFilePicker() {
  fileInput.value?.click()
}

defineExpose({
  openBrowserFilePicker,
})
</script>
