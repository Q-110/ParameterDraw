<template>
  <div ref="container" class="preview-canvas"></div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { FieldGroup, FocusTarget, PartId } from '../../../../types.js'
import type { DerivedValues, PreviewOptions, SluicePreviewParameters } from '../types.js'
import {
  clearPreviewMeshes,
  createPreviewContext,
  disposePreviewContext,
  fitPartToView,
  renderPreview,
  type PreviewContext,
  updatePreviewHighlight,
} from './previewScene.js'
import { buildSluicePart } from './sluicePreviewGeometry.js'

const props = defineProps<{
  part: PartId
  params: SluicePreviewParameters
  derived: DerivedValues
  focus: FocusTarget | null
  groups: FieldGroup[]
  previewOptions: PreviewOptions
}>()

const container = ref<HTMLDivElement | null>(null)
let context: PreviewContext | null = null
const viewStates = new Map<PartId, {
  cameraPosition: [number, number, number]
  cameraZoom: number
  panOffset: [number, number]
}>()

defineExpose({ resetDefaultView })

/**
 * 为当前部件创建独立的 Three.js 场景并完成首次绘制
 */
onMounted((): void => {
  if (container.value) {
    context = createPreviewContext(container.value, props.part)
    rebuildPreview()
  }
})


/**
 * 组件卸载时释放几何体  渲染器  控制器和尺寸监听
 */
onBeforeUnmount((): void => {
  if (context) {
    disposePreviewContext(context)
    context = null
  }
})


/**
 * 任何参数变化  ->  重建几何体
 */
watch(
  (): SluicePreviewParameters => props.params,
  (): void => rebuildPreview(),
  { deep: true },
)


/**
 * 部件 ID 变化  ->  重建几何体 && 更新 ID
 */
watch(
  (): PartId => props.part,
  (part, previousPart): void => {
    if (context) {
      viewStates.set(previousPart, {
        cameraPosition: context.camera.position.toArray(),
        cameraZoom: context.camera.zoom,
        panOffset: context.panOffset.toArray(),
      })
      context.part = part
      rebuildPreview()
      const viewState = viewStates.get(part)
      if (viewState) {
        context.camera.position.fromArray(viewState.cameraPosition)
        context.camera.zoom = viewState.cameraZoom
        context.panOffset.fromArray(viewState.panOffset)
        context.camera.lookAt(context.modelCenter)
        context.camera.updateProjectionMatrix()
        context.controls.update()
        context.changeHandler()
      } else {
        resetDefaultView()
      }
    }
  },
)


/**
 * 部件 ID || 区域 变化  ->  更新高亮
 */
watch(
  (): [PartId | undefined, string | undefined, string | undefined] => [props.focus?.part, props.focus?.region, props.focus?.guideRegion],
  (): void => updateHighlight(),
)


/**
 * 参数 || 部件 变化  ->  重建当前几何
 */
function rebuildPreview(): void {
  if (!context) return

  // 清理旧几何
  clearPreviewMeshes(context)

  // 构建
  buildSluicePart(context, props.params, props.derived, {
    groups: props.groups,
    showTrafficBridge: props.previewOptions.showTrafficBridge,
  })

  // 部件按真实尺寸生成  ->  整体缩放到预览窗口
  fitPartToView(context)

  // 更新高亮
  updatePreviewHighlight(context, props.focus)

  // 渲染场景
  renderPreview(context)
}

/**
 * 焦点变化  ->  更新高亮材质 && 保留当前几何和用户视角
 */
function updateHighlight(): void {
  if (!context) {
    return
  }

  // 更新高亮
  updatePreviewHighlight(context, props.focus)

  // 渲染场景
  renderPreview(context)
}

/**
 * 恢复当前部件默认视角
 */
function resetDefaultView(): void {
  if (!context) {
    return
  }

  context.camera.position.set(6, 5, 7)
  context.camera.zoom = 1
  context.panOffset.set(0, 0)
  context.controls.target.copy(context.modelCenter)
  context.camera.lookAt(context.modelCenter)
  context.camera.updateProjectionMatrix()
  context.controls.update()
  context.changeHandler()
}
</script>
