import { makeTransitionPreviewData } from '../data'
import { addXGuide, addYGuide, addZGuide } from './primitives'

/**
 * 创建上下游渐变段尺寸辅助线
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
    toeHeight,
    toeWidth,
    heelHeight,
    topHeight,
    topWidth,
    toothHeight,
    toothWidth,
    upper,
    middle,
    lower,
    startZ,
    middleZ,
    endZ,
  } = makeTransitionPreviewData(params, derived, isUpstream)
  const distanceStartZ = isUpstream ? startZ : middleZ
  const distanceEndZ = isUpstream ? middleZ : endZ
  const maxWidth = Math.max(
    upper.floorWidth + upper.bottomWidth * 2 + upper.slopeWidth * 2,
    middle.floorWidth + middle.bottomWidth * 2 + middle.slopeWidth * 2,
    lower.floorWidth + lower.bottomWidth * 2 + lower.slopeWidth * 2,
  )
  const maxHeight = Math.max(
    upper.slopeHeight,
    middle.slopeHeight,
    lower.slopeHeight,
  )
  const maxSize = Math.max(firstLength + secondLength, maxWidth, maxHeight)
  const offset = Math.max(maxSize * 0.06, 0.18)
  const tickSize = Math.max(maxSize * 0.04, 0.18)
  const sideX = -maxWidth / 2 - offset
  addZGuide(
    context,
    keys.distance,
    sideX,
    floorThick + offset,
    distanceEndZ,
    distanceStartZ,
    tickSize,
  )
  addXGuide(
    context,
    keys.middleBottomWidth,
    middle.floorWidth / 2,
    middle.floorWidth / 2 + middle.bottomWidth,
    floorThick + offset,
    middleZ,
    tickSize,
  )
  if (keys.middleSlopeHeight) {
    addYGuide(
      context,
      keys.middleSlopeHeight,
      middle.floorWidth / 2 + middle.slopeWidth + offset,
      0,
      middle.slopeHeight,
      middleZ,
      tickSize,
    )
  }
  addXGuide(
    context,
    keys.middleSlopeWidth,
    middle.floorWidth / 2,
    middle.floorWidth / 2 + middle.slopeWidth,
    middle.slopeHeight + offset,
    middleZ,
    tickSize,
  )
  addYGuide(
    context,
    keys.toeHeight,
    middle.floorWidth / 2 + toeWidth + offset,
    floorThick / 2,
    floorThick / 2 + toeHeight,
    middleZ,
    tickSize,
  )
  addXGuide(
    context,
    keys.toeWidth,
    middle.floorWidth / 2,
    middle.floorWidth / 2 + toeWidth,
    floorThick / 2 + toeHeight + offset,
    middleZ,
    tickSize,
  )
  addYGuide(
    context,
    keys.heelHeight,
    middle.floorWidth / 2 + middle.slopeWidth - topWidth - offset,
    middle.slopeHeight - heelHeight,
    middle.slopeHeight,
    middleZ,
    tickSize,
  )
  addYGuide(
    context,
    keys.topHeight,
    middle.floorWidth / 2 + middle.slopeWidth + topWidth + offset,
    middle.slopeHeight,
    middle.slopeHeight + topHeight,
    middleZ,
    tickSize,
  )
  addXGuide(
    context,
    keys.topWidth,
    middle.floorWidth / 2 + middle.slopeWidth,
    middle.floorWidth / 2 + middle.slopeWidth + topWidth,
    middle.slopeHeight + topHeight + offset,
    middleZ,
    tickSize,
  )
  if (keys.upperFloorWidth) {
    addXGuide(
      context,
      keys.upperFloorWidth,
      -upper.floorWidth / 2,
      upper.floorWidth / 2,
      floorThick + offset,
      startZ,
      tickSize,
    )
  }
  addXGuide(
    context,
    keys.upperBottomWidth,
    upper.floorWidth / 2,
    upper.floorWidth / 2 + upper.bottomWidth,
    floorThick + offset * 1.5,
    startZ,
    tickSize,
  )
  if (keys.upperSlopeHeight) {
    addYGuide(
      context,
      keys.upperSlopeHeight,
      upper.floorWidth / 2 + upper.slopeWidth + offset,
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
      upper.floorWidth / 2,
      upper.floorWidth / 2 + upper.slopeWidth,
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
      floorThick + offset,
      endZ,
      tickSize,
    )
  }
  addXGuide(
    context,
    keys.lowerBottomWidth,
    lower.floorWidth / 2,
    lower.floorWidth / 2 + lower.bottomWidth,
    floorThick + offset * 1.5,
    endZ,
    tickSize,
  )
  if (keys.lowerSlopeHeight) {
    addYGuide(
      context,
      keys.lowerSlopeHeight,
      lower.floorWidth / 2 + lower.slopeWidth + offset,
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
      lower.floorWidth / 2,
      lower.floorWidth / 2 + lower.slopeWidth,
      lower.slopeHeight + offset,
      endZ,
      tickSize,
    )
  }
  addYGuide(
    context,
    keys.floorThick,
    maxWidth / 2 + offset,
    -floorThick / 2,
    floorThick / 2,
    middleZ,
    tickSize,
  )
  addYGuide(
    context,
    keys.toothHeight,
    lower.floorWidth / 2 + offset,
    -floorThick / 2 - toothHeight,
    -floorThick / 2,
    endZ,
    tickSize,
  )
  addZGuide(
    context,
    keys.toothWidth,
    lower.floorWidth / 2 + offset,
    -floorThick / 2,
    endZ - toothWidth / 2,
    endZ + toothWidth / 2,
    tickSize,
  )
}
