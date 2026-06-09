<template>
  <section class="preview-grid" :class="{ single: props.activePartId }" aria-label="3D 参数化预览">
    <article v-for="part in visibleParts" :key="props.activePartId ? 'active-preview' : part.id" class="preview-card">
      <header>
        <div class="preview-title">
          <span>{{ part.title }}</span>
          <el-tooltip v-if="props.activePartId" content="恢复默认视角" placement="top">
            <button class="reset-view-button" type="button" aria-label="恢复默认视角" @click="canvasRef?.resetDefaultView()">
              <el-icon><Refresh /></el-icon>
            </button>
          </el-tooltip>
        </div>
        <strong v-if="props.focus?.part === part.id">{{ props.focus.key }}</strong>
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

<script setup lang="ts">
import { Refresh } from '@element-plus/icons-vue'
import { ElIcon } from 'element-plus/es/components/icon/index'
import 'element-plus/es/components/icon/style/css'
import { ElTooltip } from 'element-plus/es/components/tooltip/index'
import 'element-plus/es/components/tooltip/style/css'
import { computed, ref, type ComponentPublicInstance } from 'vue'
import type { FieldGroup, FocusTarget, PartId } from '../../../../types.js'
import type { DerivedValues, PreviewOptions, SluicePreviewParameters } from '../types.js'
import SluicePreviewCanvas from './SluicePreviewCanvas.vue'

const props = defineProps<{
  params: SluicePreviewParameters        // 填写的全部参数
  derived: DerivedValues      // 实时计算的派生值
  focus: FocusTarget | null   // 表单聚焦的字段
  activePartId?: PartId       // 当前正在编辑的部件 ID
  groups: FieldGroup[]
  previewOptions: PreviewOptions
}>()

const canvasRef = ref<InstanceType<typeof SluicePreviewCanvas> | null>(null)

// 传入 activePartId 时只显示当前正在编辑的部件  不传时保留 6 部件总览能力
const visibleParts = computed(getVisibleParts)

/**
 * 保存单部件模式当前画布实例
 */
function setCanvasRef(instance: Element | ComponentPublicInstance | null): void {
  canvasRef.value = instance as InstanceType<typeof SluicePreviewCanvas> | null
}

/**
 * 根据当前编辑部件筛选预览窗格
 */
function getVisibleParts(): FieldGroup[] {
  return props.activePartId ? props.groups.filter((part): boolean => part.id === props.activePartId) : props.groups
}
</script>
