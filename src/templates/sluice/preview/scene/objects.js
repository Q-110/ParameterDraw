import * as THREE from 'three'
import { LineMaterial } from 'three/addons/lines/LineMaterial.js'
import { LineSegments2 } from 'three/addons/lines/LineSegments2.js'
import { LineSegmentsGeometry } from 'three/addons/lines/LineSegmentsGeometry.js'
import {
  createDimensionMaterial,
  createEdgeMaterial,
  createMeshMaterial,
  disposeObject,
  updateDimensionMaterial,
  updateEdgeMaterial,
  updateMeshMaterial,
} from './materials'

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
  context,
  region,
  width,
  height,
  depth,
  x,
  y,
  z,
  rotateZ = 0,
  rotateX = 0,
  isGuide = false,
) {
  // 创建几何体
  const geometry = new THREE.BoxGeometry(
    Math.max(width, 0.01),
    Math.max(height, 0.01),
    Math.max(depth, 0.01),
  )
  // 创建 Mesh
  const mesh = new THREE.Mesh(
    geometry,
    createMeshMaterial(context.part, false, isGuide),
  )
  mesh.position.set(x, y, z) // 设置位置
  mesh.rotation.x = rotateX // 设置纵向坡度
  mesh.rotation.z = rotateZ // 设置旋转
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
  context.root.add(mesh, edges) // 加入部件根节点
  context.meshes.push(mesh, edges) // 存入数组
  if (!isGuide) {
    const guideGeometry = geometry.clone()
    const guideMesh = new THREE.Mesh(
      guideGeometry,
      createMeshMaterial(context.part, false, true),
    )
    guideMesh.position.copy(mesh.position)
    guideMesh.rotation.copy(mesh.rotation)
    guideMesh.userData.previewRegion = region
    guideMesh.userData.previewGuide = true
    guideMesh.visible = false
    const guideEdges = new THREE.LineSegments(
      new THREE.EdgesGeometry(guideGeometry),
      createEdgeMaterial(false, true),
    )
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
export function addGeometry(
  context,
  region,
  geometry,
  doubleSide = false,
  isGuide = false,
) {
  const material = createMeshMaterial(context.part, false, isGuide)
  material.side = doubleSide ? THREE.DoubleSide : THREE.FrontSide
  const mesh = new THREE.Mesh(geometry, material)
  mesh.userData.previewRegion = region
  mesh.userData.previewGuide = isGuide
  mesh.visible = !isGuide
  const edges = new THREE.LineSegments(
    new THREE.EdgesGeometry(geometry),
    createEdgeMaterial(false, isGuide),
  )
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
    const guideEdges = new THREE.LineSegments(
      new THREE.EdgesGeometry(guideGeometry),
      createEdgeMaterial(false, true),
    )
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
  context,
  region,
  start,
  end,
  tickAxis,
  tickSize,
  extensionStart,
  extensionEnd,
) {
  const tick = tickAxis
    .clone()
    .normalize()
    .multiplyScalar(tickSize / 2)
  const vertices = new Float32Array([
    start.x,
    start.y,
    start.z,
    end.x,
    end.y,
    end.z,
    start.x - tick.x,
    start.y - tick.y,
    start.z - tick.z,
    start.x + tick.x,
    start.y + tick.y,
    start.z + tick.z,
    end.x - tick.x,
    end.y - tick.y,
    end.z - tick.z,
    end.x + tick.x,
    end.y + tick.y,
    end.z + tick.z,
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
    extensionGeometry.setPositions(
      new Float32Array([
        extensionStart.x,
        extensionStart.y,
        extensionStart.z,
        start.x,
        start.y,
        start.z,
        extensionEnd.x,
        extensionEnd.y,
        extensionEnd.z,
        end.x,
        end.y,
        end.z,
      ]),
    )
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
    const extensionLine = new LineSegments2(
      extensionGeometry,
      extensionMaterial,
    )
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
export function clearPreviewMeshes(context) {
  context.meshes.forEach((mesh) => {
    // 移除前先释放 Three.js 资源  避免参数连续修改时堆积旧 geometry/material
    disposeObject(mesh)
    context.root.remove(mesh) // 从部件根节点中移除
  })
  context.meshes = [] // 清空 mesh 引用数组
  context.dimensionMaterials.clear()
  // 清空后恢复 root 的原始变换  下一次重建再重新计算包围盒
  context.root.position.set(0, 0, 0)
  context.root.scale.set(1, 1, 1)
}

/**
 * 更新当前部件高亮材质
 * 焦点变化只修改材质参数  避免重建几何和重置用户视角
 * @param context
 * @param focus
 */
export function updatePreviewHighlight(context, focus) {
  context.meshes.forEach((object) => {
    const region = object.userData.previewRegion
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
      updateMeshMaterial(
        object.material,
        context.part,
        isGuide && highlighted,
        isGuide,
        dimmed,
      )
    }
    if (object instanceof LineSegments2) {
      updateDimensionMaterial(object.material, dimensionHighlighted)
    } else if (object instanceof THREE.LineSegments) {
      updateEdgeMaterial(
        object.material,
        isGuide && highlighted,
        isGuide,
        dimmed,
      )
    }
  })
}
