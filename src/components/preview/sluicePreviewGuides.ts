import * as THREE from 'three'
import type { DerivedValues, FieldGroup, PreviewParamKey, SluicePreviewParameters } from '../../types.js'
import { addDimensionLine, type PreviewContext } from './previewScene.js'

interface ConnectionGuideKeys {
  length: PreviewParamKey
  floorThick: PreviewParamKey
  toothHeight: PreviewParamKey
  toothWidth: PreviewParamKey
  pressWidth: PreviewParamKey
  ditchWidth: PreviewParamKey
  ditchHeight: PreviewParamKey
  ditchOuterWidth: PreviewParamKey
  slopeThick: PreviewParamKey
  slopeToothThick: PreviewParamKey
  slopeToothWidth: PreviewParamKey
}

interface TransitionGuideKeys {
  distance: PreviewParamKey
  middleBottomWidth: PreviewParamKey
  middleSlopeHeight?: PreviewParamKey
  middleSlopeWidth: PreviewParamKey
  toeHeight: PreviewParamKey
  toeWidth: PreviewParamKey
  heelHeight: PreviewParamKey
  topHeight: PreviewParamKey
  topWidth: PreviewParamKey
  upperFloorWidth?: PreviewParamKey
  upperBottomWidth: PreviewParamKey
  upperSlopeHeight?: PreviewParamKey
  upperSlopeWidth?: PreviewParamKey
  lowerFloorWidth?: PreviewParamKey
  lowerBottomWidth: PreviewParamKey
  lowerSlopeHeight?: PreviewParamKey
  lowerSlopeWidth?: PreviewParamKey
  floorThick: PreviewParamKey
  toothHeight: PreviewParamKey
  toothWidth: PreviewParamKey
}

interface TransitionSectionGuide {
  floorWidth: number
  bottomWidth: number
  slopeWidth: number
  slopeHeight: number
}

const upstreamConnectionKeys: ConnectionGuideKeys = {
  length: '上游连接段底板长度',
  floorThick: '上游连接段底板厚度',
  toothHeight: '上游连接段底板齿墙高',
  toothWidth: '上游连接段底板齿墙宽',
  pressWidth: '上游连接段坡顶压坡宽',
  ditchWidth: '上游连接段坡底槽宽',
  ditchHeight: '上游连接段坡底槽高',
  ditchOuterWidth: '上游连接段坡底外槽宽',
  slopeThick: '上游连接段坡板厚度',
  slopeToothThick: '上游连接段坡齿厚度',
  slopeToothWidth: '上游连接段坡齿宽度',
}

const downstreamConnectionKeys: ConnectionGuideKeys = {
  length: '下游连接段底板长度',
  floorThick: '下游连接段底板厚度',
  toothHeight: '下游连接段底板齿墙高',
  toothWidth: '下游连接段底板齿墙宽',
  pressWidth: '下游连接段坡顶压坡宽',
  ditchWidth: '下游连接段坡底槽宽',
  ditchHeight: '下游连接段坡底槽高',
  ditchOuterWidth: '下游连接段坡底外槽宽',
  slopeThick: '下游连接段坡板厚度',
  slopeToothThick: '下游连接段坡齿厚度',
  slopeToothWidth: '下游连接段坡齿宽度',
}

const upstreamTransitionKeys: TransitionGuideKeys = {
  distance: '上游渐变段中首断面距离',
  middleBottomWidth: '上游渐变段中断面底宽',
  middleSlopeHeight: '上游渐变段中断面坡高',
  middleSlopeWidth: '上游渐变段中断面坡宽',
  toeHeight: '上游渐变段中断面趾高',
  toeWidth: '上游渐变段中断面趾宽',
  heelHeight: '上游渐变段中断面踵高',
  topHeight: '上游渐变段中断面顶端高',
  topWidth: '上游渐变段中断面顶端宽',
  upperFloorWidth: '上游渐变段上断面铺盖宽',
  upperBottomWidth: '上游渐变段上断面底宽',
  upperSlopeHeight: '上游渐变段上断面坡高',
  upperSlopeWidth: '上游渐变段上断面坡宽',
  lowerBottomWidth: '上游渐变段下断面底宽',
  lowerSlopeHeight: '上游渐变段下断面坡高',
  floorThick: '上游渐变段断面铺盖厚',
  toothHeight: '上游渐变段铺盖齿墙高',
  toothWidth: '上游渐变段铺盖齿墙宽',
}

