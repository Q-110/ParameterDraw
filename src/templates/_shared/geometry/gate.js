import * as THREE from 'three'
import { makeGatePreviewData } from '../data'
import { addBox, addGeometry } from '../scene/objects'

/**
 * 闸室
 * @param context
 * @param params
 * @param derived
 */
export function buildGate(context, params, derived) {
  const {
    width,
    length,
    pierHeight,
    floorThick,
    pierThick,
    openingWidth,
    openingCenterX,
    doorWidth,
    doorThick,
    doorCenterZ,
    doorUpstreamZ,
    doorDownstreamZ,
    slotDepth,
    slotUpstreamZ,
    slotDownstreamZ,
    slotSecondWidth,
    doorPierDepth,
    serviceWidth,
    serviceThick,
    serviceSpan,
    serviceCenterY,
    serviceUpstreamZ,
    serviceDownstreamZ,
    toothHeight,
    toothWidth,
    trafficBridge,
  } = makeGatePreviewData(params, derived)
  // 底板
  addBox(context, 'floor', width, floorThick, length, 0, 0, 0)
  // 左右边墩
  addBox(
    context,
    'pier',
    pierThick,
    pierHeight,
    length,
    -width / 2 + pierThick / 2,
    floorThick / 2 + pierHeight / 2,
    0,
  )
  addBox(
    context,
    'pier',
    pierThick,
    pierHeight,
    length,
    width / 2 - pierThick / 2,
    floorThick / 2 + pierHeight / 2,
    0,
  )
  // 每个闸孔都按 闸孔净宽 + 中墙厚 的间距排布  多孔时补齐中墙和每孔闸门
  // 当前前端固定为单孔   孔口始终位于闸室横向中心
  // 中墙   从第二个孔开始，在前后孔之间补一个中墙
  // 单孔结构不创建中墙实体   中墙厚参数仅保留给后端模型
  // 孔口
  addBox(
    context,
    'opening',
    openingWidth,
    floorThick * 0.35,
    length,
    openingCenterX,
    floorThick / 2,
    0,
    0,
    0,
    true,
  )
  // 闸门仅作为参数聚焦辅助体   参考模型不创建闸门实体
  addBox(
    context,
    'door',
    doorWidth,
    pierHeight,
    doorThick,
    openingCenterX,
    floorThick / 2 + pierHeight / 2,
    doorCenterZ,
    0,
    0,
    true,
  )
  // 门槽底部横梁
  addBox(
    context,
    'slot',
    doorWidth,
    slotDepth,
    slotUpstreamZ - slotDownstreamZ,
    openingCenterX,
    floorThick / 2 - slotDepth / 2,
    (slotUpstreamZ + slotDownstreamZ) / 2,
  )
  // 门槽四根侧柱   分别位于闸门前后和闸孔左右两侧
  addBox(
    context,
    'slot',
    doorPierDepth,
    pierHeight,
    slotSecondWidth,
    -openingWidth / 2 - doorPierDepth / 2,
    floorThick / 2 + pierHeight / 2,
    doorUpstreamZ + slotSecondWidth / 2,
  )
  addBox(
    context,
    'slot',
    doorPierDepth,
    pierHeight,
    slotSecondWidth,
    openingWidth / 2 + doorPierDepth / 2,
    floorThick / 2 + pierHeight / 2,
    doorUpstreamZ + slotSecondWidth / 2,
  )
  addBox(
    context,
    'slot',
    doorPierDepth,
    pierHeight,
    slotSecondWidth,
    -openingWidth / 2 - doorPierDepth / 2,
    floorThick / 2 + pierHeight / 2,
    doorDownstreamZ - slotSecondWidth / 2,
  )
  addBox(
    context,
    'slot',
    doorPierDepth,
    pierHeight,
    slotSecondWidth,
    openingWidth / 2 + doorPierDepth / 2,
    floorThick / 2 + pierHeight / 2,
    doorDownstreamZ - slotSecondWidth / 2,
  )
  // 检修桥   分别贴合门槽上游和下游外侧
  addBox(
    context,
    'serviceBridge',
    serviceSpan,
    serviceThick,
    serviceWidth,
    0,
    serviceCenterY,
    serviceUpstreamZ,
  )
  addBox(
    context,
    'serviceBridge',
    serviceSpan,
    serviceThick,
    serviceWidth,
    0,
    serviceCenterY,
    serviceDownstreamZ,
  )
  // 交通桥   始终创建   addBox 内部按维度有效性判断
  addBox(
    context,
    'trafficBridge',
    openingWidth,
    trafficBridge.thick,
    trafficBridge.width,
    0,
    trafficBridge.centerY,
    trafficBridge.centerZ,
  )
  addBox(
    context,
    'approachSlab',
    trafficBridge.approachSlabLength,
    trafficBridge.thick,
    trafficBridge.width,
    -openingWidth / 2 - trafficBridge.approachSlabLength / 2,
    trafficBridge.centerY,
    trafficBridge.centerZ,
  )
  addBox(
    context,
    'approachSlab',
    trafficBridge.approachSlabLength,
    trafficBridge.thick,
    trafficBridge.width,
    openingWidth / 2 + trafficBridge.approachSlabLength / 2,
    trafficBridge.centerY,
    trafficBridge.centerZ,
  )
  // 交通桥护边   沿桥宽的上游和下游边缘布置
  addBox(
    context,
    'trafficBridge',
    trafficBridge.totalSpan,
    trafficBridge.edgeHeight,
    trafficBridge.edgeThick,
    0,
    trafficBridge.topY + trafficBridge.edgeHeight / 2,
    trafficBridge.upstreamZ - trafficBridge.edgeThick / 2,
  )
  addBox(
    context,
    'trafficBridge',
    trafficBridge.totalSpan,
    trafficBridge.edgeHeight,
    trafficBridge.edgeThick,
    0,
    trafficBridge.topY + trafficBridge.edgeHeight / 2,
    trafficBridge.downstreamZ + trafficBridge.edgeThick / 2,
  )
  // 上游齿墙   平底段和斜面均按齿墙宽参数创建
  const floorBottomY = -floorThick / 2
  const toothBottomY = floorBottomY - toothHeight
  const upstreamToothVertices = new Float32Array([
    -width / 2, floorBottomY, length / 2,
    -width / 2, toothBottomY, length / 2,
    -width / 2, toothBottomY, length / 2 - toothWidth,
    -width / 2, floorBottomY, length / 2 - toothWidth * 2,
    width / 2, floorBottomY, length / 2,
    width / 2, toothBottomY, length / 2,
    width / 2, toothBottomY, length / 2 - toothWidth,
    width / 2, floorBottomY, length / 2 - toothWidth * 2,
  ])
  const toothIndices = [
    0, 2, 1, 0, 3, 2,
    4, 5, 6, 4, 6, 7,
    0, 1, 5, 0, 5, 4,
    1, 2, 6, 1, 6, 5,
    2, 3, 7, 2, 7, 6,
    3, 0, 4, 3, 4, 7,
  ]
  const upstreamToothGeometry = new THREE.BufferGeometry()
  upstreamToothGeometry.setAttribute(
    'position',
    new THREE.BufferAttribute(upstreamToothVertices, 3),
  )
  upstreamToothGeometry.setIndex(toothIndices)
  upstreamToothGeometry.computeVertexNormals()
  addGeometry(context, 'tooth', upstreamToothGeometry)

  // 下游齿墙   与上游齿墙镜像布置
  const downstreamToothVertices = new Float32Array([
    -width / 2, floorBottomY, -length / 2,
    -width / 2, toothBottomY, -length / 2,
    -width / 2, toothBottomY, -length / 2 + toothWidth,
    -width / 2, floorBottomY, -length / 2 + toothWidth * 2,
    width / 2, floorBottomY, -length / 2,
    width / 2, toothBottomY, -length / 2,
    width / 2, toothBottomY, -length / 2 + toothWidth,
    width / 2, floorBottomY, -length / 2 + toothWidth * 2,
  ])
  const downstreamToothGeometry = new THREE.BufferGeometry()
  downstreamToothGeometry.setAttribute(
    'position',
    new THREE.BufferAttribute(downstreamToothVertices, 3),
  )
  downstreamToothGeometry.setIndex([
    0, 1, 2, 0, 2, 3,
    4, 6, 5, 4, 7, 6,
    0, 5, 1, 0, 4, 5,
    1, 6, 2, 1, 5, 6,
    2, 7, 3, 2, 6, 7,
    3, 4, 0, 3, 7, 4,
  ])
  downstreamToothGeometry.computeVertexNormals()
  addGeometry(context, 'tooth', downstreamToothGeometry)
}
