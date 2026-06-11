import * as THREE from 'three'
import { makeConnectionPreviewData } from '../data'
import { addGeometry } from '../scene/objects'

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
    slopeHeight,
    slopeToothWidth,
    toothHeight: toothHigh,
    toothWidth: toothWide,
    floorTopY,
    ditchBottomY,
    floorBottomY,
    floorEdgeX,
    ditchOuterX,
    slopeLowerFootX,
    slopeLowerFootY,
    slopeTopX,
    pressOuterX,
    pressBottomY,
    slopeLowerTopX,
    slopeToothInnerX,
    slopeToothInnerY,
    slopeToothOuterY,
  } = makeConnectionPreviewData(params, derived, isUpstream)
  const toothBottomY = floorBottomY - toothHigh
  const floorProfile = [
    [-length / 2, floorTopY],
    [length / 2, floorTopY],
    [length / 2, toothBottomY],
    [length / 2 - toothWide, toothBottomY],
    [length / 2 - toothWide - toothHigh, floorBottomY],
    [-length / 2 + toothWide + toothHigh, floorBottomY],
    [-length / 2 + toothWide, toothBottomY],
    [-length / 2, toothBottomY],
  ]
  const floorGeometry = createPrismGeometry(floorProfile, width)
  floorGeometry.rotateY(Math.PI / 2)
  addGeometry(context, 'floor', floorGeometry)
  for (const side of [-1, 1]) {
    const endX = side * length / 2
    const toothInnerX = endX - side * toothWide
    const transitionInnerX = toothInnerX - side * toothHigh
    const toothProfile = [
      [transitionInnerX, floorBottomY],
      [toothInnerX, toothBottomY],
      [endX, toothBottomY],
      [endX, floorBottomY],
    ]
    const toothGeometry = createPrismGeometry(toothProfile, width)
    toothGeometry.rotateY(Math.PI / 2)
    addGeometry(context, 'tooth', toothGeometry, false, true)
  }

  const slopeProfile = [
    [floorEdgeX, floorTopY],
    [slopeTopX, slopeHeight],
    [pressOuterX, slopeHeight],
    [pressOuterX, pressBottomY],
    [slopeLowerTopX, pressBottomY],
    [slopeLowerFootX, slopeLowerFootY],
    [ditchOuterX, ditchBottomY],
    [floorEdgeX, ditchBottomY],
  ]
  const slopeToothProfile = [
    [slopeLowerFootX, slopeLowerFootY],
    [slopeLowerTopX, pressBottomY],
    [pressOuterX, pressBottomY],
    [pressOuterX, slopeToothOuterY],
    [slopeToothInnerX, slopeToothInnerY],
  ]
  const ditchProfile = [
    [floorEdgeX, floorTopY],
    [slopeLowerFootX, slopeLowerFootY],
    [ditchOuterX, ditchBottomY],
    [floorEdgeX, ditchBottomY],
  ]

  const slopeGeometries = []
  for (const side of [-1, 1]) {
    const sideSlopeProfile = slopeProfile.map(([x, y]) => [side * x, y])
    const sideToothProfile = slopeToothProfile.map(([x, y]) => [side * x, y])
    const sideDitchProfile = ditchProfile.map(([x, y]) => [side * x, y])
    slopeGeometries.push(
      createPrismGeometry(sideSlopeProfile, length),
      createPrismGeometry(
        sideToothProfile,
        slopeToothWidth,
        -length / 2 + slopeToothWidth / 2,
      ),
      createPrismGeometry(
        sideToothProfile,
        slopeToothWidth,
        length / 2 - slopeToothWidth / 2,
      ),
    )
    addGeometry(
      context,
      'ditch',
      createPrismGeometry(sideDitchProfile, length),
      false,
      true,
    )
  }
  addGeometry(context, 'slope', mergePrismGeometries(slopeGeometries))
}

/**
 * 创建二维轮廓棱柱
 * 轮廓统一整理为逆时针   三角面按实体外部方向排列
 * 返回非索引几何   保证每个三角面使用独立法线
 * @param profile   XY 平面轮廓点
 * @param depth     Z 轴拉伸长度
 * @param centerZ   Z 轴中心位置
 */
function createPrismGeometry(profile, depth, centerZ = 0) {
  const points = profile.map(([x, y]) => [x, y])
  const area = points.reduce((sum, point, index) => {
    const next = points[(index + 1) % points.length]
    return sum + point[0] * next[1] - next[0] * point[1]
  }, 0)
  if (area < 0) {
    points.reverse()
  }

  const halfDepth = depth / 2
  const positions = []
  for (const z of [centerZ - halfDepth, centerZ + halfDepth]) {
    points.forEach(([x, y]) => positions.push(x, y, z))
  }
  const capTriangles = THREE.ShapeUtils.triangulateShape(
    points.map(([x, y]) => new THREE.Vector2(x, y)),
    [],
  )
  const indices = []
  capTriangles.forEach(([a, b, c]) => {
    const cross =
      (points[b][0] - points[a][0]) * (points[c][1] - points[a][1]) -
      (points[b][1] - points[a][1]) * (points[c][0] - points[a][0])
    const front = cross > 0 ? [a, b, c] : [a, c, b]
    indices.push(front[0], front[2], front[1])
    indices.push(
      front[0] + points.length,
      front[1] + points.length,
      front[2] + points.length,
    )
  })
  points.forEach((point, index) => {
    const next = (index + 1) % points.length
    indices.push(
      index,
      next,
      next + points.length,
      index,
      next + points.length,
      index + points.length,
    )
  })

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(positions, 3),
  )
  geometry.setIndex(indices)
  const nonIndexed = geometry.toNonIndexed()
  geometry.dispose()
  nonIndexed.computeVertexNormals()
  return nonIndexed
}

/**
 * 合并坡板和坡齿几何
 * 仅拼接非索引顶点与法线   不共享跨面顶点
 * @param geometries   待合并棱体
 */
function mergePrismGeometries(geometries) {
  const positions = []
  const normals = []
  geometries.forEach((geometry) => {
    positions.push(...geometry.getAttribute('position').array)
    normals.push(...geometry.getAttribute('normal').array)
    geometry.dispose()
  })
  const merged = new THREE.BufferGeometry()
  merged.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(positions, 3),
  )
  merged.setAttribute(
    'normal',
    new THREE.Float32BufferAttribute(normals, 3),
  )
  return merged
}