const downstreamTransitionKeys: TransitionGuideKeys = {
  distance: '下游渐变段中末断面距离',
  middleBottomWidth: '下游渐变段中断面底宽',
  middleSlopeWidth: '下游渐变段中断面坡宽',
  toeHeight: '下游渐变段中断面趾高',
  toeWidth: '下游渐变段中断面趾宽',
  heelHeight: '下游渐变段中断面踵高',
  topHeight: '下游渐变段中断面顶端高',
  topWidth: '下游渐变段中断面顶端宽',
  upperBottomWidth: '下游渐变段上断面底宽',
  lowerFloorWidth: '下游渐变段下断面铺盖宽',
  lowerBottomWidth: '下游渐变段下断面底宽',
  lowerSlopeWidth: '下游渐变段下断面坡宽',
  floorThick: '下游渐变段断面铺盖厚',
  toothHeight: '下游渐变段铺盖齿墙高',
  toothWidth: '下游渐变段铺盖齿墙宽',
}


// 所有需要生成 3D 尺寸辅助线的参数白名单
// 用于做强制校验
const explicitGuideKeys = new Set<string>([
  '闸室长',
  '闸孔净宽',
  '闸底板厚',
  '边墩厚',
  '中墙厚',
  '闸墩高',
  '齿墙高',
  '齿墙宽',
  '闸门距上游',
  '闸门厚',
  '门槽入闸墩深',
  '门槽深',
  '门槽二期宽',
  '检修桥入闸墩深',
  '检修桥板厚',
  '检修桥板宽',
  '交通桥宽',
  '交通桥厚',
  '桥边距上游',
  '搭板长',
  '交通桥护边厚',
  '交通桥护边高',
  ...Object.values(upstreamConnectionKeys),
  ...Object.values(downstreamConnectionKeys),
  ...Object.values(upstreamTransitionKeys).filter((key): key is PreviewParamKey => Boolean(key)),
  ...Object.values(downstreamTransitionKeys).filter((key): key is PreviewParamKey => Boolean(key)),
  '消力池陡坡段平直段长度',
  '消力池陡坡段长度',
  '消力池陡坡段高差',
  '消力池长度',
  '消力池底板厚度',
  '消力池齿墙底宽',
  '消力池齿墙高度',
  '消力池陡坡段上部墙宽',
  '消力池陡坡段下部墙宽',
  '消力池墙高',
  '消力池斜墙段高度',
  '消力坎高',
  '消力坎顶宽',
])

/**
 * 为当前部件创建全部显式尺寸辅助线
 * @param context
 * @param params
 * @param derived
 */
export function addSluicePreviewGuides(
  context: PreviewContext,
  params: SluicePreviewParameters,
  derived: DerivedValues,
  options: { groups: FieldGroup[]; showTrafficBridge: boolean },
): void {
  assertGuideCoverage(options.groups)

  if (context.part === 'gate') {
    addGateGuides(context, params, derived, options.showTrafficBridge)
  } else if (context.part === 'stilling') {
    addStillingGuides(context, params, derived)
  } else if (context.part === 'upstreamConnection') {
    addConnectionGuides(context, params, derived, upstreamConnectionKeys, true)
  } else if (context.part === 'downstreamConnection') {
    addConnectionGuides(context, params, derived, downstreamConnectionKeys, false)
  } else if (context.part === 'upstreamTransition') {
    addTransitionGuides(context, params, derived, upstreamTransitionKeys, true)
  } else {
    addTransitionGuides(context, params, derived, downstreamTransitionKeys, false)
  }
}

/**
 * 校验所有厘米字段都存在显式尺寸规则
 */
function assertGuideCoverage(groups: FieldGroup[]): void {
  const missing = groups.flatMap((group) => group.fields)
    .filter((field) => field.unit === 'cm' && !explicitGuideKeys.has(field.key))
    .map((field) => field.key)

  if (missing.length > 0) {
    throw new Error(`缺少预览尺寸规则 ${missing.join('  ')}`)
  }
}

/**
 * 创建闸室尺寸辅助线
 * @param context
 * @param params
 * @param derived
 */
