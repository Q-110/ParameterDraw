<template>
  <div ref="container" class="preview-canvas overall-preview-canvas glb-preview-canvas">
    <div
      v-if="loadState !== 'ready'"
      :class="['preview-status', { failed: loadState === 'failed' }]"
    >
      {{ loadState === 'failed' ? '模型加载失败' : '正在加载模型' }}
    </div>
  </div>
</template>

<script setup>
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import {
  createPreviewContext,
  disposePreviewContext,
  renderPreview,
} from './scene'

const props = defineProps({
  modelUrl: String,
  interactive: {
    type: Boolean,
    default: true,
  },
})

const container = ref(null)
const loadState = ref('loading')
const loader = new GLTFLoader()
let context = null
let loadVersion = 0

/**
 * 创建首页 GLB 预览场景
 */
onMounted(() => {
  if (container.value) {
    context = createPreviewContext(container.value, 'overall', {
      interactive: props.interactive,
    })
    loadHomeModel()
  }
})

/**
 * 释放首页模型和 Three.js 场景资源
 */
onBeforeUnmount(() => {
  loadVersion += 1
  disposeHomeModel()
  if (context) {
    disposePreviewContext(context)
    context = null
  }
})

/**
 * 模板切换后加载对应的 GLB 模型
 */
watch(
  () => props.modelUrl,
  () => loadHomeModel(),
)

/**
 * 加载首页 GLB 模型并适配到当前视口
 */
function loadHomeModel() {
  if (!context) {
    return
  }

  loadVersion += 1
  const currentLoadVersion = loadVersion
  loadState.value = 'loading'
  disposeHomeModel()

  loader.load(
    props.modelUrl,
    (gltf) => {
      if (currentLoadVersion !== loadVersion) {
        gltf.scene.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.geometry.dispose()
            const materials = Array.isArray(child.material) ? child.material : [child.material]
            materials.forEach((material) => material.dispose())
          }
        })
        return
      }

      context.root.add(gltf.scene)
      context.meshes = [gltf.scene]
      fitHomeModelToView()
      context.controls.update()
      renderPreview(context)
      loadState.value = 'ready'
    },
    undefined,
    () => {
      if (currentLoadVersion === loadVersion) {
        loadState.value = 'failed'
        renderPreview(context)
      }
    },
  )
}

/**
 * 适配首页 GLB 模型视图
 * 使用侧前方观察角度   按首页宽屏区域放大模型
 */
function fitHomeModelToView() {
  context.camera.up.set(0, 0, 1)
  context.panOffset.set(0, 0)

  context.root.updateWorldMatrix(true, true)
  const box = new THREE.Box3().setFromObject(context.root)
  const size = box.getSize(new THREE.Vector3())
  const center = box.getCenter(new THREE.Vector3())
  const maxSize = Math.max(size.x, size.y, size.z)
  if (maxSize <= 0) {
    return
  }

  const scale = 10 / maxSize
  context.root.scale.setScalar(scale)
  context.root.position.set(
    -center.x * scale,
    -center.y * scale,
    -center.z * scale,
  )
  context.modelCenter.set(0, 0, 0)
  context.camera.position.set(16, -3, 16)
  context.camera.lookAt(context.modelCenter)
  context.controls.target.copy(context.modelCenter)
  context.camera.zoom = props.interactive ? 2.35 : 1.8
  context.camera.updateProjectionMatrix()
}

/**
 * 清理当前首页 GLB 模型
 */
function disposeHomeModel() {
  if (!context || context.meshes.length === 0) {
    return
  }

  context.meshes.forEach((object) => {
    object.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose()
        const materials = Array.isArray(child.material) ? child.material : [child.material]
        materials.forEach((material) => {
          Object.keys(material).forEach((key) => {
            if (material[key] instanceof THREE.Texture) {
              material[key].dispose()
            }
          })
          material.dispose()
        })
      }
    })
    context.root.remove(object)
  })
  context.meshes = []
  context.dimensionMaterials.clear()
  context.root.position.set(0, 0, 0)
  context.root.scale.set(1, 1, 1)
}
</script>
