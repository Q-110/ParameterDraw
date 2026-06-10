import { makeGatePreviewData } from '../data'
import { addBox } from '../scene/objects'

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
    doorUpstreamZ,
    slotDepth,
    serviceWidth,
    serviceThick,
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
  // 闸门
  addBox(
    context,
    'door',
    doorWidth,
    pierHeight,
    doorThick,
    openingCenterX,
    floorThick / 2 + pierHeight / 2,
    doorUpstreamZ - doorThick / 2,
  )
  // 门槽
  addBox(
    context,
    'slot',
    doorWidth,
    pierHeight,
    slotDepth,
    openingCenterX,
    floorThick / 2 + pierHeight / 2,
    doorUpstreamZ - slotDepth / 2,
    0,
    0,
    true,
  )
  // 检修桥
  addBox(
    context,
    'serviceBridge',
    width - pierThick,
    serviceThick,
    serviceWidth,
    0,
    floorThick / 2 + pierHeight + serviceThick / 2,
    doorUpstreamZ,
  )
  // 交通桥   始终创建   addBox 内部按维度有效性判断
  addBox(
    context,
    'trafficBridge',
    width,
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
    -width / 2 - trafficBridge.approachSlabLength / 2,
    trafficBridge.centerY,
    trafficBridge.centerZ,
  )
  addBox(
    context,
    'approachSlab',
    trafficBridge.approachSlabLength,
    trafficBridge.thick,
    trafficBridge.width,
    width / 2 + trafficBridge.approachSlabLength / 2,
    trafficBridge.centerY,
    trafficBridge.centerZ,
  )
  // 齿墙
  addBox(
    context,
    'tooth',
    width,
    toothHeight,
    toothWidth,
    0,
    -floorThick / 2 - toothHeight / 2,
    -length / 2 + toothWidth / 2,
  )
}