function addGateGuides(
  context: PreviewContext,
  params: SluicePreviewParameters,
  derived: DerivedValues,
  showTrafficBridge: boolean,
): void {
  const width = cm(derived.闸总宽)
  const length = cm(params.闸室长)
  const floorThick = cm(params.闸底板厚)
  const pierHeight = cm(params.闸墩高)
  const pierThick = cm(params.边墩厚)
  const middlePierThick = cm(params.中墙厚)
  const openingWidth = cm(params.闸孔净宽)
  const doorWidth = cm(derived.闸门宽)
  const doorThick = cm(params.闸门厚)
  const doorUpstreamZ = length / 2 - cm(params.闸门距上游)
  const doorDownstreamZ = doorUpstreamZ - doorThick
  const slotDepth = cm(params.门槽深)
  const slotDownstreamZ = doorUpstreamZ - slotDepth
  const serviceWidth = cm(params.检修桥板宽)
  const serviceThick = cm(params.检修桥板厚)
  const firstOpeningX = -width / 2 + pierThick + openingWidth / 2
  const topY = floorThick / 2 + pierHeight
  const maxSize = Math.max(width, length, pierHeight)
  const offset = Math.max(maxSize * 0.06, 0.1)
  const tickSize = Math.max(maxSize * 0.04, 0.1)
  const sideX = width / 2 + offset
  const frontZ = length / 2 + offset

  addZGuide(context, '闸室长', sideX, floorThick / 2, -length / 2, length / 2, tickSize)
  addXGuide(context, '闸孔净宽', firstOpeningX - openingWidth / 2, firstOpeningX + openingWidth / 2, floorThick / 2, frontZ, tickSize)
  addYGuide(context, '闸底板厚', sideX, -floorThick / 2, floorThick / 2, 0, tickSize)
  addXGuide(context, '边墩厚', -width / 2, -width / 2 + pierThick, topY, frontZ, tickSize)
  addXGuide(context, '边墩厚', width / 2 - pierThick, width / 2, topY, frontZ, tickSize)

  if (params.闸孔数 > 1) {
    for (let index = 1; index < params.闸孔数; index += 1) {
      const middlePierX = firstOpeningX + openingWidth / 2 + middlePierThick / 2 + (openingWidth + middlePierThick) * (index - 1)
      addXGuide(context, '中墙厚', middlePierX - middlePierThick / 2, middlePierX + middlePierThick / 2, topY, frontZ, tickSize)
    }
  }

  addYGuide(context, '闸墩高', sideX, floorThick / 2, topY, 0, tickSize)
  addYGuide(context, '齿墙高', width / 2 + offset, -floorThick / 2 - cm(params.齿墙高), -floorThick / 2, -length / 2 + cm(params.齿墙宽) / 2, tickSize)
  addZGuide(context, '齿墙宽', width / 2 + offset, -floorThick, -length / 2, -length / 2 + cm(params.齿墙宽), tickSize)
  addZGuide(context, '闸门距上游', firstOpeningX + doorWidth / 2 + offset, topY + offset, doorUpstreamZ, length / 2, tickSize)
  addZGuide(context, '闸门厚', firstOpeningX + doorWidth / 2 + offset, topY, doorDownstreamZ, doorUpstreamZ, tickSize)
  addXGuide(context, '门槽入闸墩深', firstOpeningX - openingWidth / 2 - cm(params.门槽入闸墩深), firstOpeningX - openingWidth / 2, topY, doorUpstreamZ, tickSize)
  addZGuide(context, '门槽深', firstOpeningX + doorWidth / 2 + offset, topY, slotDownstreamZ, doorUpstreamZ, tickSize)
  addXGuide(context, '门槽二期宽', firstOpeningX - doorWidth / 2, firstOpeningX - doorWidth / 2 + cm(params.门槽二期宽), topY, slotDownstreamZ, tickSize)
  addXGuide(context, '检修桥入闸墩深', -width / 2 + pierThick - cm(params.检修桥入闸墩深), -width / 2 + pierThick, topY + serviceThick, doorUpstreamZ, tickSize)
  addYGuide(context, '检修桥板厚', width / 2 + offset, topY, topY + serviceThick, doorUpstreamZ, tickSize)
  addZGuide(context, '检修桥板宽', sideX, topY + serviceThick, doorUpstreamZ - serviceWidth / 2, doorUpstreamZ + serviceWidth / 2, tickSize)
  if (showTrafficBridge) {
    const trafficWidth = cm(params.交通桥宽)
    const trafficThick = cm(params.交通桥厚)
    const trafficUpstreamZ = length / 2 - cm(params.桥边距上游)
    const trafficDownstreamZ = trafficUpstreamZ - trafficWidth
    const bridgeTopY = topY + serviceThick + trafficThick
    addZGuide(context, '交通桥宽', sideX, bridgeTopY, trafficDownstreamZ, trafficUpstreamZ, tickSize)
    addYGuide(context, '交通桥厚', width / 2 + offset, topY + serviceThick, bridgeTopY, trafficDownstreamZ / 2 + offset, tickSize)
    addZGuide(context, '桥边距上游', width / 2 + offset, topY + offset, trafficUpstreamZ, length / 2, tickSize)
    addXGuide(context, '搭板长', width / 2, width / 2 + cm(params.搭板长), bridgeTopY + offset, trafficDownstreamZ, tickSize)
    addXGuide(context, '交通桥护边厚', width / 2, width / 2 - cm(params.交通桥护边厚), bridgeTopY, trafficDownstreamZ / 2 + offset, tickSize)
    addYGuide(context, '交通桥护边高', width / 2 + offset, bridgeTopY, bridgeTopY + cm(params.交通桥护边高), trafficDownstreamZ / 2 + offset, tickSize)
  }
}

