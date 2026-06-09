import * as THREE from 'three'
import type { FieldGroup } from '../../../../types.js'
import type { DerivedValues, SluicePreviewParameters } from '../types.js'
import { addBox, addGeometry, type PreviewContext } from './previewScene.js'
import { addSluicePreviewGuides } from './sluicePreviewGuides.js'

// 渐变段一个断面的关键尺寸  单位已统一换算为 Three.js 使用的显示单位
// 预览坐标约定为 Y 轴竖向  X 轴横向  Z 正方向为上游
interface TransitionSection {
  floorWidth: number
  slopeWidth: number
  slopeHeight: number
}

interface SluicePreviewBuildOptions {
  groups: FieldGroup[]
  showTrafficBridge: boolean
}

/**
 * 按部件分派几何构建函数
 * @param context
 * @param params
 * @param derived
 */
export function buildSluicePart(
  context: PreviewContext,
  params: SluicePreviewParameters,
  derived: DerivedValues,
  options: SluicePreviewBuildOptions,
): void {
  // 闸室
  if (context.part === 'gate') {
    buildGate(context, params, derived, options.showTrafficBridge)
  }

  // 消力池
  if (context.part === 'stilling') {
    buildStilling(context, params, derived)
  }

  // 上游连接、下游连接
  if (context.part === 'upstreamConnection') {
    buildConnection(context, params, derived, 'upstreamConnection')
  }
  if (context.part === 'downstreamConnection') {
    buildConnection(context, params, derived, 'downstreamConnection')
  }

  // 上游渐变、下游渐变
  if (context.part === 'upstreamTransition') {
    buildTransition(context, params, derived, 'upstreamTransition')
  }
  if (context.part === 'downstreamTransition') {
    buildTransition(context, params, derived, 'downstreamTransition')
  }

  addSluicePreviewGuides(context, params, derived, options)
}

/**
 * 闸室
 * @param context
 * @param params
 * @param derived
 */
function buildGate(
  context: PreviewContext,
  params: SluicePreviewParameters,
  derived: DerivedValues,
  showTrafficBridge: boolean,
): void {
  const width = cm(derived.闸总宽)
  const length = cm(params.闸室长)
  const pierHeight = cm(params.闸墩高)
  const floorThick = cm(params.闸底板厚)
  const pierThick = cm(params.边墩厚)
  const middlePierThick = cm(params.中墙厚)
  const openingWidth = cm(params.闸孔净宽)
  const doorWidth = cm(derived.闸门宽)
  const openingStep = openingWidth + middlePierThick
  const doorUpstreamZ = length / 2 - cm(params.闸门距上游)

  // 底板
  addBox(context, 'floor', width, floorThick, length, 0, 0, 0)

  // 左右边墩
  addBox(context, 'pier', pierThick, pierHeight, length, -width / 2 + pierThick / 2, floorThick / 2 + pierHeight / 2, 0)
  addBox(context, 'pier', pierThick, pierHeight, length, width / 2 - pierThick / 2, floorThick / 2 + pierHeight / 2, 0)

  // 每个闸孔都按 闸孔净宽 + 中墙厚 的间距排布  多孔时补齐中墙和每孔闸门
  for (let index = 0; index < params.闸孔数; index += 1) {
    // 孔中心位置
    const openingCenterX = -width / 2 + pierThick + openingWidth / 2 + openingStep * index
    // 中墙   从第二个孔开始，在前后孔之间补一个中墙
    if (index > 0) {
      const middlePierX = openingCenterX - openingWidth / 2 - middlePierThick / 2
      addBox(context, 'middlePier', middlePierThick, pierHeight, length, middlePierX, floorThick / 2 + pierHeight / 2, 0)
    }
    // 孔口
    addBox(context, 'opening', openingWidth, floorThick * 0.35, length, openingCenterX, floorThick / 2, 0, 0, 0, true)
    // 闸门
    addBox(context, 'door', doorWidth, pierHeight, cm(params.闸门厚), openingCenterX, floorThick / 2 + pierHeight / 2, doorUpstreamZ - cm(params.闸门厚) / 2)
    // 门槽
    addBox(context, 'slot', doorWidth, pierHeight, cm(params.门槽深), openingCenterX, floorThick / 2 + pierHeight / 2, doorUpstreamZ - cm(params.门槽深) / 2, 0, 0, true)
  }
  // 检修桥
  addBox(context, 'serviceBridge', width - pierThick, cm(params.检修桥板厚), cm(params.检修桥板宽), 0, floorThick / 2 + pierHeight + cm(params.检修桥板厚) / 2, doorUpstreamZ)

  if (showTrafficBridge) {
    // 有交通桥模板才读取交通桥参数并创建对应构件
    const trafficBridgeUpstreamZ = length / 2 - cm(params.桥边距上游)
    const trafficBridgeWidth = cm(params.交通桥宽)
    const trafficBridgeThick = cm(params.交通桥厚)
    const approachSlabLength = cm(params.搭板长)
    const bridgeY = floorThick / 2 + pierHeight + cm(params.检修桥板厚) + trafficBridgeThick / 2
    const trafficBridgeZ = trafficBridgeUpstreamZ - trafficBridgeWidth / 2
    addBox(context, 'trafficBridge', width, trafficBridgeThick, trafficBridgeWidth, 0, bridgeY, trafficBridgeZ)
    addBox(context, 'approachSlab', approachSlabLength, trafficBridgeThick, trafficBridgeWidth, -width / 2 - approachSlabLength / 2, bridgeY, trafficBridgeZ)
    addBox(context, 'approachSlab', approachSlabLength, trafficBridgeThick, trafficBridgeWidth, width / 2 + approachSlabLength / 2, bridgeY, trafficBridgeZ)
  }
  // 齿墙
  addBox(context, 'tooth', width, cm(params.齿墙高), cm(params.齿墙宽), 0, -floorThick / 2 - cm(params.齿墙高) / 2, -length / 2 + cm(params.齿墙宽) / 2)

}

