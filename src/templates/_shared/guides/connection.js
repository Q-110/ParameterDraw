import * as THREE from 'three'
import { makeConnectionPreviewData } from '../data'
import { addVectorGuide, addXGuide, addYGuide, addZGuide } from './primitives'

/**
 * 创建上下游连接段尺寸辅助线
 * @param context
 * @param params
 * @param derived
 * @param isUpstream
 */
export function addConnectionGuides(context, params, derived, isUpstream) {
  const {
    keys,
    length,
    floorThick,
    toothHeight,
    toothWidth,
    slopeThick,
    slopeToothThick,
    slopeToothWidth,
    slopeWidth,
    slopeHeight,
    floorTopY,
    ditchBottomY,
    floorBottomY,
    floorEdgeX,
    ditchOuterX,
    slopeLowerFootX,
    slopeLowerFootY,
    slopeTopX,
    pressOuterX,
    slopeDirectionX,
    slopeDirectionY,
    slopeNormalX,
    slopeNormalY,
    slopeToothOuterY,
  } = makeConnectionPreviewData(params, derived, isUpstream)
  const maxSize = Math.max(
    length,
    pressOuterX * 2,
    slopeHeight,
  )
  const offset = Math.max(maxSize * 0.06, 0.18)
  const tickSize = Math.max(maxSize * 0.04, 0.18)
  const slopeDirection = new THREE.Vector3(
    slopeDirectionX,
    slopeDirectionY,
    0,
  )
  const slopeNormal = new THREE.Vector3(
    slopeNormalX,
    slopeNormalY,
    0,
  )
  const slopeTopMiddle = new THREE.Vector3(
    floorEdgeX + slopeWidth / 2,
    floorTopY + slopeHeight / 2,
    length / 2,
  )
  const slopeBottomMiddle = slopeTopMiddle
    .clone()
    .addScaledVector(slopeNormal, slopeThick)
  const toothTopMiddle = slopeBottomMiddle.clone()
  const toothBottomMiddle = toothTopMiddle
    .clone()
    .addScaledVector(slopeNormal, slopeToothThick)
  // 底板长度
  addZGuide(
    context,
    keys.length,
    pressOuterX + offset,
    floorTopY,
    -length / 2,
    length / 2,
    tickSize,
  )
  // 底板厚度
  addYGuide(
    context,
    keys.floorThick,
    floorEdgeX,
    floorBottomY,
    floorTopY,
    length / 2,
    tickSize,
  )
  // 两端齿墙使用同一参数   同时显示两处实际位置
  for (const side of [-1, 1]) {
    const endZ = side * length / 2
    const innerZ = endZ - side * toothWidth
    addYGuide(
      context,
      keys.toothHeight,
      floorEdgeX + offset,
      floorBottomY - toothHeight,
      floorBottomY,
      (endZ + innerZ) / 2,
      tickSize,
    )
    addZGuide(
      context,
      keys.toothWidth,
      floorEdgeX + offset,
      floorBottomY - toothHeight,
      Math.min(endZ, innerZ),
      Math.max(endZ, innerZ),
      tickSize,
    )
  }
  // 压坡宽
  addXGuide(
    context,
    keys.pressWidth,
    slopeTopX,
    pressOuterX,
    slopeHeight,
    length / 2 + offset,
    tickSize,
  )
  // 坡底槽宽
  addXGuide(
    context,
    keys.ditchWidth,
    floorEdgeX,
    ditchOuterX,
    ditchBottomY - offset,
    length / 2,
    tickSize,
  )
  // 坡底槽高
  addYGuide(
    context,
    keys.ditchHeight,
    floorEdgeX - offset,
    ditchBottomY,
    floorTopY,
    length / 2,
    tickSize,
  )
  // 坡底外槽宽
  addVectorGuide(
    context,
    keys.ditchOuterWidth,
    new THREE.Vector3(ditchOuterX, ditchBottomY - offset * 2, length / 2),
    new THREE.Vector3(slopeLowerFootX, ditchBottomY - offset * 2, length / 2),
    new THREE.Vector3(0, 0, 1),
    tickSize,
    new THREE.Vector3(ditchOuterX, ditchBottomY, length / 2),
    new THREE.Vector3(slopeLowerFootX, slopeLowerFootY, length / 2),
  )
  // 坡板厚度
  addVectorGuide(
    context,
    keys.slopeThick,
    slopeTopMiddle,
    slopeBottomMiddle,
    slopeDirection,
    tickSize,
  )
  // 坡齿
  addVectorGuide(
    context,
    keys.slopeToothThick,
    toothTopMiddle.setZ(-length / 2 + slopeToothWidth / 2),
    toothBottomMiddle.setZ(-length / 2 + slopeToothWidth / 2),
    slopeDirection,
    tickSize,
  )
  addZGuide(
    context,
    keys.slopeToothWidth,
    pressOuterX,
    slopeToothOuterY - offset,
    -length / 2,
    -length / 2 + slopeToothWidth,
    tickSize,
  )
}
