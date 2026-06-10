import * as THREE from 'three'
import { addDimensionLine } from '../scene/objects'

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
export function addVectorGuide(
  context,
  key,
  start,
  end,
  tickAxis,
  tickSize,
  extensionStart,
  extensionEnd,
) {
  addDimensionLine(
    context,
    `${context.part}.${key}`,
    start,
    end,
    tickAxis,
    tickSize,
    extensionStart,
    extensionEnd,
  )
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
export function addXGuide(context, key, startX, endX, y, z, tickSize) {
  addVectorGuide(
    context,
    key,
    new THREE.Vector3(startX, y, z),
    new THREE.Vector3(endX, y, z),
    new THREE.Vector3(0, 0, 1),
    tickSize,
  )
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
export function addYGuide(context, key, x, startY, endY, z, tickSize) {
  addVectorGuide(
    context,
    key,
    new THREE.Vector3(x, startY, z),
    new THREE.Vector3(x, endY, z),
    new THREE.Vector3(1, 0, 0),
    tickSize,
  )
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
export function addZGuide(context, key, x, y, startZ, endZ, tickSize) {
  addVectorGuide(
    context,
    key,
    new THREE.Vector3(x, y, startZ),
    new THREE.Vector3(x, y, endZ),
    new THREE.Vector3(1, 0, 0),
    tickSize,
  )
}