/**
 * 创建消力池尺寸辅助线
 * @param context
 * @param params
 * @param derived
 */
function addStillingGuides(context: PreviewContext, params: SluicePreviewParameters, derived: DerivedValues): void {
  const width = cm(derived.消力池底板宽度)
  const flatLength = cm(params.消力池长度)
  const slopeLength = cm(params.消力池陡坡段长度)
  const flatSlopeLength = cm(params.消力池陡坡段平直段长度)
  const slopeDrop = cm(params.消力池陡坡段高差)
  const floorThick = cm(params.消力池底板厚度)
  const wallHeight = cm(params.消力池墙高)
  const slopeWallHeight = cm(derived.消力池陡坡段墙高)
  const upperWallWidth = cm(params.消力池陡坡段上部墙宽)
  const lowerWallWidth = cm(params.消力池陡坡段下部墙宽)
  const totalLength = flatLength + slopeLength + flatSlopeLength
  const flatStartZ = -totalLength / 2
  const flatEndZ = flatStartZ + flatLength
  const slopeEndZ = flatEndZ + slopeLength
  const flatSlopeEndZ = totalLength / 2
  const wallSectionZ = flatEndZ - Math.max(totalLength * 0.015, 0.08)
  const maxSize = Math.max(width, totalLength, wallHeight)
  const offset = Math.max(maxSize * 0.06, 0.18)
  const tickSize = Math.max(maxSize * 0.04, 0.18)

  addZGuide(context, '消力池陡坡段平直段长度', width / 2 + offset * 1.6, floorThick - offset, slopeEndZ, flatSlopeEndZ, tickSize)
  addZGuide(context, '消力池陡坡段长度', width / 2 + offset, floorThick - offset, flatEndZ, slopeEndZ, tickSize)
  // 高差两端位于不同断面   沿陡坡长度方向引出到尺寸线
  const slopeDropGuideX = width / 2
  const slopeDropGuideZ = slopeEndZ + offset * 1.5
  addVectorGuide(
    context,
    '消力池陡坡段高差',
    new THREE.Vector3(slopeDropGuideX, -slopeDrop + floorThick / 2, slopeDropGuideZ),
    new THREE.Vector3(slopeDropGuideX, floorThick / 2, slopeDropGuideZ),
    new THREE.Vector3(0, 0, 1),
    tickSize,
    new THREE.Vector3(slopeDropGuideX, -slopeDrop + floorThick / 2, flatEndZ),
    new THREE.Vector3(slopeDropGuideX, floorThick / 2, slopeEndZ),
  )
  addZGuide(context, '消力池长度', width / 2 + offset, -slopeDrop + floorThick, flatStartZ, flatEndZ, tickSize)
  addYGuide(context, '消力池底板厚度', width / 2 + offset, -slopeDrop - floorThick / 2, -slopeDrop + floorThick / 2, flatEndZ, tickSize)
  addZGuide(context, '消力池齿墙底宽', width / 2 + offset, -slopeDrop - floorThick / 2, flatStartZ, flatStartZ + cm(params.消力池齿墙底宽), tickSize)
  addYGuide(context, '消力池齿墙高度', width / 2 + offset * 1.5, -slopeDrop - floorThick / 2 - cm(params.消力池齿墙高度), -slopeDrop - floorThick / 2, flatStartZ, tickSize)
  addXGuide(context, '消力池陡坡段上部墙宽', -width / 2 - upperWallWidth, -width / 2, floorThick / 2 + slopeWallHeight, slopeEndZ + offset, tickSize)
  addXGuide(context, '消力池陡坡段上部墙宽', width / 2, width / 2 + upperWallWidth, floorThick / 2 + slopeWallHeight, slopeEndZ + offset, tickSize)
  addXGuide(context, '消力池陡坡段下部墙宽', -width / 2 - lowerWallWidth, -width / 2, floorThick / 2, slopeEndZ + offset, tickSize)
  addXGuide(context, '消力池陡坡段下部墙宽', width / 2, width / 2 + lowerWallWidth, floorThick / 2, slopeEndZ + offset, tickSize)
  addYGuide(context, '消力池墙高', width / 2 + lowerWallWidth + offset, -slopeDrop + floorThick / 2, -slopeDrop + floorThick / 2 + wallHeight, wallSectionZ, tickSize)
  addYGuide(context, '消力池斜墙段高度', width / 2 + lowerWallWidth + offset, -slopeDrop + floorThick / 2, -slopeDrop + floorThick / 2 + cm(params.消力池斜墙段高度), wallSectionZ, tickSize)
  addYGuide(context, '消力坎高', width / 2 + offset * 1.5, -slopeDrop + floorThick / 2, -slopeDrop + floorThick / 2 + cm(params.消力坎高), flatStartZ, tickSize)
  addZGuide(context, '消力坎顶宽', width / 2 + offset, -slopeDrop + cm(params.消力坎高), flatStartZ, flatStartZ + cm(params.消力坎顶宽), tickSize)
}

