import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { LineMaterial } from 'three/addons/lines/LineMaterial.js'
import { LineSegments2 } from 'three/addons/lines/LineSegments2.js'
import { LineSegmentsGeometry } from 'three/addons/lines/LineSegmentsGeometry.js'
import type { FocusTarget, PartId } from '../../types.js'

export interface PreviewContext {
  part: PartId
  scene: THREE.Scene
  camera: THREE.OrthographicCamera
  renderer: THREE.WebGLRenderer
  controls: OrbitControls
  // 每个部件的所有 mesh 都挂在 root 下  便于整体居中和等比缩放
  root: THREE.Group
  meshes: THREE.Object3D[]
  dimensionMaterials: Set<LineMaterial>
  modelCenter: THREE.Vector3
  panOffset: THREE.Vector2
  viewportSize: THREE.Vector2
  observer: ResizeObserver
  changeHandler: () => void
  panPointerDownHandler: (event: PointerEvent) => void
  panPointerMoveHandler: (event: PointerEvent) => void
  panPointerUpHandler: (event: PointerEvent) => void
  contextMenuHandler: (event: MouseEvent) => void
}

const partColors: Record<PartId, number> = {
  gate: 0x8aa3a0,
  stilling: 0x739072,
  upstreamConnection: 0x9b8c73,
  upstreamTransition: 0x6e8fa4,
  downstreamConnection: 0xa06f65,
  downstreamTransition: 0x7a87a8,
}

/**
 * 为单个部件创建完整的 Three.js 场景
 * @param container   DOM 容器
 * @param part        部件 ID
 */
