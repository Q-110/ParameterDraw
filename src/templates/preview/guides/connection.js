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
    width: floorWidth,
    floorThick,
    toothHeight,
    toothWidth,
    pressWidth,
    ditchWidth,
    ditchHeight,
    ditchOuterWidth,
    slopeThick,
    slopeToothThick,
    slopeToothWidth,
    slopeWidth,
    slopeHeight,
    floorTopY,
    ditchBottomY,
    floorBottomY,
    innerDitchX,
    outerDitchX,
  } = makeConnectionPreviewData(params, derived, isUpstream)
  const floorEdgeX = floorWidth / 2
  const maxSize = Math.max(
    length,
    outerDitchX * 2 + slopeWidth * 2,
    slopeHeight,
  )
  const offset = Math.max(maxSize * 0.06, 0.18)
  const tickSize = Math.max(maxSize * 0.04, 0.18)
  const outerSlopeX = outerDitchX + slopeWidth
  const slopeAngle = Math.atan2(slopeHeight, slopeWidth)
  const slopeLength = Math.hypot(slopeWidth, slopeHeight)
  const slopeDirection = new THREE.Vector3(
    Math.cos(slopeAngle),
    Math.sin(slopeAngle),
    0,
  )
  const slopeNormal = new THREE.Vector3(
    -Math.sin(slopeAngle),
    Math.cos(slopeAngle),
    0,
  )
  const slopeMiddle = new THREE.Vector3(
    outerDitchX + slopeWidth / 2,
    ditchBottomY + slopeHeight / 2 + slopeThick / 2,
    length / 2,
  )
  const toothMiddle = new THREE.Vector3(
    outerDitchX,
    ditchBottomY + slopeThick / 2,
    length / 2,
  )
    .addScaledVector(slopeDirection, slopeLength * 0.25)
    .addScaledVector(slopeNormal, -(slopeThick + slopeToothThick) / 2)
  // 底板长度
  addZGuide(
    context,
    keys.length,
    floorWidth / 2 + offset,
    floorThick / 2,
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
    ditchBottomY,
    length / 2,
    tickSize,
  )
  // 齿墙高/宽
  addYGuide(
    context,
    keys.toothHeight,
    floorWidth / 2 + offset,
    floorBottomY - toothHeight,
    floorBottomY,
    -length / 2 + toothWidth / 2,
    tickSize,
  )
  addZGuide(
    context,
    keys.toothWidth,
    floorWidth / 2 + offset,
    floorBottomY - toothHeight,
    -length / 2,
    -length / 2 + toothWidth,
    tickSize,
  )
  // 压坡宽
  addXGuide(
    context,
    keys.pressWidth,
    outerSlopeX,
    outerSlopeX + pressWidth,
    ditchBottomY + slopeHeight,
    length / 2 + offset,
    tickSize,
  )
  // 坡底槽宽
  addXGuide(
    context,
    keys.ditchWidth,
    innerDitchX,
    floorEdgeX,
    ditchBottomY - offset,
    length / 2,
    tickSize,
  )
  // 坡底槽高
  addYGuide(
    context,
    keys.ditchHeight,
    innerDitchX - offset,
    ditchBottomY,
    floorTopY,
    length / 2,
    tickSize,
  )
  // 坡底外槽宽
  addXGuide(
    context,
    keys.ditchOuterWidth,
    floorEdgeX,
    outerDitchX,
    ditchBottomY - offset,
    length / 2,
    tickSize,
  )
  // 坡板厚度
  addVectorGuide(
    context,
    keys.slopeThick,
    slopeMiddle.clone().addScaledVector(slopeNormal, -slopeThick / 2),
    slopeMiddle.clone().addScaledVector(slopeNormal, slopeThick / 2),
    slopeDirection,
    tickSize,
  )
  // 坡齿
  addVectorGuide(
    context,
    keys.slopeToothThick,
    toothMiddle.clone().addScaledVector(slopeNormal, -slopeToothThick / 2),
    toothMiddle.clone().addScaledVector(slopeNormal, slopeToothThick / 2),
    slopeDirection,
    tickSize,
  )
  addVectorGuide(
    context,
    keys.slopeToothWidth,
    toothMiddle.clone().addScaledVector(slopeDirection, -slopeToothWidth / 2),
    toothMiddle.clone().addScaledVector(slopeDirection, slopeToothWidth / 2),
    slopeNormal,
    tickSize,
  )
}
