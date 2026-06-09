<template>
  <section class="panel project-panel">
    <h2>项目属性</h2>
    <div class="compact-form">
      <label>
        <span>工程名称</span>
        <input :value="project.工程名称" @input="updateProject('工程名称', $event)" />
      </label>
      <label>
        <span>文档名称</span>
        <input :value="project.文档名称" @input="updateProject('文档名称', $event)" />
      </label>
      <label>
        <span>图纸编号规则</span>
        <input :value="project.图纸编号规则" @input="updateProject('图纸编号规则', $event)" />
      </label>
      <label>
        <span>设计阶段</span>
        <input :value="project.设计阶段" @input="updateProject('设计阶段', $event)" />
      </label>
      <label>
        <span>出图时间</span>
        <input
          :value="monthValue"
          type="month"
          @input="updateDrawingMonth"
          @keydown.prevent
          @paste.prevent
        />
      </label>
      <label class="path-field">
        <span>保存路径</span>
        <div class="path-picker">
          <input :value="output.savepath" readonly />
          <button
            type="button"
            :title="isElectron ? '选择出图保存文件夹' : '浏览器预览模式使用所选文件夹名作为相对路径'"
            @click="emit('selectOutputDirectory')"
          >
            选择
          </button>
        </div>
      </label>
    </div>
  </section>

</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { OutputInfo, ProjectInfo } from '../types'

// 项目设置展示项目属性和基础参数  所有修改都通过事件交给父组件
const props = defineProps<{
  project: ProjectInfo
  output: OutputInfo
  isElectron: boolean
}>()

const emit = defineEmits<{
  updateProject: [key: keyof ProjectInfo, value: string]
  selectOutputDirectory: []
}>()

// 原方案保存格式为 YYYY.MM  月份选择控件需要 YYYY-MM
const monthValue = computed(() => props.project.出图时间.replace('.', '-'))


// 项目属性是字符串字段  直接透传输入值
function updateProject(key: keyof ProjectInfo, event: Event) {
  emit('updateProject', key, (event.target as HTMLInputElement).value)
}


// 出图时间仍按后端现有 YYYY.MM 格式保存  避免影响 params.py 覆盖逻辑
function updateDrawingMonth(event: Event) {
  emit('updateProject', '出图时间', (event.target as HTMLInputElement).value.replace('-', '.'))
}

</script>
