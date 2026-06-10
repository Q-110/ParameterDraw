import * as THREE from 'three'
import { makeTransitionPreviewData } from '../data'
import { addBox, addGeometry } from '../scene/objects'

/**
 * 渐变段
 * @param context
 * @param params
 * @param derived
 * @param isUpstream
 */
export function buildTransition(context, params, derived, isUpstream) {
  // 两类渐变段都按 上断面 -> 中断面 -> 下断面 布置到 +Z -> -Z
  const {
    firstLength,
    upper,
    middle,
    lower,
    frontMiddle,
    backMiddle,
    floorThick,
    totalLength,
    startZ,
    middleZ,
    endZ,
    frontMiddleZ,
    backMiddleZ,
    toeHeight,
    toeWidth,
    heelHeight,
    topHeight,
    topWidth,
    toothHeight,
    toothWidth,
  } = makeTransitionPreviewData(params, derived, isUpstream)
  const guideWidth = Math.max(
    upper.floorWidth,
    middle.floorWidth,
    lower.floorWidth,
  )
  // 为了保留 upper/middle/lower 的高亮区域  把连续渐变面拆为四段  视觉上仍是连续变宽
  // 四段底板
  addTaperedSlab(
    context,
    'upper',
    upper.floorWidth,
    frontMiddle.floorWidth,
    floorThick,
    startZ,
    frontMiddleZ,
  )
  addTaperedSlab(
    context,
    'middle',
    frontMiddle.floorWidth,
    middle.floorWidth,
    floorThick,
    frontMiddleZ,
    middleZ,
  )
  addTaperedSlab(
    context,
    'middle',
    middle.floorWidth,
    backMiddle.floorWidth,
    floorThick,
    middleZ,
    backMiddleZ,
  )
  addTaperedSlab(
    context,
    'lower',
    backMiddle.floorWidth,
    lower.floorWidth,
    floorThick,
    backMiddleZ,
    endZ,
  )
  // 铺盖厚和纵向距离辅助区域   聚焦时显示  避免把尺寸参数误画成实体构件
  addBox(
    context,
    'floor',
    guideWidth,
    floorThick * 0.45,
    totalLength,
    0,
    floorThick * 0.75,
    0,
    0,
    0,
    true,
  )
  addBox(
    context,
    'length',
    guideWidth * 0.08,
    floorThick * 0.7,
    firstLength,
    0,
    floorThick * 1.15,
    startZ - firstLength / 2,
    0,
    0,
    true,
  )
  // 四段侧坡
  addTransitionSlope(
    context,
    'upper',
    upper,
    frontMiddle,
    startZ,
    frontMiddleZ,
    -1,
  )
  addTransitionSlope(
    context,
    'upper',
    upper,
    frontMiddle,
    startZ,
    frontMiddleZ,
    1,
  )
  addTransitionSlope(
    context,
    'middle',
    frontMiddle,
    middle,
    frontMiddleZ,
    middleZ,
    -1,
  )
  addTransitionSlope(
    context,
    'middle',
    frontMiddle,
    middle,
    frontMiddleZ,
    middleZ,
    1,
  )
  addTransitionSlope(
    context,
    'middle',
    middle,
    backMiddle,
    middleZ,
    backMiddleZ,
    -1,
  )
  addTransitionSlope(
    context,
    'middle',
    middle,
    backMiddle,
    middleZ,
    backMiddleZ,
    1,
  )
  addTransitionSlope(context, 'lower', backMiddle, lower, backMiddleZ, endZ, -1)
  addTransitionSlope(context, 'lower', backMiddle, lower, backMiddleZ, endZ, 1)
  addBox(
    context,
    'toe',
    toeWidth,
    toeHeight,
    toeWidth,
    -middle.floorWidth / 2 - toeWidth / 2,
    floorThick / 2 + toeHeight / 2,
    middleZ,
    0,
    0,
    true,
  )
  addBox(
    context,
    'toe',
    toeWidth,
    toeHeight,
    toeWidth,
    middle.floorWidth / 2 + toeWidth / 2,
    floorThick / 2 + toeHeight / 2,
    middleZ,
    0,
    0,
    true,
  )
  addBox(
    context,
    'heel',
    topWidth,
    heelHeight,
    topWidth,
    -middle.floorWidth / 2 - middle.slopeWidth + topWidth / 2,
    middle.slopeHeight - heelHeight / 2,
    middleZ,
    0,
    0,
    true,
  )
  addBox(
    context,
    'heel',
    topWidth,
    heelHeight,
    topWidth,
    middle.floorWidth / 2 + middle.slopeWidth - topWidth / 2,
    middle.slopeHeight - heelHeight / 2,
    middleZ,
    0,
    0,
    true,
  )
  addBox(
    context,
    'wallTop',
    topWidth,
    topHeight,
    topWidth,
    -middle.floorWidth / 2 - middle.slopeWidth - topWidth / 2,
    middle.slopeHeight + topHeight / 2,
    middleZ,
    0,
    0,
    true,
  )
  addBox(
    context,
    'wallTop',
    topWidth,
    topHeight,
    topWidth,
    middle.floorWidth / 2 + middle.slopeWidth + topWidth / 2,
    middle.slopeHeight + topHeight / 2,
    middleZ,
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
    -floorThick / 2 - toothHeight / 2,
    endZ,
  )
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
  context,
  region,
  startWidth,
  endWidth,
  height,
  startZ,
  endZ,
) {
  const yBottom = -height / 2
  const yTop = height / 2
  // 8 个顶点分别表示梯形底板的下表面和上表面
  const vertices = new Float32Array([
    -startWidth / 2,
    yBottom,
    startZ,
    startWidth / 2,
    yBottom,
    startZ,
    endWidth / 2,
    yBottom,
    endZ,
    -endWidth / 2,
    yBottom,
    endZ,
    -startWidth / 2,
    yTop,
    startZ,
    startWidth / 2,
    yTop,
    startZ,
    endWidth / 2,
    yTop,
    endZ,
    -endWidth / 2,
    yTop,
    endZ,
  ])
  // 每 3 个索引组成一个三角面  6 个面围成一个闭合梯形棱柱
  const indices =
    startZ > endZ
      ? [
          0, 2, 1, 0, 3, 2, 4, 5, 6, 4, 6, 7, 0, 5, 4, 0, 1, 5, 1, 6, 5, 1, 2,
          6, 2, 7, 6, 2, 3, 7, 3, 4, 7, 3, 0, 4,
        ]
      : [
          0, 1, 2, 0, 2, 3, 4, 6, 5, 4, 7, 6, 0, 4, 5, 0, 5, 1, 1, 5, 6, 1, 6,
          2, 2, 6, 7, 2, 7, 3, 3, 7, 4, 3, 4, 0,
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
function addTransitionSlope(context, region, start, end, startZ, endZ, side) {
  // 用四个点创建一个四边形坡面
  // 再把这个四边形拆成 2 个三角形
  // 最后添加至 Three.js 场景里
  const vertices = new Float32Array([
    (side * start.floorWidth) / 2,
    0,
    startZ,
    (side * end.floorWidth) / 2,
    0,
    endZ,
    side * (end.floorWidth / 2 + end.slopeWidth),
    end.slopeHeight,
    endZ,
    side * (start.floorWidth / 2 + start.slopeWidth),
    start.slopeHeight,
    startZ,
  ])
  // 左右两侧顶点顺序相反  索引方向也要反过来
  const indices = side === 1 ? [0, 1, 2, 0, 2, 3] : [0, 2, 1, 0, 3, 2]
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  addGeometry(context, region, geometry, true)
}