export function createPreviewContext(container: HTMLDivElement, part: PartId): PreviewContext {
  // 创建场景 Scene
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0xf8faf9)
  // root 只承载当前部件的几何体  后续通过 root 统一缩放和居中
  const root = new THREE.Group()
  scene.add(root)

  // 创建正交相机   所有体块等大显示
  // 预览保持 Three.js 默认 Y-up   Z 正方向作为上游
  const camera = new THREE.OrthographicCamera(-5, 5, 5, -5, 0.1, 100)
  camera.position.set(6, 5, 7)    // 从右侧上游上方俯视
  camera.lookAt(0, 0, 0)          // 看向原点

  // 创建渲染器
  const renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))   // 限制像素比上限为 2
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
  let context: PreviewContext
  controls.target.copy(modelCenter)            // 锁定视角中心
  const changeHandler = (): void => {
    controls.target.copy(context.modelCenter)
    applyCameraViewOffset(context)
    constrainPartToView(context)     // 限制移动范围
    renderer.render(scene, camera)
  }

  let panPointerId: number | null = null
  let lastPanX = 0
  let lastPanY = 0
  const panPointerDownHandler = (event: PointerEvent): void => {
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
  const panPointerMoveHandler = (event: PointerEvent): void => {
    if (panPointerId !== event.pointerId) {
      return
    }
    event.preventDefault()
    const deltaX = event.clientX - lastPanX
    const deltaY = event.clientY - lastPanY
    lastPanX = event.clientX
    lastPanY = event.clientY
    context.panOffset.x += deltaX / context.viewportSize.x * 2
    context.panOffset.y -= deltaY / context.viewportSize.y * 2
    applyCameraViewOffset(context)
    constrainPartToView(context)
    renderer.render(scene, camera)
  }
  const panPointerUpHandler = (event: PointerEvent): void => {
    if (panPointerId !== event.pointerId) {
      return
    }
    panPointerId = null
    if (renderer.domElement.hasPointerCapture(event.pointerId)) {
      renderer.domElement.releasePointerCapture(event.pointerId)
    }
  }
  const contextMenuHandler = (event: MouseEvent): void => {
    event.preventDefault()
  }

  // 使用环境光和方向光组合
  scene.add(new THREE.AmbientLight(0xffffff, 0.78))   // 环境光
  const light = new THREE.DirectionalLight(0xffffff, 1.1)   // 方向光
  light.position.set(5, 8, 6)
  scene.add(light)

  // 自适应
  const observer = new ResizeObserver((): void => resizeContext(container, context))
  context = {
    part,
    scene,
    camera,
    renderer,
    controls,
    root,
    meshes: [],
    dimensionMaterials: new Set<LineMaterial>(),
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
  resizeContext(container, context)   // 立即执行一次

  return context
}

/**
 * 容器尺寸变化时自适应调整相机和渲染器
 * @param container
 * @param context
 */
function resizeContext(
  container: HTMLDivElement,
  context: PreviewContext,
): void {
  // 1. 取容器的实际宽高
  const width = Math.max(container.clientWidth, 280)
  const height = Math.max(container.clientHeight, 180)
  const aspect = width / height
  context.viewportSize.set(width, height)

  // 2. 重设正交相机左右边界   固定垂直边界（top/bottom = ±5.2） 水平范围根据容器宽高比等比缩放
  context.camera.left = -6.5 * aspect
  context.camera.right = 6.5 * aspect
  context.camera.top = 5.2
  context.camera.bottom = -5.2

  // 3. 告诉 Three.js 相机参数已变更   正交相机的投影矩阵基于 left/right/top/bottom/near/far 计算  修改这些值后必须调用 updateProjectionMatrix()
  applyCameraViewOffset(context)
  constrainPartToView(context)

  // 4. 重置渲染尺寸    第三个参数 false 表示不修改 css 尺寸   只改 canvas 缓冲大小
  context.renderer.setSize(width, height, false)
  context.dimensionMaterials.forEach((material): void => {
    material.resolution.set(width, height)
  })

  // 5. 立即渲染一帧 防止 ResizeObserver 回调后出现一帧空白
  context.renderer.render(context.scene, context.camera)
}

/**
 * 创建单个体块的 Mesh — 边线   添加到场景并注册到 meshes 数组
 * @param context   目标场景上下文
 * @param region    区域标签（用于高亮匹配）
 * @param width     X 轴尺寸
 * @param height    Y 轴尺寸
 * @param depth     Z 轴尺寸
 * @param x         X 轴位置
 * @param y         Y 轴位置
 * @param z         Z 轴位置
 * @param rotateZ   绕 Z 轴旋转弧度（默认不转）
 * @param rotateX   绕 X 轴旋转弧度（默认不转）
 * @param isGuide   是否为辅助体（默认隐藏  聚焦时显示）
 */
export function addBox(
  context: PreviewContext,
  region: string,
  width: number,
  height: number,
  depth: number,
  x: number,
  y: number,
  z: number,
  rotateZ = 0,
  rotateX = 0,
  isGuide = false,
): void {
  // 创建几何体
  const geometry = new THREE.BoxGeometry(Math.max(width, 0.01), Math.max(height, 0.01), Math.max(depth, 0.01))

  // 创建 Mesh
  const mesh = new THREE.Mesh(geometry, createMeshMaterial(context.part, false, isGuide))
  mesh.position.set(x, y, z)   // 设置位置
  mesh.rotation.x = rotateX    // 设置纵向坡度
  mesh.rotation.z = rotateZ    // 设置旋转
  mesh.userData.previewRegion = region
  mesh.userData.previewGuide = isGuide
  mesh.visible = !isGuide

  // 创建边线
  const edges = new THREE.LineSegments(
    // 提取盒子 12 个棱
    new THREE.EdgesGeometry(geometry),
    // 边线材质
    createEdgeMaterial(false, isGuide),
  )
  // 边线跟随 mesh 的位置和旋转
  edges.position.copy(mesh.position)
  edges.rotation.copy(mesh.rotation)
  edges.userData.previewRegion = region
  edges.userData.previewGuide = isGuide
  edges.visible = !isGuide

  // 注册
  context.root.add(mesh, edges)   // 加入部件根节点
  context.meshes.push(mesh, edges) // 存入数组

  if (!isGuide) {
    const guideGeometry = geometry.clone()
    const guideMesh = new THREE.Mesh(guideGeometry, createMeshMaterial(context.part, false, true))
    guideMesh.position.copy(mesh.position)
    guideMesh.rotation.copy(mesh.rotation)
    guideMesh.userData.previewRegion = region
    guideMesh.userData.previewGuide = true
    guideMesh.visible = false

    const guideEdges = new THREE.LineSegments(new THREE.EdgesGeometry(guideGeometry), createEdgeMaterial(false, true))
    guideEdges.position.copy(mesh.position)
    guideEdges.rotation.copy(mesh.rotation)
    guideEdges.userData.previewRegion = region
    guideEdges.userData.previewGuide = true
    guideEdges.visible = false

    // 普通构件的隐藏副本用于聚焦提示   避免直接改变实体构件材质
    context.root.add(guideMesh, guideEdges)
    context.meshes.push(guideMesh, guideEdges)
  }
}

/**
 * 添加自定义几何体  并同步创建边线
 * 适用于 BoxGeometry 无法表达的梯形底板和渐变坡面
 * @param context     目标场景上下文
 * @param region      区域标签（用于高亮匹配）
 * @param geometry    已经构建好的 BufferGeometry
 * @param doubleSide  是否双面渲染  开放坡面需要双面避免视角切换时不可见
 * @param isGuide     是否为辅助体（默认隐藏  聚焦时显示）
 */
export function addGeometry(context: PreviewContext, region: string, geometry: THREE.BufferGeometry, doubleSide = false, isGuide = false): void {
  const material = createMeshMaterial(context.part, false, isGuide)
  material.side = doubleSide ? THREE.DoubleSide : THREE.FrontSide
  const mesh = new THREE.Mesh(geometry, material)
  mesh.userData.previewRegion = region
  mesh.userData.previewGuide = isGuide
  mesh.visible = !isGuide
  const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geometry), createEdgeMaterial(false, isGuide))
  edges.userData.previewRegion = region
  edges.userData.previewGuide = isGuide
  edges.visible = !isGuide
  context.root.add(mesh, edges)
  context.meshes.push(mesh, edges)

  if (!isGuide) {
    const guideGeometry = geometry.clone()
    const guideMaterial = createMeshMaterial(context.part, false, true)
    guideMaterial.side = material.side
    const guideMesh = new THREE.Mesh(guideGeometry, guideMaterial)
    guideMesh.userData.previewRegion = region
    guideMesh.userData.previewGuide = true
    guideMesh.visible = false
    const guideEdges = new THREE.LineSegments(new THREE.EdgesGeometry(guideGeometry), createEdgeMaterial(false, true))
    guideEdges.userData.previewRegion = region
    guideEdges.userData.previewGuide = true
    guideEdges.visible = false

    // 自定义几何也保留隐藏辅助体   聚焦时显示范围   实体本身保持原材质
    context.root.add(guideMesh, guideEdges)
    context.meshes.push(guideMesh, guideEdges)
  }
}

