import * as THREE from 'three'

/**
 * 容器尺寸变化时自适应调整相机和渲染器
 * @param container
 * @param context
 */
export function resizeContext(container, context) {
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
  context.dimensionMaterials.forEach((material) => {
    material.resolution.set(width, height)
  })
  // 5. 立即渲染一帧 防止 ResizeObserver 回调后出现一帧空白
  context.renderer.render(context.scene, context.camera)
}

/**
 * 将当前部件整体缩放并移动到预览视口中心
 * 几何体先按真实 cm 比例创建  再通过 root 统一缩放  保证部件内部比例不被破坏
 * @param context
 */
export function fitPartToView(context) {
  if (!context.meshes.length) {
    return
  }
  // 先基于非辅助对象计算包围盒  得到部件真实显示范围
  context.root.updateWorldMatrix(true, true)
  const box = new THREE.Box3()
  context.meshes.forEach((object) => {
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
  context.root.position.set(
    -center.x * scale,
    -center.y * scale,
    -center.z * scale,
  )
  context.modelCenter.set(0, 0, 0)
  context.controls.target.copy(context.modelCenter)
  applyCameraViewOffset(context)
  constrainPartToView(context)
}

/**
 * 应用屏幕平移偏移
 * 只移动正交投影视锥  保持相机位置和模型中心不变
 * @param context
 */
export function applyCameraViewOffset(context) {
  const offsetX = (-context.panOffset.x * context.viewportSize.x) / 2
  const offsetY = (context.panOffset.y * context.viewportSize.y) / 2
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
export function constrainPartToView(context) {
  // 获取真实构件包围盒  辅助体不参与平移边界
  const box = new THREE.Box3()
  context.meshes.forEach((object) => {
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
  projectedCorners.forEach((corner) => {
    corner.project(context.camera) // 3D 坐标 -> NDC [-1, 1]
    projectedBox.expandByPoint(new THREE.Vector2(corner.x, corner.y)) // 收集投影后的 2D 坐标   得到模型在屏幕空间的投影包围盒
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
