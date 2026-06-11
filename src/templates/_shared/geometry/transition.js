import * as THREE from 'three'
import { makeTransitionPreviewData } from '../data'
import { addBox, addGeometry } from '../scene/objects'

/**
 * 创建渐变段
 * 按 Inventor 上中下断面生成两段挡墙和两段铺盖实体
 * @param context
 * @param params
 * @param derived
 * @param isUpstream
 */
export function buildTransition(context, params, derived, isUpstream) {
  const {
    firstLength,
    secondLength,
    upper,
    middle,
    lower,
    floorThick,
    totalLength,
    startZ,
    middleZ,
    endZ,
    toothHeight,
    toothWidth,
  } = makeTransitionPreviewData(params, derived, isUpstream)
  const guideWidth =
    Math.max(upper.outerX, middle.outerX, lower.outerX) * 2

  const upperWalls = [-1, 1].map((side) =>
    createWallGeometry(upper, middle, startZ, middleZ, side),
  )
  const lowerWalls = [-1, 1].map((side) =>
    createWallGeometry(middle, lower, middleZ, endZ, side),
  )
  addGeometry(context, 'upper', mergeGeometries(upperWalls))
  addGeometry(context, 'lower', mergeGeometries(lowerWalls))

  addGeometry(
    context,
    'upper',
    createFloorGeometry(
      upper,
      middle,
      startZ,
      middleZ,
      floorThick,
      toothHeight,
      toothWidth,
      true,
    ),
  )
  addGeometry(
    context,
    'lower',
    createFloorGeometry(
      middle,
      lower,
      middleZ,
      endZ,
      floorThick,
      toothHeight,
      toothWidth,
      false,
    ),
  )

  // 中断面使用隐藏薄片提示   避免为高亮额外切割可见实体
  const sectionGuideDepth = Math.max(totalLength * 0.01, 0.05)
  const middleGuides = [-1, 1].map((side) =>
    createWallGeometry(
      middle,
      middle,
      middleZ + sectionGuideDepth / 2,
      middleZ - sectionGuideDepth / 2,
      side,
    ),
  )
  addGeometry(
    context,
    'middle',
    mergeGeometries(middleGuides),
    false,
    true,
  )
  const toeGuides = [-1, 1].map((side) =>
    createSectionRegionGeometry(
      middle,
      middleZ,
      sectionGuideDepth,
      side,
      'toe',
    ),
  )
  addGeometry(
    context,
    'toe',
    mergeGeometries(toeGuides),
    false,
    true,
  )
  const heelGuides = [-1, 1].map((side) =>
    createSectionRegionGeometry(
      middle,
      middleZ,
      sectionGuideDepth,
      side,
      'heel',
    ),
  )
  addGeometry(
    context,
    'heel',
    mergeGeometries(heelGuides),
    false,
    true,
  )
  const wallTopGuides = [-1, 1].map((side) =>
    createSectionRegionGeometry(
      middle,
      middleZ,
      sectionGuideDepth,
      side,
      'wallTop',
    ),
  )
  addGeometry(
    context,
    'wallTop',
    mergeGeometries(wallTopGuides),
    false,
    true,
  )
  // 聚焦铺盖厚时显示贯穿渐变段的辅助范围
  addBox(
    context,
    'floor',
    Math.max(upper.floorWidth, middle.floorWidth, lower.floorWidth),
    floorThick,
    totalLength,
    0,
    -floorThick / 2,
    0,
    0,
    0,
    true,
  )
  // 聚焦断面距离时显示对应纵向范围
  const distanceLength = isUpstream ? firstLength : secondLength
  const distanceStartZ = isUpstream ? startZ : middleZ
  const distanceEndZ = isUpstream ? middleZ : endZ
  addBox(
    context,
    'length',
    guideWidth * 0.04,
    floorThick,
    distanceLength,
    0,
    -floorThick / 2,
    (distanceStartZ + distanceEndZ) / 2,
    0,
    0,
    true,
  )
  // 聚焦齿墙时显示首末端水平齿墙范围
  addBox(
    context,
    'tooth',
    upper.floorWidth,
    toothHeight,
    toothWidth,
    0,
    -floorThick - toothHeight / 2,
    startZ - toothWidth / 2,
    0,
    0,
    true,
  )
  addBox(
    context,
    'tooth',
    lower.floorWidth,
    toothHeight,
    toothWidth,
    0,
    -floorThick - toothHeight / 2,
    endZ + toothWidth / 2,
    0,
    0,
    true,
  )
}