/**
 * 消力池
 * @param context
 * @param params
 * @param derived
 */
function buildStilling(context: PreviewContext, params: SluicePreviewParameters, derived: DerivedValues): void {
  const width = cm(derived.消力池底板宽度)
  const flatLength = cm(params.消力池长度)
  const slopeLength = cm(params.消力池陡坡段长度)
  const flatSlopeLength = cm(params.消力池陡坡段平直段长度)
  const length = flatLength + slopeLength + flatSlopeLength
  const wallHeight = cm(params.消力池墙高)
  const slopeWallHeight = cm(derived.消力池陡坡段墙高)
  const upperWallWidth = cm(params.消力池陡坡段上部墙宽)
  const lowerWallWidth = cm(params.消力池陡坡段下部墙宽)
  const inclinedWallHeight = cm(params.消力池斜墙段高度)
  const floorThick = cm(params.消力池底板厚度)
  const slopeDrop = cm(params.消力池陡坡段高差)
  const flatStartZ = -length / 2
  const flatEndZ = flatStartZ + flatLength
  const slopeEndZ = flatEndZ + slopeLength
  const flatSlopeEndZ = length / 2
  // 平底段底板
  addBox(context, 'floor', width, floorThick, flatLength, 0, -slopeDrop, (flatStartZ + flatEndZ) / 2)
  // 消力池长度辅助区域   聚焦时覆盖平底段底板范围
  addBox(context, 'pool', width, floorThick * 0.4, flatLength, 0, -slopeDrop + floorThick * 0.7, (flatStartZ + flatEndZ) / 2, 0, 0, true)
  // 陡坡段   使用竖向等厚棱柱保证两端与水平底板齐口
  const slopeGeometry = new THREE.BufferGeometry()
  slopeGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array([
    -width / 2, -slopeDrop - floorThick / 2, flatEndZ,
    width / 2, -slopeDrop - floorThick / 2, flatEndZ,
    width / 2, -floorThick / 2, slopeEndZ,
    -width / 2, -floorThick / 2, slopeEndZ,
    -width / 2, -slopeDrop + floorThick / 2, flatEndZ,
    width / 2, -slopeDrop + floorThick / 2, flatEndZ,
    width / 2, floorThick / 2, slopeEndZ,
    -width / 2, floorThick / 2, slopeEndZ,
  ]), 3))
  slopeGeometry.setIndex([
    0, 1, 2,  0, 2, 3,    // 底面   法线朝 -Y
    4, 6, 5,  4, 7, 6,    // 顶面   法线朝 +Y
    0, 1, 5,  0, 5, 4,    // 前面   法线朝 +Z（不变）
    1, 5, 6,  1, 6, 2,    // 右面   法线朝 +X
    2, 3, 7,  2, 7, 6,    // 后面   法线朝 -Z（不变）
    0, 3, 7,  0, 7, 4,    // 左面   法线朝 -X
  ])
  // 转为非索引几何体  顶点在棱边处复制  法线不跨面平均  棱边恢复硬朗
  const slopeNonIndexed = slopeGeometry.toNonIndexed()
  slopeNonIndexed.computeVertexNormals()
  addGeometry(context, 'slope', slopeNonIndexed)
  // 坡顶平直段   与陡坡共同归属坡段高亮区域
  if (flatSlopeLength > 0) {
    addBox(context, 'slope', width, floorThick, flatSlopeLength, 0, 0, (slopeEndZ + flatSlopeEndZ) / 2)
  }

  // 左右墙沿平直段保持坡顶截面   进入陡坡后墙底跟随底板下降
  const wallSections = flatSlopeLength > 0 ? [
    { bottomY: floorThick / 2, height: slopeWallHeight, z: flatSlopeEndZ },
    { bottomY: floorThick / 2, height: slopeWallHeight, z: slopeEndZ },
    { bottomY: -slopeDrop + floorThick / 2, height: wallHeight, z: flatEndZ },
    { bottomY: -slopeDrop + floorThick / 2, height: wallHeight, z: flatStartZ },
  ] : [
    { bottomY: floorThick / 2, height: slopeWallHeight, z: slopeEndZ },
    { bottomY: -slopeDrop + floorThick / 2, height: wallHeight, z: flatEndZ },
    { bottomY: -slopeDrop + floorThick / 2, height: wallHeight, z: flatStartZ },
  ]
  for (const side of [-1, 1] as const) {
    const vertices = new Float32Array(wallSections.flatMap((section): number[] => {
      const innerX = side * width / 2
      const outerBottomX = side * (width / 2 + lowerWallWidth)
      const outerUpperX = side * (width / 2 + upperWallWidth)
      const topY = section.bottomY + section.height
      const inclinedTopY = section.bottomY + inclinedWallHeight

      // 每个断面按逆时针排列   保证闭合多面体各表面法向一致
      return side === 1 ? [
        innerX, section.bottomY, section.z,         // 内侧墙脚
        outerBottomX, section.bottomY, section.z,   // 外侧墙脚
        outerUpperX, inclinedTopY, section.z,       // 外侧折点
        outerUpperX, topY, section.z,               // 外侧墙顶
        innerX, topY, section.z,                    // 内侧墙顶
      ] : [
        innerX, section.bottomY, section.z,
        innerX, topY, section.z,
        outerUpperX, topY, section.z,
        outerUpperX, inclinedTopY, section.z,
        outerBottomX, section.bottomY, section.z,
      ]
    }))

    /* vertices 最终结构   以右侧墙且平直段长度大于 0 为例
      const vertices = new Float32Array([
        // 第 0 个断面   坡顶平直段起点
        W,  B0, Z0,   // 0   内侧墙脚
        LB, B0, Z0,   // 1   外侧墙脚
        UB, F0, Z0,   // 2   外侧折点
        UB, T0, Z0,   // 3   外侧墙顶
        W,  T0, Z0,   // 4   内侧墙顶

        // 第 1 个断面   平直段终点及陡坡起点
        W,  B1, Z1,   // 5
        LB, B1, Z1,   // 6
        UB, F1, Z1,   // 7
        UB, T1, Z1,   // 8
        W,  T1, Z1,   // 9

        // 第 2 个断面   陡坡终点及消力池起点
        W,  B2, Z2,   // 10
        LB, B2, Z2,   // 11
        UB, F2, Z2,   // 12
        UB, T2, Z2,   // 13
        W,  T2, Z2,   // 14

        // 第 3 个断面   消力池终点
        W,  B3, Z3,   // 15
        LB, B3, Z3,   // 16
        UB, F3, Z3,   // 17
        UB, T3, Z3,   // 18
        W,  T3, Z3,   // 19
      ])
     */
    const sectionPointCount = 5
    const indices: number[] = []
    // 将相邻断面的对应点连接为墙体侧面
    for (let sectionIndex = 0; sectionIndex < wallSections.length - 1; sectionIndex += 1) {
      const start = sectionIndex * sectionPointCount
      const end = start + sectionPointCount
      for (let pointIndex = 0; pointIndex < sectionPointCount; pointIndex += 1) {
        const nextPointIndex = (pointIndex + 1) % sectionPointCount
        indices.push(
          start + pointIndex, end + pointIndex, end + nextPointIndex,
          start + pointIndex, end + nextPointIndex, start + nextPointIndex,
        )
      }
    }
    // 墙体纵向两端封口
    for (let pointIndex = 1; pointIndex < sectionPointCount - 1; pointIndex += 1) {
      indices.push(0, pointIndex, pointIndex + 1)
    }
    const endStart = (wallSections.length - 1) * sectionPointCount
    for (let pointIndex = 1; pointIndex < sectionPointCount - 1; pointIndex += 1) {
      indices.push(endStart, endStart + pointIndex + 1, endStart + pointIndex)
    }

    /* indices 最终结构   以四个墙体断面为例
      const indices = [
        // 第 0 个断面连接第 1 个断面
        0, 5, 6,
        0, 6, 1,
        1, 6, 7,
        1, 7, 2,
        2, 7, 8,
        2, 8, 3,
        3, 8, 9,
        3, 9, 4,
        4, 9, 5,
        4, 5, 0,

        // 第 1 个断面连接第 2 个断面
        5, 10, 11,
        5, 11, 6,
        6, 11, 12,
        6, 12, 7,
        7, 12, 13,
        7, 13, 8,
        8, 13, 14,
        8, 14, 9,
        9, 14, 10,
        9, 10, 5,

        // 第 2 个断面连接第 3 个断面
        10, 15, 16,
        10, 16, 11,
        11, 16, 17,
        11, 17, 12,
        12, 17, 18,
        12, 18, 13,
        13, 18, 19,
        13, 19, 14,
        14, 19, 15,
        14, 15, 10,

        // 坡顶平直段起点封口
        0, 1, 2,
        0, 2, 3,
        0, 3, 4,

        // 消力池终点封口
        15, 17, 16,
        15, 18, 17,
        15, 19, 18,
      ]
     */
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3))
    geometry.setIndex(indices)
    geometry.computeVertexNormals()
    addGeometry(context, 'wall', geometry)
  }
  // 消力坎
  addBox(context, 'baffle', width, cm(params.消力坎高), cm(params.消力坎顶宽), 0, -slopeDrop + floorThick / 2 + cm(params.消力坎高) / 2, flatStartZ + cm(params.消力坎顶宽) / 2)
  // 齿墙
  addBox(context, 'tooth', width, cm(params.消力池齿墙高度), cm(params.消力池齿墙底宽), 0, -slopeDrop - floorThick / 2 - cm(params.消力池齿墙高度) / 2, flatStartZ + cm(params.消力池齿墙底宽) / 2)

}