/**
 * 创建上下游连接段尺寸辅助线
 * @param context
 * @param params
 * @param derived
 * @param keys
 * @param isUpstream
 */
function addConnectionGuides(
  context: PreviewContext,
  params: SluicePreviewParameters,
  derived: DerivedValues,
  keys: ConnectionGuideKeys,
  isUpstream: boolean,
): void {
  const length = cm(params[keys.length])
  const floorThick = cm(params[keys.floorThick])
  const toothHeight = cm(params[keys.toothHeight])
  const toothWidth = cm(params[keys.toothWidth])
  const pressWidth = cm(params[keys.pressWidth])
  const ditchWidth = cm(params[keys.ditchWidth])
  const ditchHeight = cm(params[keys.ditchHeight])
  const ditchOuterWidth = cm(params[keys.ditchOuterWidth])
  const slopeThick = cm(params[keys.slopeThick])
  const slopeToothThick = cm(params[keys.slopeToothThick])
  const slopeToothWidth = cm(params[keys.slopeToothWidth])
  const floorWidth = cm(isUpstream ? derived.上游连接段渠底板宽 : derived.下游连接段渠底板宽)
  const slopeWidth = cm(isUpstream ? derived.上游连接段坡面宽度 : derived.下游连接段坡面宽度)
  const slopeHeight = cm(isUpstream ? derived.上游连接段坡面高度 : derived.下游连接段坡面高度)
  const floorTopY = floorThick / 2
  const ditchBottomY = floorTopY - ditchHeight
  const floorBottomY = ditchBottomY - floorThick
  const innerDitchX = floorWidth / 2 - ditchWidth
  const floorEdgeX = floorWidth / 2
  const outerDitchX = floorEdgeX + ditchOuterWidth
  const maxSize = Math.max(length, outerDitchX * 2 + slopeWidth * 2, slopeHeight)
  const offset = Math.max(maxSize * 0.06, 0.18)
  const tickSize = Math.max(maxSize * 0.04, 0.18)
  const outerSlopeX = outerDitchX + slopeWidth
  const slopeAngle = Math.atan2(slopeHeight, slopeWidth)
  const slopeLength = Math.hypot(slopeWidth, slopeHeight)
  const slopeDirection = new THREE.Vector3(Math.cos(slopeAngle), Math.sin(slopeAngle), 0)
  const slopeNormal = new THREE.Vector3(-Math.sin(slopeAngle), Math.cos(slopeAngle), 0)
  const slopeMiddle = new THREE.Vector3(outerDitchX + slopeWidth / 2, ditchBottomY + slopeHeight / 2 + slopeThick / 2, length / 2)
  const toothMiddle = new THREE.Vector3(outerDitchX, ditchBottomY + slopeThick / 2, length / 2)
    .addScaledVector(slopeDirection, slopeLength * 0.25)
    .addScaledVector(slopeNormal, -(slopeThick + slopeToothThick) / 2)

  // 底板长度
  addZGuide(context, keys.length, floorWidth / 2 + offset, floorThick / 2, -length / 2, length / 2, tickSize)
  // 底板厚度
  addYGuide(context, keys.floorThick, floorEdgeX, floorBottomY, ditchBottomY, length / 2, tickSize)
  // 齿墙高/宽
  addYGuide(context, keys.toothHeight, floorWidth / 2 + offset, floorBottomY - toothHeight, floorBottomY, -length / 2 + toothWidth / 2, tickSize)
  addZGuide(context, keys.toothWidth, floorWidth / 2 + offset, floorBottomY - toothHeight, -length / 2, -length / 2 + toothWidth, tickSize)
  // 压坡宽
  addXGuide(context, keys.pressWidth, outerSlopeX, outerSlopeX + pressWidth, ditchBottomY + slopeHeight, length / 2 + offset, tickSize)
  // 坡底槽宽
  addXGuide(context, keys.ditchWidth, innerDitchX, floorEdgeX, ditchBottomY - offset, length / 2, tickSize)
  // 坡底槽高
  addYGuide(context, keys.ditchHeight, innerDitchX - offset, ditchBottomY, floorTopY, length / 2, tickSize)
  // 坡底外槽宽
  addXGuide(context, keys.ditchOuterWidth, floorEdgeX, outerDitchX, ditchBottomY - offset, length / 2, tickSize)
  // 坡板厚度
  addVectorGuide(context, keys.slopeThick, slopeMiddle.clone().addScaledVector(slopeNormal, -slopeThick / 2), slopeMiddle.clone().addScaledVector(slopeNormal, slopeThick / 2), slopeDirection, tickSize)
  // 坡齿
  addVectorGuide(context, keys.slopeToothThick, toothMiddle.clone().addScaledVector(slopeNormal, -slopeToothThick / 2), toothMiddle.clone().addScaledVector(slopeNormal, slopeToothThick / 2), slopeDirection, tickSize)
  addVectorGuide(context, keys.slopeToothWidth, toothMiddle.clone().addScaledVector(slopeDirection, -slopeToothWidth / 2), toothMiddle.clone().addScaledVector(slopeDirection, slopeToothWidth / 2), slopeNormal, tickSize)
}

