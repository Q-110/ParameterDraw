<template>
  <section class="panel project-panel">
    <h2>图纸属性</h2>
    <div class="compact-form">
      <label>
        <span>工程名称</span>
        <input
          :value="project.工程名称"
          @input="updateProject('工程名称', $event)"
        />
      </label>
      <label>
        <span>文档名称</span>
        <input
          :value="project.文档名称"
          @input="updateProject('文档名称', $event)"
        />
      </label>
      <label>
        <span>图纸编号规则</span>
        <input
          :value="project.图纸编号规则"
          @input="updateProject('图纸编号规则', $event)"
        />
      </label>
      <label>
        <span>设计专业</span>
        <input
          :value="project.设计专业"
          @input="updateProject('设计专业', $event)"
        />
      </label>
      <label>
        <span>设计阶段</span>
        <input
          :value="project.设计阶段"
          @input="updateProject('设计阶段', $event)"
        />
      </label>
      <label>
        <span>主材类型</span>
        <input
          :value="project.主材类型"
          @input="updateProject('主材类型', $event)"
        />
      </label>
      <label>
        <span>垫层类型1</span>
        <input
          :value="project.垫层类型1"
          @input="updateProject('垫层类型1', $event)"
        />
      </label>
      <label>
        <span>垫层类型2</span>
        <input
          :value="project.垫层类型2"
          @input="updateProject('垫层类型2', $event)"
        />
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
            title="选择出图保存文件夹"
            @click="emit('selectOutputDirectory')"
          >
            选择
          </button>
        </div>
      </label>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'

// 项目设置展示项目属性和基础参数  所有修改都通过事件交给父组件
const props = defineProps(['project', 'output'])

const emit = defineEmits(['updateProject', 'selectOutputDirectory'])

// 原方案保存格式为 YYYY.MM  月份选择控件需要 YYYY-MM
const monthValue = computed(() => props.project.出图时间.replace('.', '-'))

// 项目属性是字符串字段  直接透传输入值
/**
 * 上报项目属性变化
 */
function updateProject(key, event) {
  emit('updateProject', key, event.target.value)
}

// 出图时间仍按后端现有 YYYY.MM 格式保存  避免影响 params.py 覆盖逻辑
/**
 * 将月份控件值转换为后端使用的年月格式
 */
function updateDrawingMonth(event) {
  emit('updateProject', '出图时间', event.target.value.replace('-', '.'))
}
</script>