/**
 * 创建单侧挡墙实体
 * 八点断面包含趾部 内坡 顶端 外坡和踵部
 * @param startSection
 * @param endSection
 * @param startZ
 * @param endZ
 * @param side
 */
function createWallGeometry(
  startSection,
  endSection,
  startZ,
  endZ,
  side,
) {
  const stations = [
    {
      z: startZ,
      profile: makeWallProfile(startSection, side),
    },
    {
      z: endZ,
      profile: makeWallProfile(endSection, side),
    },
  ]
  return createStationLoftGeometry(stations)
}

/**
 * 生成单侧挡墙八点断面
 * @param section
 * @param side
 */
function makeWallProfile(section, side) {
  return [
    [side * section.floorEdgeX, section.wallBottomY],
    [side * section.floorEdgeX, 0],
    [side * section.toeOuterX, 0],
    [side * section.slopeTopX, section.slopeHeight],
    [side * section.topOuterX, section.slopeHeight],
    [side * section.topOuterX, section.topLowerY],
    [side * section.outerBottomX, section.heelTopY],
    [side * section.outerBottomX, section.wallBottomY],
  ]
}

/**
 * 创建中断面局部高亮薄棱体
 * 趾部 踵部 顶端分别使用真实断面边界   避免切割可见挡墙实体
 * @param section
 * @param middleZ
 * @param depth
 * @param side
 * @param region
 */
function createSectionRegionGeometry(
  section,
  middleZ,
  depth,
  side,
  region,
) {
  let profile

  if (region === 'toe') {
    profile = [
      [side * section.floorEdgeX, section.wallBottomY],
      [side * section.floorEdgeX, 0],
      [side * section.toeOuterX, 0],
      [side * section.toeOuterX, section.wallBottomY],
    ]
  } else if (region === 'heel') {
    profile = [
      [side * section.toeOuterX, section.wallBottomY],
      [side * section.toeOuterX, 0],
      [side * section.outerBottomX, section.heelTopY],
      [side * section.outerBottomX, section.wallBottomY],
    ]
  } else {
    const innerBottomX =
      section.toeOuterX +
      section.slopeWidth * section.topLowerY / section.slopeHeight
    profile = [
      [side * innerBottomX, section.topLowerY],
      [side * section.slopeTopX, section.slopeHeight],
      [side * section.topOuterX, section.slopeHeight],
      [side * section.topOuterX, section.topLowerY],
    ]
  }

  return createStationLoftGeometry([
    {
      z: middleZ + depth / 2,
      profile,
    },
    {
      z: middleZ - depth / 2,
      profile,
    },
  ])
}

/**
 * 创建单段铺盖实体
 * 首末端齿墙均包含水平底面和等高斜接段
 * @param startSection
 * @param endSection
 * @param startZ
 * @param endZ
 * @param floorThick
 * @param toothHeight
 * @param toothWidth
 * @param toothAtStart
 */
function createFloorGeometry(
  startSection,
  endSection,
  startZ,
  endZ,
  floorThick,
  toothHeight,
  toothWidth,
  toothAtStart,
) {
  const toothBottomY = -floorThick - toothHeight
  const stations = toothAtStart
    ? [
        [startZ, toothBottomY],
        [startZ - toothWidth, toothBottomY],
        [startZ - toothWidth - toothHeight, -floorThick],
        [endZ, -floorThick],
      ]
    : [
        [startZ, -floorThick],
        [endZ + toothWidth + toothHeight, -floorThick],
        [endZ + toothWidth, toothBottomY],
        [endZ, toothBottomY],
      ]
  const totalLength = startZ - endZ
  return createStationLoftGeometry(
    stations.map(([z, bottomY]) => {
      const ratio = (startZ - z) / totalLength
      const width =
        startSection.floorWidth +
        (endSection.floorWidth - startSection.floorWidth) * ratio
      return {
        z,
        profile: [
          [-width / 2, bottomY],
          [width / 2, bottomY],
          [width / 2, 0],
          [-width / 2, 0],
        ],
      }
    }),
  )
}

/**
 * 根据连续断面生成闭合放样实体
 * 所有三角面独立写入并按实体外部方向排列
 * @param stations
 */