/**
 * 添加尺寸线辅助对象
 * 尺寸线独立匹配 guideRegion
 * 聚焦时配合原有辅助体表达具体尺寸方向
 * @param context   目标场景上下文
 * @param region    尺寸线区域标签
 * @param start     尺寸起点
 * @param end       尺寸终点
 * @param tickAxis  端线方向
 * @param tickSize  端线长度
 * @param extensionStart  起点辅助线实体端
 * @param extensionEnd    终点辅助线实体端
 */
export function addDimensionLine(
  context: PreviewContext,
  region: string,
  start: THREE.Vector3,
  end: THREE.Vector3,
  tickAxis: THREE.Vector3,
  tickSize: number,
  extensionStart?: THREE.Vector3,
  extensionEnd?: THREE.Vector3,
): void {
  const tick = tickAxis.clone().normalize().multiplyScalar(tickSize / 2)
  const vertices = new Float32Array([
    start.x, start.y, start.z,
    end.x, end.y, end.z,
    start.x - tick.x, start.y - tick.y, start.z - tick.z,
    start.x + tick.x, start.y + tick.y, start.z + tick.z,
    end.x - tick.x, end.y - tick.y, end.z - tick.z,
    end.x + tick.x, end.y + tick.y, end.z + tick.z,
  ])
  const geometry = new LineSegmentsGeometry()
  geometry.setPositions(vertices)
  const material = createDimensionMaterial(context)
  const line = new LineSegments2(geometry, material)
  line.computeLineDistances()
  line.userData.previewRegion = region
  line.userData.previewGuide = true
  line.userData.previewDimension = true
  line.visible = false
  line.renderOrder = 10
  context.root.add(line)
  context.meshes.push(line)
  context.dimensionMaterials.add(material)

  if (extensionStart && extensionEnd) {
    const extensionGeometry = new LineSegmentsGeometry()
    extensionGeometry.setPositions(new Float32Array([
      extensionStart.x, extensionStart.y, extensionStart.z,
      start.x, start.y, start.z,
      extensionEnd.x, extensionEnd.y, extensionEnd.z,
      end.x, end.y, end.z,
    ]))
    const extensionMaterial = new LineMaterial({
      color: 0x2f5d62,
      linewidth: 1.5,
      dashed: true,
      dashSize: 0.12,
      gapSize: 0.08,
      transparent: true,
      opacity: 0.8,
      depthTest: false,
      depthWrite: false,
      alphaToCoverage: true,
    })
    extensionMaterial.resolution.copy(context.viewportSize)
    const extensionLine = new LineSegments2(extensionGeometry, extensionMaterial)
    extensionLine.computeLineDistances()
    extensionLine.userData.previewRegion = region
    extensionLine.userData.previewGuide = true
    extensionLine.userData.previewDimension = true
    extensionLine.visible = false
    extensionLine.renderOrder = 9
    context.root.add(extensionLine)
    context.meshes.push(extensionLine)
    context.dimensionMaterials.add(extensionMaterial)
  }
}

