import * as THREE from 'three'
import { makeConnectionPreviewData } from '../data'
import { addBox, addGeometry } from '../scene/objects'

/**
 * 连接段
 * @param context
 * @param params
 * @param derived
 * @param isUpstream
 */
export function buildConnection(context, params, derived, isUpstream) {
  const {
    length,
    width,
    slopeWidth,
    slopeHeight,
    floorThick,
    slopeThick,
    pressWidth,
    slopeToothThick,
    slopeToothWidth,
    toothHeight: toothHigh,
    toothWidth: toothWide,
    ditchWidth,
    ditchHeight,
    ditchOuterWidth,
    floorTopY,
    ditchBottomY,
    floorBottomY,
    innerDitchX,
    outerDitchX,
    slopeFootWidth,
  } = makeConnectionPreviewData(params, derived, isUpstream)
  // 底板横断面   中央保持底板顶面高程   左右坡脚位置下凹形成坡底槽
  const floorShape = new THREE.Shape()
  floorShape.moveTo(-outerDitchX, floorBottomY)
  floorShape.lineTo(outerDitchX, floorBottomY)
  floorShape.lineTo(outerDitchX, ditchBottomY)
  floorShape.lineTo(innerDitchX, ditchBottomY)
  floorShape.lineTo(innerDitchX, floorTopY)
  floorShape.lineTo(-innerDitchX, floorTopY)
  floorShape.lineTo(-innerDitchX, ditchBottomY)
  floorShape.lineTo(-outerDitchX, ditchBottomY)
  floorShape.closePath()
  const floorGeometry = new THREE.ExtrudeGeometry(floorShape, {
    depth: length,
    bevelEnabled: false,
  })
  floorGeometry.translate(0, 0, -length / 2)
  floorGeometry.computeVertexNormals()
  addGeometry(context, 'floor', floorGeometry)
  // 坡底槽高亮区域   实体已包含在底板横断面中
  for (const side of [-1, 1]) {
    addBox(
      context,
      'ditch',
      ditchWidth + ditchOuterWidth,
      0.01,
      length,
      side * (width / 2 + (ditchOuterWidth - ditchWidth) / 2),
      ditchBottomY + 0.005,
      0,
      0,
      0,
      true,
    )
  }
  // 坡面   side -1 左侧坡 1 右侧坡
  addConnectionSlope(
    context,
    slopeFootWidth,
    slopeWidth,
    slopeHeight,
    slopeThick,
    length,
    ditchBottomY,
    -1,
  )
  addConnectionSlope(
    context,
    slopeFootWidth,
    slopeWidth,
    slopeHeight,
    slopeThick,
    length,
    ditchBottomY,
    1,
  )
  const slopeAngle = Math.atan2(slopeHeight, slopeWidth)
  const slopeLength = Math.hypot(slopeWidth, slopeHeight)
  for (const side of [-1, 1]) {
    // 坡顶压坡板   从坡面外缘继续向两侧水平延伸
    addBox(
      context,
      'slope',
      pressWidth,
      slopeThick,
      length,
      side * (outerDitchX + slopeWidth + pressWidth / 2),
      ditchBottomY + slopeHeight + slopeThick / 2,
      0,
    )
    // 坡齿   沿连接段全长设置在坡板底面
    const slopeDirectionX = side * Math.cos(slopeAngle)
    const slopeDirectionY = Math.sin(slopeAngle)
    const lowerNormalX = side * Math.sin(slopeAngle)
    const lowerNormalY = -Math.cos(slopeAngle)
    const slopeToothX =
      side * outerDitchX +
      slopeDirectionX * slopeLength * 0.25 +
      (lowerNormalX * (slopeThick + slopeToothThick)) / 2
    const slopeToothY =
      ditchBottomY +
      slopeThick / 2 +
      slopeDirectionY * slopeLength * 0.25 +
      (lowerNormalY * (slopeThick + slopeToothThick)) / 2
    addBox(
      context,
      'slope',
      slopeToothWidth,
      slopeToothThick,
      length,
      slopeToothX,
      slopeToothY,
      0,
      side === 1 ? slopeAngle : Math.PI - slopeAngle,
    )
  }
  // 齿墙
  addBox(
    context,
    'tooth',
    width,
    toothHigh,
    toothWide,
    0,
    floorBottomY - toothHigh / 2,
    -length / 2 + toothWide / 2,
  )
}

/**
 * 创建连接段两侧坡板
 * 坡板使用坡面宽度和坡面高度计算真实斜长  再绕 Z 轴旋转贴到渠底板两侧
 * @param context      目标场景上下文
 * @param floorWidth   渠底板宽
 * @param slopeWidth   坡面水平宽度
 * @param slopeHeight  坡面高度
 * @param slopeThick   坡板厚度
 * @param length       连接段长度
 * @param baseY        坡脚高程
 * @param side         -1 表示左侧坡板  1 表示右侧坡板
 */
function addConnectionSlope(
  context,
  floorWidth,
  slopeWidth,
  slopeHeight,
  slopeThick,
  length,
  baseY,
  side,
) {
  const angle = Math.atan2(slopeHeight, slopeWidth)
  const slopeLength = Math.hypot(slopeWidth, slopeHeight)
  const x = side * (floorWidth / 2 + slopeWidth / 2)
  const y = baseY + slopeHeight / 2 + slopeThick / 2
  const rotateZ = side === 1 ? angle : Math.PI - angle
  addBox(context, 'slope', slopeLength, slopeThick, length, x, y, 0, rotateZ)
}