/**
 * 创建上下游渐变段尺寸辅助线
 * @param context
 * @param params
 * @param derived
 * @param keys
 * @param isUpstream
 */
function addTransitionGuides(
  context: PreviewContext,
  params: SluicePreviewParameters,
  derived: DerivedValues,
  keys: TransitionGuideKeys,
  isUpstream: boolean,
): void {
  const firstLength = cm(isUpstream ? params.上游渐变段中首断面距离 : derived.下游渐变段中首断面距离)
  const secondLength = cm(isUpstream ? derived.上游渐变段中末断面距离 : params.下游渐变段中末断面距离)
  const floorThick = cm(params[keys.floorThick])
  const toeHeight = cm(params[keys.toeHeight])
  const toeWidth = cm(params[keys.toeWidth])
  const heelHeight = cm(params[keys.heelHeight])
  const topHeight = cm(params[keys.topHeight])
  const topWidth = cm(params[keys.topWidth])
  const upper = transitionGuideSection(params, derived, isUpstream, 'upper')
  const middle = transitionGuideSection(params, derived, isUpstream, 'middle')
  const lower = transitionGuideSection(params, derived, isUpstream, 'lower')
  const startZ = (firstLength + secondLength) / 2
  const middleZ = startZ - firstLength
  const endZ = -(firstLength + secondLength) / 2
  const distanceStartZ = isUpstream ? startZ : middleZ
  const distanceEndZ = isUpstream ? middleZ : endZ
  const maxWidth = Math.max(
    upper.floorWidth + upper.bottomWidth * 2 + upper.slopeWidth * 2,
    middle.floorWidth + middle.bottomWidth * 2 + middle.slopeWidth * 2,
    lower.floorWidth + lower.bottomWidth * 2 + lower.slopeWidth * 2,
  )
  const maxHeight = Math.max(upper.slopeHeight, middle.slopeHeight, lower.slopeHeight)
  const maxSize = Math.max(firstLength + secondLength, maxWidth, maxHeight)
  const offset = Math.max(maxSize * 0.06, 0.18)
  const tickSize = Math.max(maxSize * 0.04, 0.18)
  const sideX = -maxWidth / 2 - offset

  addZGuide(context, keys.distance, sideX, floorThick + offset, distanceEndZ, distanceStartZ, tickSize)
  addXGuide(context, keys.middleBottomWidth, middle.floorWidth / 2, middle.floorWidth / 2 + middle.bottomWidth, floorThick + offset, middleZ, tickSize)
  if (keys.middleSlopeHeight) {
    addYGuide(context, keys.middleSlopeHeight, middle.floorWidth / 2 + middle.slopeWidth + offset, 0, middle.slopeHeight, middleZ, tickSize)
  }
  addXGuide(context, keys.middleSlopeWidth, middle.floorWidth / 2, middle.floorWidth / 2 + middle.slopeWidth, middle.slopeHeight + offset, middleZ, tickSize)
  addYGuide(context, keys.toeHeight, middle.floorWidth / 2 + toeWidth + offset, floorThick / 2, floorThick / 2 + toeHeight, middleZ, tickSize)
  addXGuide(context, keys.toeWidth, middle.floorWidth / 2, middle.floorWidth / 2 + toeWidth, floorThick / 2 + toeHeight + offset, middleZ, tickSize)
  addYGuide(context, keys.heelHeight, middle.floorWidth / 2 + middle.slopeWidth - topWidth - offset, middle.slopeHeight - heelHeight, middle.slopeHeight, middleZ, tickSize)
  addYGuide(context, keys.topHeight, middle.floorWidth / 2 + middle.slopeWidth + topWidth + offset, middle.slopeHeight, middle.slopeHeight + topHeight, middleZ, tickSize)
  addXGuide(context, keys.topWidth, middle.floorWidth / 2 + middle.slopeWidth, middle.floorWidth / 2 + middle.slopeWidth + topWidth, middle.slopeHeight + topHeight + offset, middleZ, tickSize)

  if (keys.upperFloorWidth) {
    addXGuide(context, keys.upperFloorWidth, -upper.floorWidth / 2, upper.floorWidth / 2, floorThick + offset, startZ, tickSize)
  }
  addXGuide(context, keys.upperBottomWidth, upper.floorWidth / 2, upper.floorWidth / 2 + upper.bottomWidth, floorThick + offset * 1.5, startZ, tickSize)
  if (keys.upperSlopeHeight) {
    addYGuide(context, keys.upperSlopeHeight, upper.floorWidth / 2 + upper.slopeWidth + offset, 0, upper.slopeHeight, startZ, tickSize)
  }
  if (keys.upperSlopeWidth) {
    addXGuide(context, keys.upperSlopeWidth, upper.floorWidth / 2, upper.floorWidth / 2 + upper.slopeWidth, upper.slopeHeight + offset, startZ, tickSize)
  }
  if (keys.lowerFloorWidth) {
    addXGuide(context, keys.lowerFloorWidth, -lower.floorWidth / 2, lower.floorWidth / 2, floorThick + offset, endZ, tickSize)
  }
  addXGuide(context, keys.lowerBottomWidth, lower.floorWidth / 2, lower.floorWidth / 2 + lower.bottomWidth, floorThick + offset * 1.5, endZ, tickSize)
  if (keys.lowerSlopeHeight) {
    addYGuide(context, keys.lowerSlopeHeight, lower.floorWidth / 2 + lower.slopeWidth + offset, 0, lower.slopeHeight, endZ, tickSize)
  }
  if (keys.lowerSlopeWidth) {
    addXGuide(context, keys.lowerSlopeWidth, lower.floorWidth / 2, lower.floorWidth / 2 + lower.slopeWidth, lower.slopeHeight + offset, endZ, tickSize)
  }

  addYGuide(context, keys.floorThick, maxWidth / 2 + offset, -floorThick / 2, floorThick / 2, middleZ, tickSize)
  addYGuide(context, keys.toothHeight, lower.floorWidth / 2 + offset, -floorThick / 2 - cm(params[keys.toothHeight]), -floorThick / 2, endZ, tickSize)
  addZGuide(context, keys.toothWidth, lower.floorWidth / 2 + offset, -floorThick / 2, endZ - cm(params[keys.toothWidth]) / 2, endZ + cm(params[keys.toothWidth]) / 2, tickSize)
}

