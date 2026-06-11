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
    <div
      v-if="runState !== 'idle'"
      :class="['drawing-progress', runState]"
    >
      <div class="drawing-progress-text">
        <span>{{ drawingProgress.stage }}</span>
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
  </section>
</template>

<script setup>
defineProps([
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