/**
 * 清理当前部件旧几何
 * BoxGeometry 创建后不能直接改尺寸  参数变化时必须释放旧资源后重新创建
 * @param context
 */
export function clearPreviewMeshes(context: PreviewContext): void {
  context.meshes.forEach((mesh): void => {
    // 移除前先释放 Three.js 资源  避免参数连续修改时堆积旧 geometry/material
    disposeObject(mesh)
    context.root.remove(mesh)   // 从部件根节点中移除
  })
  context.meshes = []   // 清空 mesh 引用数组
  context.dimensionMaterials.clear()
  // 清空后恢复 root 的原始变换  下一次重建再重新计算包围盒
  context.root.position.set(0, 0, 0)
  context.root.scale.set(1, 1, 1)
}

/**
 * 将当前部件整体缩放并移动到预览视口中心
 * 几何体先按真实 cm 比例创建  再通过 root 统一缩放  保证部件内部比例不被破坏
 * @param context
 */
export function fitPartToView(context: PreviewContext): void {
  if (!context.meshes.length) {
    return
  }
  // 先基于非辅助对象计算包围盒  得到部件真实显示范围
  context.root.updateWorldMatrix(true, true)
  const box = new THREE.Box3()
  context.meshes.forEach((object): void => {
    if (object.userData.previewGuide === true) {
      return
    }
    box.expandByObject(object)
  })
  const size = box.getSize(new THREE.Vector3())
  const center = box.getCenter(new THREE.Vector3())
  const maxSize = Math.max(size.x, size.y, size.z)
  if (maxSize <= 0) {
    return
  }
  // targetSize 对应当前正交相机视口内的可读范围  所有轴使用同一个缩放比例
  const targetSize = 10
  const scale = targetSize / maxSize
  context.root.scale.setScalar(scale)
  context.root.position.set(-center.x * scale, -center.y * scale, -center.z * scale)
  context.modelCenter.set(0, 0, 0)
  context.controls.target.copy(context.modelCenter)
  applyCameraViewOffset(context)
  constrainPartToView(context)
}

/**
 * 更新当前部件高亮材质
 * 焦点变化只修改材质参数  避免重建几何和重置用户视角
 * @param context
 * @param focus
 */
export function updatePreviewHighlight(context: PreviewContext, focus: FocusTarget | null): void {
  context.meshes.forEach((object): void => {
    const region = object.userData.previewRegion as string
    const isGuide = object.userData.previewGuide === true
    const isDimension = object.userData.previewDimension === true
    const partFocused = focus?.part === context.part
    const regionHighlighted = partFocused && focus.region === region
    const dimensionHighlighted = partFocused && focus.guideRegion === region
    const dimmed = partFocused && !regionHighlighted && !isGuide
    const highlighted = isDimension ? dimensionHighlighted : regionHighlighted
    if (isGuide) {
      object.visible = highlighted
    }
    if (object instanceof THREE.Mesh) {
      updateMeshMaterial(object.material, context.part, isGuide && highlighted, isGuide, dimmed)
    }
    if (object instanceof LineSegments2) {
      updateDimensionMaterial(object.material, dimensionHighlighted)
    } else if (object instanceof THREE.LineSegments) {
      updateEdgeMaterial(object.material, isGuide && highlighted, isGuide, dimmed)
    }
  })
}