function createStationLoftGeometry(stations) {
  const profiles = stations.map(({ profile }) =>
    profile.map(([x, y]) => [x, y]),
  )
  const profileArea = profiles[0].reduce((sum, point, index) => {
    const next = profiles[0][(index + 1) % profiles[0].length]
    return sum + point[0] * next[1] - next[0] * point[1]
  }, 0)
  if (profileArea < 0) {
    profiles.forEach((profile) => profile.reverse())
  }

  const positions = []
  const firstProfile = profiles[0]
  const lastProfile = profiles[profiles.length - 1]
  const firstCapTriangles = THREE.ShapeUtils.triangulateShape(
    firstProfile.map(([x, y]) => new THREE.Vector2(x, y)),
    [],
  )
  const lastCapTriangles = THREE.ShapeUtils.triangulateShape(
    lastProfile.map(([x, y]) => new THREE.Vector2(x, y)),
    [],
  )
  firstCapTriangles.forEach(([a, b, c]) => {
    pushTriangle(
      positions,
      [firstProfile[a][0], firstProfile[a][1], stations[0].z],
      [firstProfile[b][0], firstProfile[b][1], stations[0].z],
      [firstProfile[c][0], firstProfile[c][1], stations[0].z],
      [0, 0, 1],
    )
  })
  lastCapTriangles.forEach(([a, b, c]) => {
    pushTriangle(
      positions,
      [
        lastProfile[a][0],
        lastProfile[a][1],
        stations[stations.length - 1].z,
      ],
      [
        lastProfile[b][0],
        lastProfile[b][1],
        stations[stations.length - 1].z,
      ],
      [
        lastProfile[c][0],
        lastProfile[c][1],
        stations[stations.length - 1].z,
      ],
      [0, 0, -1],
    )
  })

  for (let stationIndex = 0; stationIndex < stations.length - 1; stationIndex += 1) {
    const startProfile = profiles[stationIndex]
    const endProfile = profiles[stationIndex + 1]
    const startZ = stations[stationIndex].z
    const endZ = stations[stationIndex + 1].z
    startProfile.forEach((point, pointIndex) => {
      const nextIndex = (pointIndex + 1) % startProfile.length
      const startNext = startProfile[nextIndex]
      const endPoint = endProfile[pointIndex]
      const endNext = endProfile[nextIndex]
      const edgeX =
        (startNext[0] - point[0] + endNext[0] - endPoint[0]) / 2
      const edgeY =
        (startNext[1] - point[1] + endNext[1] - endPoint[1]) / 2
      const outward = [edgeY, -edgeX, 0]
      const startPoint = [point[0], point[1], startZ]
      const startNextPoint = [startNext[0], startNext[1], startZ]
      const endPoint3D = [endPoint[0], endPoint[1], endZ]
      const endNextPoint = [endNext[0], endNext[1], endZ]
      const centerPoint = [
        (
          startPoint[0] +
          startNextPoint[0] +
          endPoint3D[0] +
          endNextPoint[0]
        ) / 4,
        (
          startPoint[1] +
          startNextPoint[1] +
          endPoint3D[1] +
          endNextPoint[1]
        ) / 4,
        (startZ + endZ) / 2,
      ]
      pushTriangle(
        positions,
        startPoint,
        endPoint3D,
        centerPoint,
        outward,
      )
      pushTriangle(
        positions,
        endPoint3D,
        endNextPoint,
        centerPoint,
        outward,
      )
      pushTriangle(
        positions,
        endNextPoint,
        startNextPoint,
        centerPoint,
        outward,
      )
      pushTriangle(
        positions,
        startNextPoint,
        startPoint,
        centerPoint,
        outward,
      )
    })
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(positions, 3),
  )
  geometry.computeVertexNormals()
  return geometry
}

/**
 * 写入朝指定外侧方向的非退化三角面
 * @param positions
 * @param a
 * @param b
 * @param c
 * @param outward
 */
function pushTriangle(positions, a, b, c, outward) {
  const abX = b[0] - a[0]
  const abY = b[1] - a[1]
  const abZ = b[2] - a[2]
  const acX = c[0] - a[0]
  const acY = c[1] - a[1]
  const acZ = c[2] - a[2]
  const normalX = abY * acZ - abZ * acY
  const normalY = abZ * acX - abX * acZ
  const normalZ = abX * acY - abY * acX
  const areaSquared =
    normalX * normalX + normalY * normalY + normalZ * normalZ
  if (areaSquared <= 1e-12) return

  const facing =
    normalX * outward[0] +
    normalY * outward[1] +
    normalZ * outward[2]
  const triangle = facing >= 0 ? [a, b, c] : [a, c, b]
  triangle.forEach((point) => positions.push(...point))
}

/**
 * 合并同一纵向分段的左右挡墙
 * 合并后仍保持每个三角面独立顶点和独立法线
 * @param geometries
 */
function mergeGeometries(geometries) {
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
