<template>
  <section class="panel scheme-panel app-toolbar">
    <div class="toolbar-brand">
      <img :src="appIconUrl" alt="" />
      <div>
        <strong>ParameterDraw</strong>
        <span>水闸参数化出图</span>
      </div>
    </div>

    <div class="toolbar-fields">
      <label class="toolbar-field scheme-field">
        <input
          :value="schemeName"
          aria-label="方案名称"
          @input="updateSchemeName"
        />
      </label>
      <label class="toolbar-field template-field">
        <div class="template-select">
          <select
            :value="templateId"
            :disabled="runState === 'running'"
            aria-label="模板"
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
    </div>

    <div :class="['toolbar-status', runState]">
      <div class="drawing-progress-text">
        <span>{{ statusText }}</span>
        <strong>{{ drawingProgress.percent }}%</strong>
      </div>
      <div
        class="drawing-progress-track"
        role="progressbar"
        aria-label="出图进度"
        aria-valuemin="0"
        aria-valuemax="100"
        :aria-valuenow="drawingProgress.percent"
      >
        <div
          class="drawing-progress-fill"
          :style="{ width: `${drawingProgress.percent}%` }"
        />
      </div>
    </div>

    <div class="toolbar-actions">
      <button type="button" @click="emit('new')">新建</button>
      <button type="button" @click="emit('open')">打开</button>
      <button type="button" @click="emit('save')">保存</button>
      <button type="button" @click="emit('saveAs')">另存为</button>
      <button
        type="button"
        class="primary-action"
        :disabled="runState === 'running' || validationErrorCount > 0"
        @click="emit('run')"
      >
        {{ runState === 'running' ? '正在执行' : '开始执行' }}
      </button>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import appIconUrl from '../../build/icon.ico?url'

const props = defineProps([
  'schemeName',
  'runState',
  'drawingProgress',
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
])

const statusText = computed(() =>
  props.runState === 'idle' ? '待执行' : props.drawingProgress.stage,
)

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
</script>
