import * as THREE from 'three'
import { makeStillingPreviewData } from '../data'
import { addVectorGuide, addXGuide, addYGuide, addZGuide } from './primitives'

/**
 * 创建消力池尺寸辅助线
 * @param context
 * @param params
 * @param derived
 */
export function addStillingGuides(context, params, derived) {
  const {
    width,
    flatLength,
    slopeLength,
    length,
    slopeDrop,
    floorThick,
    wallHeight,
    slopeWallHeight,
    upperWallWidth,
    lowerWallWidth,
    inclinedWallHeight,
    floorWidth,
    verticalWallHeight,
    flatStartZ,
    flatEndZ,
    slopeEndZ,
    flatSlopeEndZ,
    toothHeight,
    toothWidth,
    sillHeight,
    sillWidth,
  } = makeStillingPreviewData(params, derived)
  const wallSectionZ = flatEndZ - Math.max(length * 0.015, 0.08)
  const maxSize = Math.max(floorWidth, length, wallHeight)
  const offset = Math.max(maxSize * 0.06, 0.18)
  const tickSize = Math.max(maxSize * 0.04, 0.18)
  addZGuide(
    context,
    '消力池陡坡段平直段长度',
    floorWidth / 2 + offset * 1.6,
    floorThick - offset,
    slopeEndZ,
    flatSlopeEndZ,
    tickSize,
  )
  addZGuide(
    context,
    '消力池陡坡段长度',
    floorWidth / 2 + offset,
    floorThick - offset,
    flatEndZ,
    slopeEndZ,
    tickSize,
  )
  // 高差两端位于不同断面   沿陡坡长度方向引出到尺寸线
  const slopeDropGuideX = floorWidth / 2
  const slopeDropGuideZ = slopeEndZ + offset * 1.5
  addVectorGuide(
    context,
    '消力池陡坡段高差',
    new THREE.Vector3(
      slopeDropGuideX,
      -slopeDrop + floorThick / 2,
      slopeDropGuideZ,
    ),
    new THREE.Vector3(slopeDropGuideX, floorThick / 2, slopeDropGuideZ),
    new THREE.Vector3(0, 0, 1),
    tickSize,
    new THREE.Vector3(slopeDropGuideX, -slopeDrop + floorThick / 2, flatEndZ),
    new THREE.Vector3(slopeDropGuideX, floorThick / 2, slopeEndZ),
  )
  addZGuide(
    context,
    '消力池长度',
    floorWidth / 2 + offset,
    -slopeDrop + floorThick,
    flatStartZ,
    flatEndZ,
    tickSize,
  )
  addYGuide(
    context,
    '消力池底板厚度',
    floorWidth / 2 + offset,
    -slopeDrop - floorThick / 2,
    -slopeDrop + floorThick / 2,
    flatEndZ,
    tickSize,
  )
  addZGuide(
    context,
    '消力池齿墙底宽',
    floorWidth / 2 + offset,
    -slopeDrop - floorThick / 2 - toothHeight,
    flatStartZ,
    flatStartZ + toothWidth,
    tickSize,
  )
  addYGuide(
    context,
    '消力池齿墙高度',
    floorWidth / 2 + offset * 1.5,
    -slopeDrop - floorThick / 2 - toothHeight,
    -slopeDrop - floorThick / 2,
    flatStartZ,
    tickSize,
  )
  addXGuide(
    context,
    '消力池陡坡段上部墙宽',
    -width / 2 - upperWallWidth,
    -width / 2,
    floorThick / 2 + slopeWallHeight,
    slopeEndZ + offset,
    tickSize,
  )
  addXGuide(
    context,
    '消力池陡坡段上部墙宽',
    width / 2,
    width / 2 + upperWallWidth,
    floorThick / 2 + slopeWallHeight,
    slopeEndZ + offset,
    tickSize,
  )
  addXGuide(
    context,
    '消力池陡坡段下部墙宽',
    -width / 2 - lowerWallWidth,
    -width / 2,
    floorThick / 2,
    slopeEndZ + offset,
    tickSize,
  )
  addXGuide(
    context,
    '消力池陡坡段下部墙宽',
    width / 2,
    width / 2 + lowerWallWidth,
    floorThick / 2,
    slopeEndZ + offset,
    tickSize,
  )
  addYGuide(
    context,
    '消力池墙高',
    floorWidth / 2 + offset,
    -slopeDrop + floorThick / 2,
    -slopeDrop + floorThick / 2 + wallHeight,
    wallSectionZ,
    tickSize,
  )
  addYGuide(
    context,
    '消力池斜墙段高度',
    floorWidth / 2 + offset,
    -slopeDrop + floorThick / 2 + verticalWallHeight,
    -slopeDrop + floorThick / 2 + verticalWallHeight + inclinedWallHeight,
    wallSectionZ,
    tickSize,
  )
  addYGuide(
    context,
    '消力坎高',
    floorWidth / 2 + offset * 1.5,
    -slopeDrop + floorThick / 2,
    -slopeDrop + floorThick / 2 + sillHeight,
    flatStartZ,
    tickSize,
  )
  addZGuide(
    context,
    '消力坎顶宽',
    floorWidth / 2 + offset,
    -slopeDrop + floorThick / 2 + sillHeight,
    flatStartZ,
    flatStartZ + sillWidth,
    tickSize,
  )
}