/**
 * 渲染当前预览场景
 * @param context
 */
export function renderPreview(context: PreviewContext): void {
  context.renderer.render(context.scene, context.camera)
}

/**
 * 销毁预览上下文和占用的 Three.js 资源
 * @param context
 */
export function disposePreviewContext(context: PreviewContext): void {
  clearPreviewMeshes(context)
  context.observer.disconnect()
  context.controls.removeEventListener('change', context.changeHandler)
  context.renderer.domElement.removeEventListener('pointerdown', context.panPointerDownHandler)
  context.renderer.domElement.removeEventListener('pointermove', context.panPointerMoveHandler)
  context.renderer.domElement.removeEventListener('pointerup', context.panPointerUpHandler)
  context.renderer.domElement.removeEventListener('pointercancel', context.panPointerUpHandler)
  context.renderer.domElement.removeEventListener('contextmenu', context.contextMenuHandler)
  context.controls.dispose()
  context.renderer.dispose()
  context.renderer.domElement.remove()
}

/**
 * 应用屏幕平移偏移
 * 只移动正交投影视锥  保持相机位置和模型中心不变
 * @param context
 */
function applyCameraViewOffset(context: PreviewContext): void {
  const offsetX = -context.panOffset.x * context.viewportSize.x / 2
  const offsetY = context.panOffset.y * context.viewportSize.y / 2
  context.camera.setViewOffset(
    context.viewportSize.x,
    context.viewportSize.y,
    offsetX,
    offsetY,
    context.viewportSize.x,
    context.viewportSize.y,
  )
  context.camera.updateProjectionMatrix()
}

/**
 * 限制模型屏幕平移范围
 * 通过修正屏幕偏移实现回拉  不移动相机和视角中心
 * @param context
 */
function constrainPartToView(context: PreviewContext): void {
  // 获取真实构件包围盒  辅助体不参与平移边界
  const box = new THREE.Box3()
  context.meshes.forEach((object): void => {
    if (object.userData.previewGuide === true) {
      return
    }
    box.expandByObject(object)
  })
  if (box.isEmpty()) return

  // 8 个顶点投影到 NDC
  context.camera.updateMatrixWorld()
  const projectedCorners = [
    new THREE.Vector3(box.min.x, box.min.y, box.min.z),
    new THREE.Vector3(box.min.x, box.min.y, box.max.z),
    new THREE.Vector3(box.min.x, box.max.y, box.min.z),
    new THREE.Vector3(box.min.x, box.max.y, box.max.z),
    new THREE.Vector3(box.max.x, box.min.y, box.min.z),
    new THREE.Vector3(box.max.x, box.min.y, box.max.z),
    new THREE.Vector3(box.max.x, box.max.y, box.min.z),
    new THREE.Vector3(box.max.x, box.max.y, box.max.z),
  ]
  const projectedBox = new THREE.Box2()
  projectedCorners.forEach((corner): void => {
    corner.project(context.camera)                                        // 3D 坐标 -> NDC [-1, 1]
    projectedBox.expandByPoint(new THREE.Vector2(corner.x, corner.y))     // 收集投影后的 2D 坐标   得到模型在屏幕空间的投影包围盒
  })

  // 判断是否越界
  const projectedSize = projectedBox.getSize(new THREE.Vector2())
  const visibleWidth = Math.min(projectedSize.x * 0.3, 2)
  const visibleHeight = Math.min(projectedSize.y * 0.3, 2)
  let shiftX = 0
  let shiftY = 0

  if (projectedBox.max.x < -1 + visibleWidth) {
    shiftX = -1 + visibleWidth - projectedBox.max.x
  } else if (projectedBox.min.x > 1 - visibleWidth) {
    shiftX = 1 - visibleWidth - projectedBox.min.x
  }

  if (projectedBox.max.y < -1 + visibleHeight) {
    shiftY = -1 + visibleHeight - projectedBox.max.y
  } else if (projectedBox.min.y > 1 - visibleHeight) {
    shiftY = 1 - visibleHeight - projectedBox.min.y
  }

  if (shiftX === 0 && shiftY === 0) {
    return
  }

  context.panOffset.x += shiftX
  context.panOffset.y += shiftY
  applyCameraViewOffset(context)
}

