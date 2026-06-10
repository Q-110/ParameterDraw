import { makeGatePreviewData } from '../data'
import { addXGuide, addYGuide, addZGuide } from './primitives'

/**
 * 创建闸室尺寸辅助线
 * @param context
 * @param params
 * @param derived
 */
export function addGateGuides(context, params, derived) {
  const {
    width,
    length,
    floorThick,
    pierHeight,
    pierThick,
    openingWidth,
    doorWidth,
    doorDownstreamZ,
    doorUpstreamZ,
    slotDownstreamZ,
    serviceWidth,
    serviceThick,
    servicePierDepth,
    doorPierDepth,
    slotSecondWidth,
    toothHeight,
    toothWidth,
    firstOpeningX,
    topY,
    trafficBridge,
  } = makeGatePreviewData(params, derived)
  const maxSize = Math.max(width, length, pierHeight)
  const offset = Math.max(maxSize * 0.06, 0.1)
  const tickSize = Math.max(maxSize * 0.04, 0.1)
  const sideX = width / 2 + offset
  const frontZ = length / 2 + offset
  addZGuide(
    context,
    '闸室长',
    sideX,
    floorThick / 2,
    -length / 2,
    length / 2,
    tickSize,
  )
  addXGuide(
    context,
    '闸孔净宽',
    firstOpeningX - openingWidth / 2,
    firstOpeningX + openingWidth / 2,
    floorThick / 2,
    frontZ,
    tickSize,
  )
  addYGuide(
    context,
    '闸底板厚',
    sideX,
    -floorThick / 2,
    floorThick / 2,
    0,
    tickSize,
  )
  addXGuide(
    context,
    '边墩厚',
    -width / 2,
    -width / 2 + pierThick,
    topY,
    frontZ,
    tickSize,
  )
  addXGuide(
    context,
    '边墩厚',
    width / 2 - pierThick,
    width / 2,
    topY,
    frontZ,
    tickSize,
  )
  addYGuide(context, '闸墩高', sideX, floorThick / 2, topY, 0, tickSize)
  addYGuide(
    context,
    '齿墙高',
    width / 2 + offset,
    -floorThick / 2 - toothHeight,
    -floorThick / 2,
    -length / 2 + toothWidth / 2,
    tickSize,
  )
  addZGuide(
    context,
    '齿墙宽',
    width / 2 + offset,
    -floorThick,
    -length / 2,
    -length / 2 + toothWidth,
    tickSize,
  )
  addZGuide(
    context,
    '闸门距上游',
    firstOpeningX + doorWidth / 2 + offset,
    topY + offset,
    doorUpstreamZ,
    length / 2,
    tickSize,
  )
  addZGuide(
    context,
    '闸门厚',
    firstOpeningX + doorWidth / 2 + offset,
    topY,
    doorDownstreamZ,
    doorUpstreamZ,
    tickSize,
  )
  addXGuide(
    context,
    '门槽入闸墩深',
    firstOpeningX - openingWidth / 2 - doorPierDepth,
    firstOpeningX - openingWidth / 2,
    topY,
    doorUpstreamZ,
    tickSize,
  )
  addZGuide(
    context,
    '门槽深',
    firstOpeningX + doorWidth / 2 + offset,
    topY,
    slotDownstreamZ,
    doorUpstreamZ,
    tickSize,
  )
  addXGuide(
    context,
    '门槽二期宽',
    firstOpeningX - doorWidth / 2,
    firstOpeningX - doorWidth / 2 + slotSecondWidth,
    topY,
    slotDownstreamZ,
    tickSize,
  )
  addXGuide(
    context,
    '检修桥入闸墩深',
    -width / 2 + pierThick - servicePierDepth,
    -width / 2 + pierThick,
    topY + serviceThick,
    doorUpstreamZ,
    tickSize,
  )
  addYGuide(
    context,
    '检修桥板厚',
    width / 2 + offset,
    topY,
    topY + serviceThick,
    doorUpstreamZ,
    tickSize,
  )
  addZGuide(
    context,
    '检修桥板宽',
    sideX,
    topY + serviceThick,
    doorUpstreamZ - serviceWidth / 2,
    doorUpstreamZ + serviceWidth / 2,
    tickSize,
  )
  // 交通桥尺寸辅助线   始终创建   addDimensionLine 内部按有效性判断
  addZGuide(
    context,
    '交通桥宽',
    sideX,
    trafficBridge.topY,
    trafficBridge.downstreamZ,
    trafficBridge.upstreamZ,
    tickSize,
  )
  addYGuide(
    context,
    '交通桥厚',
    width / 2 + offset,
    topY + serviceThick,
    trafficBridge.topY,
    trafficBridge.downstreamZ / 2 + offset,
    tickSize,
  )
  addZGuide(
    context,
    '桥边距上游',
    width / 2 + offset,
    topY + offset,
    trafficBridge.upstreamZ,
    length / 2,
    tickSize,
  )
  addXGuide(
    context,
    '搭板长',
    width / 2,
    width / 2 + trafficBridge.approachSlabLength,
    trafficBridge.topY + offset,
    trafficBridge.downstreamZ,
    tickSize,
  )
  addXGuide(
    context,
    '交通桥护边厚',
    width / 2,
    width / 2 - trafficBridge.edgeThick,
    trafficBridge.topY,
    trafficBridge.downstreamZ / 2 + offset,
    tickSize,
  )
  addYGuide(
    context,
    '交通桥护边高',
    width / 2 + offset,
    trafficBridge.topY,
    trafficBridge.topY + trafficBridge.edgeHeight,
    trafficBridge.downstreamZ / 2 + offset,
    tickSize,
  )
}
