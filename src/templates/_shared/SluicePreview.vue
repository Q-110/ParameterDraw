<template>
  <section
    class="preview-grid"
    :class="{ single: props.activePartId }"
    aria-label="3D 参数化预览"
  >
    <article
      v-for="part in visibleParts"
      :key="props.activePartId ? 'active-preview' : part.id"
      class="preview-card"
    >
      <header>
        <span class="preview-title">{{ part.title }}</span>
        <button
          v-if="props.activePartId"
          class="reset-view-button"
          type="button"
          @click="canvasRef?.resetDefaultView()"
        >
          重置视角
        </button>
      </header>
      <SluicePreviewCanvas
        :ref="setCanvasRef"
        :part="part.id"
        :params="props.params"
        :derived="props.derived"
        :groups="props.groups"
        :preview-options="props.previewOptions"
        :focus="props.focus"
      />
    </article>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'
import SluicePreviewCanvas from './SluicePreviewCanvas.vue'

// params   填写的全部参数
// derived   实时计算的派生值
// focus   表单聚焦的字段
// activePartId   当前正在编辑的部件 ID
const props = defineProps([
  'params',
  'derived',
  'focus',
  'activePartId',
  'groups',
  'previewOptions',
])

const canvasRef = ref(null)

// 传入 activePartId 时只显示当前正在编辑的部件  不传时保留 6 部件总览能力
const visibleParts = computed(getVisibleParts)

/**
 * 保存单部件模式当前画布实例
 */
function setCanvasRef(instance) {
  canvasRef.value = instance
}

/**
 * 根据当前编辑部件筛选预览窗格
 */
function getVisibleParts() {
  return props.activePartId
    ? props.groups.filter((part) => part.id === props.activePartId)
    : props.groups
}
</script>