/**
 * 计算渐变段断面辅助线基准
 * @param params
 * @param derived
 * @param isUpstream
 * @param section
 */
function transitionGuideSection(
  params: SluicePreviewParameters,
  derived: DerivedValues,
  isUpstream: boolean,
  section: 'upper' | 'middle' | 'lower',
): TransitionSectionGuide {
  if (isUpstream && section === 'upper') {
    return {
      floorWidth: cm(params.上游渐变段上断面铺盖宽),
      bottomWidth: cm(params.上游渐变段上断面底宽),
      slopeWidth: cm(params.上游渐变段上断面坡宽),
      slopeHeight: cm(params.上游渐变段上断面坡高),
    }
  }
  if (isUpstream && section === 'middle') {
    return {
      floorWidth: cm(derived.上游渐变段中断面铺盖宽),
      bottomWidth: cm(params.上游渐变段中断面底宽),
      slopeWidth: cm(params.上游渐变段中断面坡宽),
      slopeHeight: cm(params.上游渐变段中断面坡高),
    }
  }
  if (isUpstream) {
    return {
      floorWidth: cm(derived.上游渐变段下断面铺盖宽),
      bottomWidth: cm(params.上游渐变段下断面底宽),
      slopeWidth: cm(params.上游渐变段中断面坡宽),
      slopeHeight: cm(params.上游渐变段下断面坡高),
    }
  }
  if (section === 'upper') {
    return {
      floorWidth: cm(derived.下游渐变段上断面铺盖宽),
      bottomWidth: cm(params.下游渐变段上断面底宽),
      slopeWidth: cm(params.下游渐变段中断面坡宽),
      slopeHeight: cm(derived.下游渐变段上断面坡高),
    }
  }
  if (section === 'middle') {
    return {
      floorWidth: cm(derived.下游渐变段中断面铺盖宽),
      bottomWidth: cm(params.下游渐变段中断面底宽),
      slopeWidth: cm(params.下游渐变段中断面坡宽),
      slopeHeight: cm(derived.下游渐变段中断面坡高),
    }
  }
  return {
    floorWidth: cm(params.下游渐变段下断面铺盖宽),
    bottomWidth: cm(params.下游渐变段下断面底宽),
    slopeWidth: cm(params.下游渐变段下断面坡宽),
    slopeHeight: cm(derived.下游渐变段中断面坡高),
  }
}