/**
 * 连接段
 * @param context
 * @param params
 * @param derived
 * @param part
 */
function buildConnection(
  context: PreviewContext,
  params: SluicePreviewParameters,
  derived: DerivedValues,
  part: 'upstreamConnection' | 'downstreamConnection',
): void {
  const isUpstream = part === 'upstreamConnection'
  const length = cm(isUpstream ? params.上游连接段底板长度 : params.下游连接段底板长度)
  const width = cm(isUpstream ? derived.上游连接段渠底板宽 : derived.下游连接段渠底板宽)
  const slopeWidth = cm(isUpstream ? derived.上游连接段坡面宽度 : derived.下游连接段坡面宽度)
  const slopeHeight = cm(isUpstream ? derived.上游连接段坡面高度 : derived.下游连接段坡面高度)
  const floorThick = cm(isUpstream ? params.上游连接段底板厚度 : params.下游连接段底板厚度)
  const slopeThick = cm(isUpstream ? params.上游连接段坡板厚度 : params.下游连接段坡板厚度)
  const pressWidth = cm(isUpstream ? params.上游连接段坡顶压坡宽 : params.下游连接段坡顶压坡宽)
  const slopeToothThick = cm(isUpstream ? params.上游连接段坡齿厚度 : params.下游连接段坡齿厚度)
  const slopeToothWidth = cm(isUpstream ? params.上游连接段坡齿宽度 : params.下游连接段坡齿宽度)
  const toothHigh = cm(isUpstream ? params.上游连接段底板齿墙高 : params.下游连接段底板齿墙高)
  const toothWide = cm(isUpstream ? params.上游连接段底板齿墙宽 : params.下游连接段底板齿墙宽)
  const ditchWidth = cm(isUpstream ? params.上游连接段坡底槽宽 : params.下游连接段坡底槽宽)
  const ditchHeight = cm(isUpstream ? params.上游连接段坡底槽高 : params.下游连接段坡底槽高)
  const ditchOuterWidth = cm(isUpstream ? params.上游连接段坡底外槽宽 : params.下游连接段坡底外槽宽)
  const floorTopY = floorThick / 2
  const ditchBottomY = floorTopY - ditchHeight
  const floorBottomY = ditchBottomY - floorThick
  const innerDitchX = width / 2 - ditchWidth
  const outerDitchX = width / 2 + ditchOuterWidth
  const slopeFootWidth = outerDitchX * 2

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
  for (const side of [-1, 1] as const) {
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
  addConnectionSlope(context, slopeFootWidth, slopeWidth, slopeHeight, slopeThick, length, ditchBottomY, -1)
  addConnectionSlope(context, slopeFootWidth, slopeWidth, slopeHeight, slopeThick, length, ditchBottomY, 1)
  const slopeAngle = Math.atan2(slopeHeight, slopeWidth)
  const slopeLength = Math.hypot(slopeWidth, slopeHeight)
  for (const side of [-1, 1] as const) {
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
    const slopeToothX = side * outerDitchX
      + slopeDirectionX * slopeLength * 0.25
      + lowerNormalX * (slopeThick + slopeToothThick) / 2
    const slopeToothY = ditchBottomY + slopeThick / 2
      + slopeDirectionY * slopeLength * 0.25
      + lowerNormalY * (slopeThick + slopeToothThick) / 2
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
  addBox(context, 'tooth', width, toothHigh, toothWide, 0, floorBottomY - toothHigh / 2, -length / 2 + toothWide / 2)
}

/**
 * 渐变段
 * @param context
 * @param params
 * @param derived
 * @param part
 */
function buildTransition(
  context: PreviewContext,
  params: SluicePreviewParameters,
  derived: DerivedValues,
  part: 'upstreamTransition' | 'downstreamTransition',
): void {
  const isUpstream = part === 'upstreamTransition'
  // 两类渐变段都按 上断面 -> 中断面 -> 下断面 布置到 +Z -> -Z
  const firstLength = cm(isUpstream ? params.上游渐变段中首断面距离 : derived.下游渐变段中首断面距离)
  const secondLength = cm(isUpstream ? derived.上游渐变段中末断面距离 : params.下游渐变段中末断面距离)

  const upper = transitionSection(params, derived, isUpstream, 'upper')
  const middle = transitionSection(params, derived, isUpstream, 'middle')
  const lower = transitionSection(params, derived, isUpstream, 'lower')

  const floorThick = cm(isUpstream ? params.上游渐变段断面铺盖厚 : params.下游渐变段断面铺盖厚)

  const totalLength = firstLength + secondLength
  const startZ = totalLength / 2
  const middleZ = startZ - firstLength
  const endZ = -totalLength / 2
  const frontMiddleZ = startZ - firstLength / 2
  const backMiddleZ = middleZ - secondLength / 2
  const guideWidth = Math.max(upper.floorWidth, middle.floorWidth, lower.floorWidth)

  // 为了保留 upper/middle/lower 的高亮区域  把连续渐变面拆为四段  视觉上仍是连续变宽
  const frontMiddle = mixSection(upper, middle, 0.5)
  const backMiddle = mixSection(middle, lower, 0.5)

  // 四段底板
  addTaperedSlab(context, 'upper', upper.floorWidth, frontMiddle.floorWidth, floorThick, startZ, frontMiddleZ)
  addTaperedSlab(context, 'middle', frontMiddle.floorWidth, middle.floorWidth, floorThick, frontMiddleZ, middleZ)
  addTaperedSlab(context, 'middle', middle.floorWidth, backMiddle.floorWidth, floorThick, middleZ, backMiddleZ)
  addTaperedSlab(context, 'lower', backMiddle.floorWidth, lower.floorWidth, floorThick, backMiddleZ, endZ)
  // 铺盖厚和纵向距离辅助区域   聚焦时显示  避免把尺寸参数误画成实体构件
  addBox(context, 'floor', guideWidth, floorThick * 0.45, totalLength, 0, floorThick * 0.75, 0, 0, 0, true)
  addBox(context, 'length', guideWidth * 0.08, floorThick * 0.7, firstLength, 0, floorThick * 1.15, startZ - firstLength / 2, 0, 0, true)

  // 四段侧坡
  addTransitionSlope(context, 'upper', upper, frontMiddle, startZ, frontMiddleZ, -1)
  addTransitionSlope(context, 'upper', upper, frontMiddle, startZ, frontMiddleZ, 1)
  addTransitionSlope(context, 'middle', frontMiddle, middle, frontMiddleZ, middleZ, -1)
  addTransitionSlope(context, 'middle', frontMiddle, middle, frontMiddleZ, middleZ, 1)
  addTransitionSlope(context, 'middle', middle, backMiddle, middleZ, backMiddleZ, -1)
  addTransitionSlope(context, 'middle', middle, backMiddle, middleZ, backMiddleZ, 1)
  addTransitionSlope(context, 'lower', backMiddle, lower, backMiddleZ, endZ, -1)
  addTransitionSlope(context, 'lower', backMiddle, lower, backMiddleZ, endZ, 1)

  const toeHeight = cm(isUpstream ? params.上游渐变段中断面趾高 : params.下游渐变段中断面趾高)
  const toeWidth = cm(isUpstream ? params.上游渐变段中断面趾宽 : params.下游渐变段中断面趾宽)
  const heelHeight = cm(isUpstream ? params.上游渐变段中断面踵高 : params.下游渐变段中断面踵高)
  const topHeight = cm(isUpstream ? params.上游渐变段中断面顶端高 : params.下游渐变段中断面顶端高)
  const topWidth = cm(isUpstream ? params.上游渐变段中断面顶端宽 : params.下游渐变段中断面顶端宽)
  addBox(context, 'toe', toeWidth, toeHeight, toeWidth, -middle.floorWidth / 2 - toeWidth / 2, floorThick / 2 + toeHeight / 2, middleZ, 0, 0, true)
  addBox(context, 'toe', toeWidth, toeHeight, toeWidth, middle.floorWidth / 2 + toeWidth / 2, floorThick / 2 + toeHeight / 2, middleZ, 0, 0, true)
  addBox(context, 'heel', topWidth, heelHeight, topWidth, -middle.floorWidth / 2 - middle.slopeWidth + topWidth / 2, middle.slopeHeight - heelHeight / 2, middleZ, 0, 0, true)
  addBox(context, 'heel', topWidth, heelHeight, topWidth, middle.floorWidth / 2 + middle.slopeWidth - topWidth / 2, middle.slopeHeight - heelHeight / 2, middleZ, 0, 0, true)
  addBox(context, 'wallTop', topWidth, topHeight, topWidth, -middle.floorWidth / 2 - middle.slopeWidth - topWidth / 2, middle.slopeHeight + topHeight / 2, middleZ, 0, 0, true)
  addBox(context, 'wallTop', topWidth, topHeight, topWidth, middle.floorWidth / 2 + middle.slopeWidth + topWidth / 2, middle.slopeHeight + topHeight / 2, middleZ, 0, 0, true)
  addBox(context, 'tooth', lower.floorWidth, cm(isUpstream ? params.上游渐变段铺盖齿墙高 : params.下游渐变段铺盖齿墙高), cm(isUpstream ? params.上游渐变段铺盖齿墙宽 : params.下游渐变段铺盖齿墙宽), 0, -floorThick / 2 - cm(isUpstream ? params.上游渐变段铺盖齿墙高 : params.下游渐变段铺盖齿墙高) / 2, endZ)
}

/**
 * 计算两个渐变断面之间的插值断面
 * 用于把连续渐变段拆成可高亮的几段  同时保持尺寸线性变化
 * @param start   起点断面
 * @param end     终点断面
 * @param ratio   插值比例  0 表示起点  1 表示终点
 */
function mixSection(start: TransitionSection, end: TransitionSection, ratio: number): TransitionSection {
  return {
    floorWidth: start.floorWidth + (end.floorWidth - start.floorWidth) * ratio,
    slopeWidth: start.slopeWidth + (end.slopeWidth - start.slopeWidth) * ratio,
    slopeHeight: start.slopeHeight + (end.slopeHeight - start.slopeHeight) * ratio,
  }
}

/**
 * 根据上下游方向和断面位置  取出渐变段对应断面的铺盖宽、坡宽和坡高
 * @param params
 * @param derived
 * @param isUpstream   是否为上游渐变段
 * @param section      断面位置：upper 上断面、middle 中断面、lower 下断面
 */
function transitionSection(
  params: SluicePreviewParameters,
  derived: DerivedValues,
  isUpstream: boolean,
  section: 'upper' | 'middle' | 'lower',
): TransitionSection {
  if (isUpstream && section === 'upper') {
    return {
      floorWidth: cm(params.上游渐变段上断面铺盖宽),
      slopeWidth: cm(params.上游渐变段上断面坡宽),
      slopeHeight: cm(params.上游渐变段上断面坡高),
    }
  }
  if (isUpstream && section === 'middle') {
    return {
      floorWidth: cm(derived.上游渐变段中断面铺盖宽),
      slopeWidth: cm(params.上游渐变段中断面坡宽),
      slopeHeight: cm(params.上游渐变段中断面坡高),
    }
  }
  if (isUpstream) {
    return {
      floorWidth: cm(derived.上游渐变段下断面铺盖宽),
      slopeWidth: cm(params.上游渐变段中断面坡宽),
      slopeHeight: cm(params.上游渐变段下断面坡高),
    }
  }
  if (section === 'upper') {
    return {
      floorWidth: cm(derived.下游渐变段上断面铺盖宽),
      slopeWidth: cm(params.下游渐变段中断面坡宽),
      slopeHeight: cm(derived.下游渐变段上断面坡高),
    }
  }
  if (section === 'middle') {
    return {
      floorWidth: cm(derived.下游渐变段中断面铺盖宽),
      slopeWidth: cm(params.下游渐变段中断面坡宽),
      slopeHeight: cm(derived.下游渐变段中断面坡高),
    }
  }
  return {
    floorWidth: cm(params.下游渐变段下断面铺盖宽),
    slopeWidth: cm(params.下游渐变段下断面坡宽),
    slopeHeight: cm(derived.下游渐变段中断面坡高),
  }
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
  context: PreviewContext,
  floorWidth: number,
  slopeWidth: number,
  slopeHeight: number,
  slopeThick: number,
  length: number,
  baseY: number,
  side: -1 | 1,
): void {
  const angle = Math.atan2(slopeHeight, slopeWidth)
  const slopeLength = Math.hypot(slopeWidth, slopeHeight)
  const x = side * (floorWidth / 2 + slopeWidth / 2)
  const y = baseY + slopeHeight / 2 + slopeThick / 2
  const rotateZ = side === 1 ? angle : Math.PI - angle
  addBox(context, 'slope', slopeLength, slopeThick, length, x, y, 0, rotateZ)
}

/**
 * 创建渐变段底板
 * 通过起点宽度和终点宽度生成梯形棱柱
 * @param context     目标场景上下文
 * @param region      区域标签（用于高亮匹配）
 * @param startWidth  起点铺盖宽
 * @param endWidth    终点铺盖宽
 * @param height      底板厚度
 * @param startZ      起点 Z 坐标
 * @param endZ        终点 Z 坐标
 */
function addTaperedSlab(
  context: PreviewContext,
  region: string,
  startWidth: number,
  endWidth: number,
  height: number,
  startZ: number,
  endZ: number,
): void {
  const yBottom = -height / 2
  const yTop = height / 2
  // 8 个顶点分别表示梯形底板的下表面和上表面
  const vertices = new Float32Array([
    -startWidth / 2, yBottom, startZ,
    startWidth / 2, yBottom, startZ,
    endWidth / 2, yBottom, endZ,
    -endWidth / 2, yBottom, endZ,
    -startWidth / 2, yTop, startZ,
    startWidth / 2, yTop, startZ,
    endWidth / 2, yTop, endZ,
    -endWidth / 2, yTop, endZ,
  ])
  // 每 3 个索引组成一个三角面  6 个面围成一个闭合梯形棱柱
  const indices = startZ > endZ ? [
    0, 2, 1, 0, 3, 2,
    4, 5, 6, 4, 6, 7,
    0, 5, 4, 0, 1, 5,
    1, 6, 5, 1, 2, 6,
    2, 7, 6, 2, 3, 7,
    3, 4, 7, 3, 0, 4,
  ] : [
    0, 1, 2, 0, 2, 3,
    4, 6, 5, 4, 7, 6,
    0, 4, 5, 0, 5, 1,
    1, 5, 6, 1, 6, 2,
    2, 6, 7, 2, 7, 3,
    3, 7, 4, 3, 4, 0,
  ]
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  addGeometry(context, region, geometry)
}

/**
 * 创建渐变段侧坡面
 * 起止断面宽度和坡高可不同  因此使用 BufferGeometry 直接连接四个断面点
 * @param context  目标场景上下文
 * @param region   区域标签（用于高亮匹配）
 * @param start    起点断面
 * @param end      终点断面
 * @param startZ   起点 Z 坐标
 * @param endZ     终点 Z 坐标
 * @param side     -1 表示左侧坡面  1 表示右侧坡面
 */
function addTransitionSlope(
  context: PreviewContext,
  region: string,
  start: TransitionSection,
  end: TransitionSection,
  startZ: number,
  endZ: number,
  side: -1 | 1,
): void {
  // 用四个点创建一个四边形坡面
  // 再把这个四边形拆成 2 个三角形
  // 最后添加至 Three.js 场景里
  const vertices = new Float32Array([
    side * start.floorWidth / 2, 0, startZ,
    side * end.floorWidth / 2, 0, endZ,
    side * (end.floorWidth / 2 + end.slopeWidth), end.slopeHeight, endZ,
    side * (start.floorWidth / 2 + start.slopeWidth), start.slopeHeight, startZ,
  ])
  // 左右两侧顶点顺序相反  索引方向也要反过来
  const indices = side === 1 ? [0, 1, 2, 0, 2, 3] : [0, 2, 1, 0, 3, 2]
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  addGeometry(context, region, geometry, true)
}

/**
 * 将 params.py 中的厘米尺寸换算为 Three.js 预览单位
 * 这里只做统一单位换算  最终显示大小由 fitPartToView 统一处理
 * @param value   厘米值
 */
function cm(value: number): number {
  return value * 0.01
}
