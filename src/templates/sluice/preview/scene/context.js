import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { clearPreviewMeshes } from './objects'
import {
  applyCameraViewOffset,
  constrainPartToView,
  resizeContext,
} from './viewport'

/**
 * 为单个部件创建完整的 Three.js 场景
 * @param container   DOM 容器
 * @param part        部件 ID
 */
export function createPreviewContext(container, part) {
  // 创建场景 Scene
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0xf8faf9)
  // root 只承载当前部件的几何体  后续通过 root 统一缩放和居中
  const root = new THREE.Group()
  scene.add(root)
  // 创建正交相机   所有体块等大显示
  // 预览保持 Three.js 默认 Y-up   Z 正方向作为上游
  const camera = new THREE.OrthographicCamera(-5, 5, 5, -5, 0.1, 100)
  camera.position.set(6, 5, 7) // 从右侧上游上方俯视
  camera.lookAt(0, 0, 0) // 看向原点
  // 创建渲染器
  const renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)) // 限制像素比上限为 2
  container.appendChild(renderer.domElement)
  // 每个预览区域独立控制视角：左键旋转、滚轮缩放、右键平移
  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enablePan = false
  controls.mouseButtons = {
    LEFT: THREE.MOUSE.ROTATE,
    MIDDLE: THREE.MOUSE.DOLLY,
    RIGHT: null,
  }
  const modelCenter = new THREE.Vector3(0, 0, 0)
  const panOffset = new THREE.Vector2(0, 0)
  const viewportSize = new THREE.Vector2(1, 1)
  let context
  controls.target.copy(modelCenter) // 锁定视角中心
  const changeHandler = () => {
    controls.target.copy(context.modelCenter)
    applyCameraViewOffset(context)
    constrainPartToView(context) // 限制移动范围
    renderer.render(scene, camera)
  }
  let panPointerId = null
  let lastPanX = 0
  let lastPanY = 0
  const panPointerDownHandler = (event) => {
    if (event.button !== 0 && event.button !== 2) {
      return
    }
    event.preventDefault()
    if (event.button === 0) {
      return
    }
    panPointerId = event.pointerId
    lastPanX = event.clientX
    lastPanY = event.clientY
    renderer.domElement.setPointerCapture(event.pointerId)
  }
  const panPointerMoveHandler = (event) => {
    if (panPointerId !== event.pointerId) {
      return
    }
    event.preventDefault()
    const deltaX = event.clientX - lastPanX
    const deltaY = event.clientY - lastPanY
    lastPanX = event.clientX
    lastPanY = event.clientY
    context.panOffset.x += (deltaX / context.viewportSize.x) * 2
    context.panOffset.y -= (deltaY / context.viewportSize.y) * 2
    applyCameraViewOffset(context)
    constrainPartToView(context)
    renderer.render(scene, camera)
  }
  const panPointerUpHandler = (event) => {
    if (panPointerId !== event.pointerId) {
      return
    }
    panPointerId = null
    if (renderer.domElement.hasPointerCapture(event.pointerId)) {
      renderer.domElement.releasePointerCapture(event.pointerId)
    }
  }
  const contextMenuHandler = (event) => {
    event.preventDefault()
  }
  // 使用环境光和方向光组合
  scene.add(new THREE.AmbientLight(0xffffff, 0.78)) // 环境光
  const light = new THREE.DirectionalLight(0xffffff, 1.1) // 方向光
  light.position.set(5, 8, 6)
  scene.add(light)
  // 自适应
  const observer = new ResizeObserver(() => resizeContext(container, context))
  context = {
    part,
    scene,
    camera,
    renderer,
    controls,
    root,
    meshes: [],
    dimensionMaterials: new Set(),
    modelCenter,
    panOffset,
    viewportSize,
    observer,
    changeHandler,
    panPointerDownHandler,
    panPointerMoveHandler,
    panPointerUpHandler,
    contextMenuHandler,
  }
  controls.addEventListener('change', changeHandler)
  controls.update()
  renderer.domElement.addEventListener('pointerdown', panPointerDownHandler)
  renderer.domElement.addEventListener('pointermove', panPointerMoveHandler)
  renderer.domElement.addEventListener('pointerup', panPointerUpHandler)
  renderer.domElement.addEventListener('pointercancel', panPointerUpHandler)
  renderer.domElement.addEventListener('contextmenu', contextMenuHandler)
  observer.observe(container)
  resizeContext(container, context) // 立即执行一次
  return context
}

/**
 * 渲染当前预览场景
 * @param context
 */
export function renderPreview(context) {
  context.renderer.render(context.scene, context.camera)
}

/**
 * 销毁预览上下文和占用的 Three.js 资源
 * @param context
 */
export function disposePreviewContext(context) {
  clearPreviewMeshes(context)
  context.observer.disconnect()
  context.controls.removeEventListener('change', context.changeHandler)
  context.renderer.domElement.removeEventListener(
    'pointerdown',
    context.panPointerDownHandler,
  )
  context.renderer.domElement.removeEventListener(
    'pointermove',
    context.panPointerMoveHandler,
  )
  context.renderer.domElement.removeEventListener(
    'pointerup',
    context.panPointerUpHandler,
  )
  context.renderer.domElement.removeEventListener(
    'pointercancel',
    context.panPointerUpHandler,
  )
  context.renderer.domElement.removeEventListener(
    'contextmenu',
    context.contextMenuHandler,
  )
  context.controls.dispose()
  context.renderer.dispose()
  context.renderer.domElement.remove()
}