/**
 * 创建任意方向尺寸辅助线
 * @param context
 * @param key
 * @param start
 * @param end
 * @param tickAxis
 * @param tickSize
 * @param extensionStart
 * @param extensionEnd
 */
function addVectorGuide(
  context: PreviewContext,
  key: PreviewParamKey,
  start: THREE.Vector3,
  end: THREE.Vector3,
  tickAxis: THREE.Vector3,
  tickSize: number,
  extensionStart?: THREE.Vector3,
  extensionEnd?: THREE.Vector3,
): void {
  addDimensionLine(context, `${context.part}.${key}`, start, end, tickAxis, tickSize, extensionStart, extensionEnd)
}

/**
 * 创建 X 方向尺寸辅助线
 * @param context
 * @param key
 * @param startX
 * @param endX
 * @param y
 * @param z
 * @param tickSize
 */
function addXGuide(context: PreviewContext, key: PreviewParamKey, startX: number, endX: number, y: number, z: number, tickSize: number): void {
  addVectorGuide(context, key, new THREE.Vector3(startX, y, z), new THREE.Vector3(endX, y, z), new THREE.Vector3(0, 0, 1), tickSize)
}

/**
 * 创建 Y 方向尺寸辅助线
 * @param context
 * @param key
 * @param x
 * @param startY
 * @param endY
 * @param z
 * @param tickSize
 */
function addYGuide(context: PreviewContext, key: PreviewParamKey, x: number, startY: number, endY: number, z: number, tickSize: number): void {
  addVectorGuide(context, key, new THREE.Vector3(x, startY, z), new THREE.Vector3(x, endY, z), new THREE.Vector3(1, 0, 0), tickSize)
}

/**
 * 创建 Z 方向尺寸辅助线
 * @param context
 * @param key
 * @param x
 * @param y
 * @param startZ
 * @param endZ
 * @param tickSize
 */
function addZGuide(context: PreviewContext, key: PreviewParamKey, x: number, y: number, startZ: number, endZ: number, tickSize: number): void {
  addVectorGuide(context, key, new THREE.Vector3(x, y, startZ), new THREE.Vector3(x, y, endZ), new THREE.Vector3(1, 0, 0), tickSize)
}

/**
 * 将厘米尺寸换算为预览单位
 * @param value
 */
function cm(value: number): number {
  return value * 0.01
}
