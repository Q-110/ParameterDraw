import * as THREE from 'three'
import { makeStillingPreviewData } from '../data'
import { addBox, addGeometry } from '../scene/objects'

/**
 * 消力池
 * @param context
 * @param params
 * @param derived
 */
export function buildStilling(context, params, derived) {
  const {
    width,
    flatLength,
    slopeLength,
    flatSlopeLength,
    length,
    wallHeight,
    slopeWallHeight,
    upperWallWidth,
    lowerWallWidth,
    floorWidth,
    verticalWallHeight,
    floorThick,
    slopeDrop,
    flatStartZ,
    flatEndZ,
    slopeEndZ,
    flatSlopeEndZ,
    toothHeight,
    toothWidth,
    toothConnectionWidth,
    sillHeight,
    sillWidth,
    sillBottomWidth,
  } = makeStillingPreviewData(params, derived)
  // 平底段底板
  addBox(
    context,
    'floor',
    floorWidth,
    floorThick,
    flatLength,
    0,
    -slopeDrop,
    (flatStartZ + flatEndZ) / 2,
  )
  // 消力池长度辅助区域   聚焦时覆盖平底段底板范围
  addBox(
    context,
    'pool',
    floorWidth,
    floorThick * 0.4,
    flatLength,
    0,
    -slopeDrop + floorThick * 0.7,
    (flatStartZ + flatEndZ) / 2,
    0,
    0,
    true,
  )
  // 陡坡段   使用竖向等厚棱柱保证两端与水平底板齐口
  const slopeGeometry = new THREE.BufferGeometry()
  slopeGeometry.setAttribute(
    'position',
    new THREE.BufferAttribute(
      new Float32Array([
        -floorWidth / 2,
        -slopeDrop - floorThick / 2,
        flatEndZ,
        floorWidth / 2,
        -slopeDrop - floorThick / 2,
        flatEndZ,
        floorWidth / 2,
        -floorThick / 2,
        slopeEndZ,
        -floorWidth / 2,
        -floorThick / 2,
        slopeEndZ,
        -floorWidth / 2,
        -slopeDrop + floorThick / 2,
        flatEndZ,
        floorWidth / 2,
        -slopeDrop + floorThick / 2,
        flatEndZ,
        floorWidth / 2,
        floorThick / 2,
        slopeEndZ,
        -floorWidth / 2,
        floorThick / 2,
        slopeEndZ,
      ]),
      3,
    ),
  )
  slopeGeometry.setIndex([
    0,
    1,
    2,
    0,
    2,
    3, // 底面   法线朝 -Y
    4,
    6,
    5,
    4,
    7,
    6, // 顶面   法线朝 +Y
    0,
    5,
    1,
    0,
    4,
    5, // 消力池端面   法线朝 -Z
    1,
    5,
    6,
    1,
    6,
    2, // 右面   法线朝 +X
    2,
    7,
    3,
    2,
    6,
    7, // 坡顶端面   法线朝 +Z
    0,
    3,
    7,
    0,
    7,
    4, // 左面   法线朝 -X
  ])
  // 转为非索引几何体  顶点在棱边处复制  法线不跨面平均  棱边恢复硬朗
  const slopeNonIndexed = slopeGeometry.toNonIndexed()
  slopeNonIndexed.computeVertexNormals()
  addGeometry(context, 'slope', slopeNonIndexed)
  // 坡顶平直段   与陡坡共同归属坡段高亮区域
  if (flatSlopeLength > 0) {
    addBox(
      context,
      'slope',
      floorWidth,
      floorThick,
      flatSlopeLength,
      0,
      0,
      (slopeEndZ + flatSlopeEndZ) / 2,
    )
  }
  // 左右墙沿平直段保持坡顶截面   进入陡坡后墙底跟随底板下降
  const wallSections =
    flatSlopeLength > 0
      ? [
          {
            bottomY: floorThick / 2,
            height: slopeWallHeight,
            outerVerticalHeight: 0,
            z: flatSlopeEndZ,
          },
          {
            bottomY: floorThick / 2,
            height: slopeWallHeight,
            outerVerticalHeight: 0,
            z: slopeEndZ,
          },
          {
            bottomY: -slopeDrop + floorThick / 2,
            height: wallHeight,
            outerVerticalHeight: verticalWallHeight,
            z: flatEndZ,
          },
          {
            bottomY: -slopeDrop + floorThick / 2,
            height: wallHeight,
            outerVerticalHeight: verticalWallHeight,
            z: flatStartZ,
          },
        ]
      : [
          {
            bottomY: floorThick / 2,
            height: slopeWallHeight,
            outerVerticalHeight: 0,
            z: slopeEndZ,
          },
          {
            bottomY: -slopeDrop + floorThick / 2,
            height: wallHeight,
            outerVerticalHeight: verticalWallHeight,
            z: flatEndZ,
          },
          {
            bottomY: -slopeDrop + floorThick / 2,
            height: wallHeight,
            outerVerticalHeight: verticalWallHeight,
            z: flatStartZ,
          },
        ]
  for (const side of [-1, 1]) {
    const vertices = new Float32Array(
      wallSections.flatMap((section) => {
        const innerX = (side * width) / 2
        const outerBottomX = side * (width / 2 + lowerWallWidth)
        const outerUpperX = side * (width / 2 + upperWallWidth)
        const topY = section.bottomY + section.height
        const inclinedBottomY = section.bottomY + section.outerVerticalHeight
        // 每个断面按逆时针排列   保证闭合多面体各表面法向一致
        return side === 1
          ? [
              innerX,
              section.bottomY,
              section.z, // 内侧墙脚
              outerBottomX,
              section.bottomY,
              section.z, // 外侧墙脚
              outerBottomX,
              inclinedBottomY,
              section.z, // 外侧竖直段顶点
              outerUpperX,
              topY,
              section.z, // 外侧墙顶
              innerX,
              topY,
              section.z, // 内侧墙顶
            ]
          : [
              innerX,
              section.bottomY,
              section.z,
              innerX,
              topY,
              section.z,
              outerUpperX,
              topY,
              section.z,
              outerBottomX,
              inclinedBottomY,
              section.z,
              outerBottomX,
              section.bottomY,
              section.z,
            ]
      }),
    )
    /* vertices 最终结构   以右侧墙且平直段长度大于 0 为例
          const vertices = new Float32Array([
            // 第 0 个断面   坡顶平直段起点
            W,  B0, Z0,   // 0   内侧墙脚
            LB, B0, Z0,   // 1   外侧墙脚
            LB, F0, Z0,   // 2   外侧竖直段顶点
            UB, T0, Z0,   // 3   外侧墙顶
            W,  T0, Z0,   // 4   内侧墙顶
    
            // 第 1 个断面   平直段终点及陡坡起点
            W,  B1, Z1,   // 5
            LB, B1, Z1,   // 6
            LB, F1, Z1,   // 7
            UB, T1, Z1,   // 8
            W,  T1, Z1,   // 9
    
            // 第 2 个断面   陡坡终点及消力池起点
            W,  B2, Z2,   // 10
            LB, B2, Z2,   // 11
            LB, F2, Z2,   // 12
            UB, T2, Z2,   // 13
            W,  T2, Z2,   // 14
    
            // 第 3 个断面   消力池终点
            W,  B3, Z3,   // 15
            LB, B3, Z3,   // 16
            LB, F3, Z3,   // 17
            UB, T3, Z3,   // 18
            W,  T3, Z3,   // 19
          ])
         */
    const sectionPointCount = 5
    const indices = []
    // 将相邻断面的对应点连接为墙体侧面
    for (
      let sectionIndex = 0;
      sectionIndex < wallSections.length - 1;
      sectionIndex += 1
    ) {
      const start = sectionIndex * sectionPointCount
      const end = start + sectionPointCount
      for (
        let pointIndex = 0;
        pointIndex < sectionPointCount;
        pointIndex += 1
      ) {
        const nextPointIndex = (pointIndex + 1) % sectionPointCount
        indices.push(
          start + pointIndex,
          end + pointIndex,
          end + nextPointIndex,
          start + pointIndex,
          end + nextPointIndex,
          start + nextPointIndex,
        )
      }
    }
    // 墙体纵向两端封口
    for (
      let pointIndex = 1;
      pointIndex < sectionPointCount - 1;
      pointIndex += 1
    ) {
      indices.push(0, pointIndex, pointIndex + 1)
    }
    const endStart = (wallSections.length - 1) * sectionPointCount
    for (
      let pointIndex = 1;
      pointIndex < sectionPointCount - 1;
      pointIndex += 1
    ) {
      indices.push(endStart, endStart + pointIndex + 1, endStart + pointIndex)
    }
    /* indices 最终结构   以四个墙体断面为例
          const indices = [
            // 第 0 个断面连接第 1 个断面
            0, 5, 6,
            0, 6, 1,
            1, 6, 7,
            1, 7, 2,
            2, 7, 8,
            2, 8, 3,
            3, 8, 9,
            3, 9, 4,
            4, 9, 5,
            4, 5, 0,
    
            // 第 1 个断面连接第 2 个断面
            5, 10, 11,
            5, 11, 6,
            6, 11, 12,
            6, 12, 7,
            7, 12, 13,
            7, 13, 8,
            8, 13, 14,
            8, 14, 9,
            9, 14, 10,
            9, 10, 5,
    
            // 第 2 个断面连接第 3 个断面
            10, 15, 16,
            10, 16, 11,
            11, 16, 17,
            11, 17, 12,
            12, 17, 18,
            12, 18, 13,
            13, 18, 19,
            13, 19, 14,
            14, 19, 15,
            14, 15, 10,
    
            // 坡顶平直段起点封口
            0, 1, 2,
            0, 2, 3,
            0, 3, 4,
    
            // 消力池终点封口
            15, 17, 16,
            15, 18, 17,
            15, 19, 18,
          ]
         */
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3))
    geometry.setIndex(indices)
    const wallNonIndexed = geometry.toNonIndexed()
    wallNonIndexed.computeVertexNormals()
    addGeometry(context, 'wall', wallNonIndexed)
  }
  // 消力坎   IPT 固定使用 135° 斜面
  const sillBottomY = -slopeDrop + floorThick / 2
  const sillTopY = sillBottomY + sillHeight
  const sillGeometry = new THREE.BufferGeometry()
  sillGeometry.setAttribute(
    'position',
    new THREE.BufferAttribute(
      new Float32Array([
        -width / 2, sillBottomY, flatStartZ,
        -width / 2, sillBottomY, flatStartZ + sillBottomWidth,
        -width / 2, sillTopY, flatStartZ + sillWidth,
        -width / 2, sillTopY, flatStartZ,
        width / 2, sillBottomY, flatStartZ,
        width / 2, sillBottomY, flatStartZ + sillBottomWidth,
        width / 2, sillTopY, flatStartZ + sillWidth,
        width / 2, sillTopY, flatStartZ,
      ]),
      3,
    ),
  )
  sillGeometry.setIndex([
    0, 1, 2, 0, 2, 3,
    4, 6, 5, 4, 7, 6,
    0, 5, 1, 0, 4, 5,
    1, 6, 2, 1, 5, 6,
    2, 7, 3, 2, 6, 7,
    3, 4, 0, 3, 7, 4,
  ])
  const sillNonIndexed = sillGeometry.toNonIndexed()
  sillNonIndexed.computeVertexNormals()
  addGeometry(context, 'baffle', sillNonIndexed)
  // 齿墙   IPT 固定使用 135° 斜面并贯穿底板总宽
  const toothTopY = -slopeDrop - floorThick / 2
  const toothBottomY = toothTopY - toothHeight
  const toothGeometry = new THREE.BufferGeometry()
  toothGeometry.setAttribute(
    'position',
    new THREE.BufferAttribute(
      new Float32Array([
        -floorWidth / 2, toothTopY, flatStartZ,
        -floorWidth / 2, toothTopY, flatStartZ + toothConnectionWidth,
        -floorWidth / 2, toothBottomY, flatStartZ + toothWidth,
        -floorWidth / 2, toothBottomY, flatStartZ,
        floorWidth / 2, toothTopY, flatStartZ,
        floorWidth / 2, toothTopY, flatStartZ + toothConnectionWidth,
        floorWidth / 2, toothBottomY, flatStartZ + toothWidth,
        floorWidth / 2, toothBottomY, flatStartZ,
      ]),
      3,
    ),
  )
  toothGeometry.setIndex([
    0, 2, 1, 0, 3, 2,
    4, 5, 6, 4, 6, 7,
    0, 5, 4, 0, 1, 5,
    1, 6, 5, 1, 2, 6,
    2, 7, 6, 2, 3, 7,
    3, 4, 7, 3, 0, 4,
  ])
  const toothNonIndexed = toothGeometry.toNonIndexed()
  toothNonIndexed.computeVertexNormals()
  addGeometry(context, 'tooth', toothNonIndexed)
}
