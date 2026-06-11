import { makeTransitionPreviewData } from '../data'
import { addXGuide, addYGuide, addZGuide } from './primitives'

/**
 * 创建上下游渐变段尺寸辅助线
 * 尺寸端点统一对齐 Inventor 八点挡墙断面和铺盖齿墙
 * @param context
 * @param params
 * @param derived
 * @param isUpstream
 */
export function addTransitionGuides(context, params, derived, isUpstream) {
  const {
    keys,
    firstLength,
    secondLength,
    floorThick,
    toothHeight,
    toothWidth,
    upper,
    middle,
    lower,
    startZ,
    middleZ,
    endZ,
  } = makeTransitionPreviewData(params, derived, isUpstream)
  const maxOuterX = Math.max(upper.outerX, middle.outerX, lower.outerX)
  const maxWidth = maxOuterX * 2
  const maxHeight = Math.max(
    upper.slopeHeight,
    middle.slopeHeight,
    lower.slopeHeight,
  )
  const maxSize = Math.max(firstLength + secondLength, maxWidth, maxHeight)
  const offset = Math.max(maxSize * 0.06, 0.18)
  const tickSize = Math.max(maxSize * 0.04, 0.18)
  const distanceStartZ = isUpstream ? startZ : middleZ
  const distanceEndZ = isUpstream ? middleZ : endZ

  addZGuide(
    context,
    keys.distance,
    -maxOuterX - offset,
    maxHeight + offset,
    distanceEndZ,
    distanceStartZ,
    tickSize,
  )
  addXGuide(
    context,
    keys.middleBottomWidth,
    middle.floorEdgeX,
    middle.outerBottomX,
    middle.wallBottomY - offset,
    middleZ,
    tickSize,
  )
  if (keys.middleSlopeHeight) {
    addYGuide(
      context,
      keys.middleSlopeHeight,
      middle.slopeTopX + offset,
      0,
      middle.slopeHeight,
      middleZ,
      tickSize,
    )
  }
  addXGuide(
    context,
    keys.middleSlopeWidth,
    middle.toeOuterX,
    middle.slopeTopX,
    middle.slopeHeight + offset,
    middleZ,
    tickSize,
  )
  addYGuide(
    context,
    keys.toeHeight,
    middle.toeOuterX + offset,
    middle.wallBottomY,
    0,
    middleZ,
    tickSize,
  )
  addXGuide(
    context,
    keys.toeWidth,
    middle.floorEdgeX,
    middle.toeOuterX,
    offset,
    middleZ,
    tickSize,
  )
  addYGuide(
    context,
    keys.heelHeight,
    middle.outerBottomX + offset,
    middle.wallBottomY,
    middle.heelTopY,
    middleZ,
    tickSize,
  )
  addYGuide(
    context,
    keys.topHeight,
    middle.topOuterX + offset,
    middle.topLowerY,
    middle.slopeHeight,
    middleZ,
    tickSize,
  )
  addXGuide(
    context,
    keys.topWidth,
    middle.slopeTopX,
    middle.topOuterX,
    middle.slopeHeight + offset,
    middleZ,
    tickSize,
  )

  if (keys.upperFloorWidth) {
    addXGuide(
      context,
      keys.upperFloorWidth,
      -upper.floorWidth / 2,
      upper.floorWidth / 2,
      offset,
      startZ,
      tickSize,
    )
  }
  addXGuide(
    context,
    keys.upperBottomWidth,
    upper.floorEdgeX,
    upper.outerBottomX,
    upper.wallBottomY - offset,
    startZ,
    tickSize,
  )
  if (keys.upperSlopeHeight) {
    addYGuide(
      context,
      keys.upperSlopeHeight,
      upper.slopeTopX + offset,
      0,
      upper.slopeHeight,
      startZ,
      tickSize,
    )
  }
  if (keys.upperSlopeWidth) {
    addXGuide(
      context,
      keys.upperSlopeWidth,
      upper.toeOuterX,
      upper.slopeTopX,
      upper.slopeHeight + offset,
      startZ,
      tickSize,
    )
  }

  if (keys.lowerFloorWidth) {
    addXGuide(
      context,
      keys.lowerFloorWidth,
      -lower.floorWidth / 2,
      lower.floorWidth / 2,
      offset,
      endZ,
      tickSize,
    )
  }
  addXGuide(
    context,
    keys.lowerBottomWidth,
    lower.floorEdgeX,
    lower.outerBottomX,
    lower.wallBottomY - offset,
    endZ,
    tickSize,
  )
  if (keys.lowerSlopeHeight) {
    addYGuide(
      context,
      keys.lowerSlopeHeight,
      lower.slopeTopX + offset,
      0,
      lower.slopeHeight,
      endZ,
      tickSize,
    )
  }
  if (keys.lowerSlopeWidth) {
    addXGuide(
      context,
      keys.lowerSlopeWidth,
      lower.toeOuterX,
      lower.slopeTopX,
      lower.slopeHeight + offset,
      endZ,
      tickSize,
    )
  }

  addYGuide(
    context,
    keys.floorThick,
    maxOuterX + offset,
    -floorThick,
    0,
    middleZ,
    tickSize,
  )
  addYGuide(
    context,
    keys.toothHeight,
    upper.floorWidth / 2 + offset,
    -floorThick - toothHeight,
    -floorThick,
    startZ,
    tickSize,
  )
  addYGuide(
    context,
    keys.toothHeight,
    lower.floorWidth / 2 + offset,
    -floorThick - toothHeight,
    -floorThick,
    endZ,
    tickSize,
  )
  addZGuide(
    context,
    keys.toothWidth,
    upper.floorWidth / 2 + offset,
    -floorThick - toothHeight,
    startZ - toothWidth,
    startZ,
    tickSize,
  )
  addZGuide(
    context,
    keys.toothWidth,
    lower.floorWidth / 2 + offset,
    -floorThick - toothHeight,
    endZ,
    endZ + toothWidth,
    tickSize,
  )
}