/**
 * 创建体块材质
 * @param part
 * @param highlighted
 * @param isGuide
 */
function createMeshMaterial(part: PartId, highlighted: boolean, isGuide: boolean): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: highlighted ? 0xf4b942 : partColors[part],
    roughness: highlighted ? 0.45 : 0.72,
    metalness: highlighted ? 0.05 : 0.02,
    transparent: isGuide,
    opacity: isGuide ? 0.5 : 1,
  })
}

/**
 * 创建边线材质
 * @param highlighted
 * @param isGuide
 */
function createEdgeMaterial(highlighted: boolean, isGuide: boolean): THREE.LineBasicMaterial {
  return new THREE.LineBasicMaterial({
    color: highlighted ? 0x005f73 : 0x60706a,
    transparent: true,
    opacity: isGuide ? 0.9 : 0.55,
  })
}

/**
 * 创建尺寸线材质
 */
function createDimensionMaterial(context: PreviewContext): LineMaterial {
  const material = new LineMaterial({
    color: 0x2f5d62,
    linewidth: 4,
    transparent: true,
    opacity: 0.95,
    depthTest: false,
    depthWrite: false,
    alphaToCoverage: true,
  })
  material.resolution.copy(context.viewportSize)
  return material
}

/**
 * 更新体块材质
 * @param material
 * @param part
 * @param highlighted
 * @param isGuide
 * @param dimmed
 */
function updateMeshMaterial(
  material: THREE.Material | THREE.Material[],
  part: PartId,
  highlighted: boolean,
  isGuide: boolean,
  dimmed: boolean,
): void {
  const materials = Array.isArray(material) ? material : [material]
  materials.forEach((item): void => {
    if (item instanceof THREE.MeshStandardMaterial) {
      item.color.setHex(highlighted ? 0xf4b942 : partColors[part])
      item.roughness = highlighted ? 0.45 : 0.72
      item.metalness = highlighted ? 0.05 : 0.02
      const transparent = isGuide || dimmed
      if (item.transparent !== transparent) {
        item.transparent = transparent
        item.needsUpdate = true
      }
      // 聚焦辅助体 0.5   非聚焦 0.5      否则 1
      item.opacity = isGuide ? 0.5 : dimmed ? 0.5 : 1
      item.depthWrite = !dimmed
    }
  })
}

/**
 * 更新边线材质
 * @param material
 * @param highlighted
 * @param isGuide
 * @param dimmed
 */
function updateEdgeMaterial(
  material: THREE.Material | THREE.Material[],
  highlighted: boolean,
  isGuide: boolean,
  dimmed: boolean,
): void {
  const materials = Array.isArray(material) ? material : [material]
  materials.forEach((item): void => {
    if (item instanceof THREE.LineBasicMaterial) {
      item.color.setHex(highlighted ? 0x005f73 : 0x60706a)
      item.opacity = isGuide ? 0.9 : dimmed ? 0.2 : 0.7
      item.depthWrite = !dimmed
    }
  })
}

/**
 * 更新尺寸线材质
 * @param material
 * @param highlighted
 */
function updateDimensionMaterial(material: THREE.Material | THREE.Material[], highlighted: boolean): void {
  const materials = Array.isArray(material) ? material : [material]
  materials.forEach((item): void => {
    if (item instanceof LineMaterial) {
      item.color.setHex(highlighted ? 0x005f73 : 0x2f5d62)
      item.opacity = highlighted ? 1 : 0.95
    }
  })
}

/**
 * 释放 Three.js 对象占用的 geometry 和 material
 * @param object
 */
function disposeObject(object: THREE.Object3D): void {
  if (object instanceof LineSegments2 || object instanceof THREE.Mesh || object instanceof THREE.LineSegments) {
    object.geometry.dispose()
    if (Array.isArray(object.material)) {
      object.material.forEach((material): void => material.dispose())
    } else {
      object.material.dispose()
    }
  }
}
