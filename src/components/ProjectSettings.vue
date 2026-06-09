<template>
  <section v-if="section !== 'basic'" class="panel project-panel">
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

  <section v-if="section !== 'project'" class="panel basic-panel">
    <h2>基础设置</h2>
    <div class="compact-form two-columns">
      <label>
        <span>底板顶部标高</span>
        <div class="unit-input">
          <input :value="params.底板顶部标高" type="number" step="0.01" @input="updateParam('底板顶部标高', $event)" />
          <em>m</em>
        </div>
      </label>
      <label>
        <span>垫层超出底面距离</span>
        <div class="unit-input">
          <input :value="params.垫层超出底面距离" type="number" @input="updateParam('垫层超出底面距离', $event)" />
          <em>cm</em>
        </div>
      </label>
      <label>
        <span>垫层厚度</span>
        <div class="unit-input">
          <input :value="params.垫层厚度" type="number" @input="updateParam('垫层厚度', $event)" />
          <em>cm</em>
        </div>
      </label>
      <label>
        <span>止水偏移表面</span>
        <div class="unit-input">
          <input :value="params.止水偏移表面" type="number" @input="updateParam('止水偏移表面', $event)" />
          <em>cm</em>
        </div>
      </label>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { OutputInfo, ParamKey, ProjectInfo, TemplateParameters } from '../types'

// 项目设置展示项目属性和基础参数  所有修改都通过事件交给父组件
const props = defineProps<{
  section?: 'project' | 'basic'
  project: ProjectInfo
  output: OutputInfo
  params: TemplateParameters
  isElectron: boolean
}>()

const emit = defineEmits<{
  updateProject: [key: keyof ProjectInfo, value: string]
  updateParam: [key: ParamKey, value: number]
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


// 数值字段
function updateParam(key: ParamKey, event: Event) {
  emit('updateParam', key, Number((event.target as HTMLInputElement).value))
}
</script>
