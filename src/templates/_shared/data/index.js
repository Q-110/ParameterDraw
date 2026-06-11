/**
 * 厘米换算为 Three.js 预览单位
 */
function cm(value) {
  return value * 0.01
}

export const upstreamConnectionKeys = {
  length: '上游连接段底板长度',
  floorThick: '上游连接段底板厚度',
  toothHeight: '上游连接段底板齿墙高',
  toothWidth: '上游连接段底板齿墙宽',
  pressWidth: '上游连接段坡顶压坡宽',
  ditchWidth: '上游连接段坡底槽宽',
  ditchHeight: '上游连接段坡底槽高',
  ditchOuterWidth: '上游连接段坡底外槽宽',
  slopeThick: '上游连接段坡板厚度',
  slopeToothThick: '上游连接段坡齿厚度',
  slopeToothWidth: '上游连接段坡齿宽度',
}

export const downstreamConnectionKeys = {
  length: '下游连接段底板长度',
  floorThick: '下游连接段底板厚度',
  toothHeight: '下游连接段底板齿墙高',
  toothWidth: '下游连接段底板齿墙宽',
  pressWidth: '下游连接段坡顶压坡宽',
  ditchWidth: '下游连接段坡底槽宽',
  ditchHeight: '下游连接段坡底槽高',
  ditchOuterWidth: '下游连接段坡底外槽宽',
  slopeThick: '下游连接段坡板厚度',
  slopeToothThick: '下游连接段坡齿厚度',
  slopeToothWidth: '下游连接段坡齿宽度',
}

export const upstreamTransitionKeys = {
  distance: '上游渐变段中首断面距离',
  middleBottomWidth: '上游渐变段中断面底宽',
  middleSlopeHeight: '上游渐变段中断面坡高',
  middleSlopeWidth: '上游渐变段中断面坡宽',
  toeHeight: '上游渐变段中断面趾高',
  toeWidth: '上游渐变段中断面趾宽',
  heelHeight: '上游渐变段中断面踵高',
  topHeight: '上游渐变段中断面顶端高',
  topWidth: '上游渐变段中断面顶端宽',
  upperFloorWidth: '上游渐变段上断面铺盖宽',
  upperBottomWidth: '上游渐变段上断面底宽',
  upperSlopeHeight: '上游渐变段上断面坡高',
  upperSlopeWidth: '上游渐变段上断面坡宽',
  lowerBottomWidth: '上游渐变段下断面底宽',
  lowerSlopeHeight: '上游渐变段下断面坡高',
  floorThick: '上游渐变段断面铺盖厚',
  toothHeight: '上游渐变段铺盖齿墙高',
  toothWidth: '上游渐变段铺盖齿墙宽',
}

export const downstreamTransitionKeys = {
  distance: '下游渐变段中末断面距离',
  middleBottomWidth: '下游渐变段中断面底宽',
  middleSlopeWidth: '下游渐变段中断面坡宽',
  toeHeight: '下游渐变段中断面趾高',
  toeWidth: '下游渐变段中断面趾宽',
  heelHeight: '下游渐变段中断面踵高',
  topHeight: '下游渐变段中断面顶端高',
  topWidth: '下游渐变段中断面顶端宽',
  upperBottomWidth: '下游渐变段上断面底宽',
  lowerFloorWidth: '下游渐变段下断面铺盖宽',
  lowerBottomWidth: '下游渐变段下断面底宽',
  lowerSlopeWidth: '下游渐变段下断面坡宽',
  floorThick: '下游渐变段断面铺盖厚',
  toothHeight: '下游渐变段铺盖齿墙高',
  toothWidth: '下游渐变段铺盖齿墙宽',
}

/**
 * 生成闸室几何和尺寸线共用数据
 * @param params
 * @param derived
 */
export function makeGatePreviewData(params, derived) {
  const width = cm(derived.闸总宽)
  const length = cm(params.闸室长)
  const pierHeight = cm(params.闸墩高)
  const floorThick = cm(params.闸底板厚)
  const pierThick = cm(params.边墩厚)
  const openingWidth = cm(params.闸孔净宽)
  const doorWidth = cm(derived.闸门宽)
  const doorThick = cm(params.闸门厚)
  const doorCenterZ = length / 2 - cm(params.闸门距上游)
  const doorUpstreamZ = doorCenterZ + doorThick / 2
  const doorDownstreamZ = doorCenterZ - doorThick / 2
  const slotDepth = cm(params.门槽深)
  const slotSecondWidth = cm(params.门槽二期宽)
  const slotUpstreamZ = doorUpstreamZ + slotSecondWidth
  const slotDownstreamZ = doorDownstreamZ - slotSecondWidth
  const serviceWidth = cm(params.检修桥板宽)
  const serviceThick = cm(params.检修桥板厚)
  const servicePierDepth = cm(params.检修桥入闸墩深)
  const topY = floorThick / 2 + pierHeight

  // 始终读取交通桥参数   模板不提供则值为 undefined -> cm() 返回 NaN -> addBox/addDimensionLine 跳过
  const bridgeWidth = cm(params.交通桥宽)
  const bridgeThick = cm(params.交通桥厚)
  const approachSlabLength = cm(params.搭板长)
  const upstreamZ = length / 2 - cm(params.桥边距上游)
  const trafficBridge = {
    width: bridgeWidth,
    thick: bridgeThick,
    upstreamZ,
    downstreamZ: upstreamZ - bridgeWidth,
    centerZ: upstreamZ - bridgeWidth / 2,
    approachSlabLength,
    totalSpan: openingWidth + approachSlabLength * 2,
    centerY: topY - bridgeThick / 2,
    bottomY: topY - bridgeThick,
    topY,
    edgeThick: cm(params.交通桥护边厚),
    edgeHeight: cm(params.交通桥护边高),
  }

  return {
    width,
    length,
    pierHeight,
    floorThick,
    pierThick,
    openingWidth,
    openingCenterX: 0,
    doorWidth,
    doorThick,
    doorCenterZ,
    doorUpstreamZ,
    doorDownstreamZ,
    slotDepth,
    slotUpstreamZ,
    slotDownstreamZ,
    serviceWidth,
    serviceThick,
    servicePierDepth,
    serviceSpan: openingWidth + servicePierDepth * 2,
    serviceCenterY: topY - serviceThick / 2,
    serviceUpstreamZ: slotUpstreamZ + serviceWidth / 2,
    serviceDownstreamZ: slotDownstreamZ - serviceWidth / 2,
    doorPierDepth: cm(params.门槽入闸墩深),
    slotSecondWidth,
    toothHeight: cm(params.齿墙高),
    toothWidth: cm(params.齿墙宽),
    firstOpeningX: -width / 2 + pierThick + openingWidth / 2,
    topY,
    trafficBridge,
  }
}

/**
 * 生成消力池几何和尺寸线共用数据
 * @param params
 * @param derived
 */
export function makeStillingPreviewData(params, derived) {
  const width = cm(derived.消力池底板宽度)
  const flatLength = cm(params.消力池长度)
  const slopeLength = cm(params.消力池陡坡段长度)
  const flatSlopeLength = cm(params.消力池陡坡段平直段长度)
  const wallHeight = cm(params.消力池墙高)
  const inclinedWallHeight = cm(params.消力池斜墙段高度)
  const lowerWallWidth = cm(params.消力池陡坡段下部墙宽)
  const toothHeight = cm(params.消力池齿墙高度)
  const toothWidth = cm(params.消力池齿墙底宽)
  const sillHeight = cm(params.消力坎高)
  const sillWidth = cm(params.消力坎顶宽)
  const length = flatLength + slopeLength + flatSlopeLength
  const flatStartZ = -length / 2
  const flatEndZ = flatStartZ + flatLength
  const slopeEndZ = flatEndZ + slopeLength

  return {
    width,
    flatLength,
    slopeLength,
    flatSlopeLength,
    length,
    wallHeight,
    slopeWallHeight: cm(derived.消力池陡坡段墙高),
    upperWallWidth: cm(params.消力池陡坡段上部墙宽),
    lowerWallWidth,
    inclinedWallHeight,
    floorWidth: width + lowerWallWidth * 2,
    verticalWallHeight: wallHeight - inclinedWallHeight,
    floorThick: cm(params.消力池底板厚度),
    slopeDrop: cm(params.消力池陡坡段高差),
    flatStartZ,
    flatEndZ,
    slopeEndZ,
    flatSlopeEndZ: length / 2,
    toothHeight,
    toothWidth,
    toothConnectionWidth: toothWidth + toothHeight,
    sillHeight,
    sillWidth,
    sillBottomWidth: sillWidth + sillHeight,
  }
}

/**
 * 生成连接段几何和尺寸线共用数据
 * @param params
 * @param derived
 * @param isUpstream
 */
export function makeConnectionPreviewData(params, derived, isUpstream) {
  const keys = isUpstream
    ? upstreamConnectionKeys
    : downstreamConnectionKeys
  const length = cm(params[keys.length])
  const width = cm(
    isUpstream ? derived.上游连接段渠底板宽 : derived.下游连接段渠底板宽,
  )
  const slopeWidth = cm(
    isUpstream ? derived.上游连接段坡面宽度 : derived.下游连接段坡面宽度,
  )
  const slopeHeight = cm(
    isUpstream ? derived.上游连接段坡面高度 : derived.下游连接段坡面高度,
  )
  const floorThick = cm(params[keys.floorThick])
  const ditchWidth = cm(params[keys.ditchWidth])
  const ditchHeight = cm(params[keys.ditchHeight])
  const ditchOuterWidth = cm(params[keys.ditchOuterWidth])
  const floorTopY = floorThick / 2
  const ditchBottomY = floorTopY - ditchHeight
  const floorBottomY = ditchBottomY - floorThick
  const outerDitchX = width / 2 + ditchOuterWidth

  return {
    keys,
    length,
    width,
    slopeWidth,
    slopeHeight,
    floorThick,
    slopeThick: cm(params[keys.slopeThick]),
    pressWidth: cm(params[keys.pressWidth]),
    slopeToothThick: cm(params[keys.slopeToothThick]),
    slopeToothWidth: cm(params[keys.slopeToothWidth]),
    toothHeight: cm(params[keys.toothHeight]),
    toothWidth: cm(params[keys.toothWidth]),
    ditchWidth,
    ditchHeight,
    ditchOuterWidth,
    floorTopY,
    ditchBottomY,
    floorBottomY,
    innerDitchX: width / 2 - ditchWidth,
    outerDitchX,
    slopeFootWidth: outerDitchX * 2,
  }
}

/**
 * 生成渐变段几何和尺寸线共用数据
 * @param params
 * @param derived
 * @param isUpstream
 */
export function makeTransitionPreviewData(params, derived, isUpstream) {
  const keys = isUpstream
    ? upstreamTransitionKeys
    : downstreamTransitionKeys
  const firstLength = cm(
    isUpstream ? params.上游渐变段中首断面距离 : derived.下游渐变段中首断面距离,
  )
  const secondLength = cm(
    isUpstream ? derived.上游渐变段中末断面距离 : params.下游渐变段中末断面距离,
  )
  const upper = makeTransitionSection(params, derived, isUpstream, 'upper')
  const middle = makeTransitionSection(params, derived, isUpstream, 'middle')
  const lower = makeTransitionSection(params, derived, isUpstream, 'lower')
  const totalLength = firstLength + secondLength
  const startZ = totalLength / 2
  const middleZ = startZ - firstLength

  return {
    keys,
    firstLength,
    secondLength,
    upper,
    middle,
    lower,
    frontMiddle: mixSection(upper, middle, 0.5),
    backMiddle: mixSection(middle, lower, 0.5),
    floorThick: cm(params[keys.floorThick]),
    totalLength,
    startZ,
    middleZ,
    endZ: -totalLength / 2,
    frontMiddleZ: startZ - firstLength / 2,
    backMiddleZ: middleZ - secondLength / 2,
    toeHeight: cm(params[keys.toeHeight]),
    toeWidth: cm(params[keys.toeWidth]),
    heelHeight: cm(params[keys.heelHeight]),
    topHeight: cm(params[keys.topHeight]),
    topWidth: cm(params[keys.topWidth]),
    toothHeight: cm(params[keys.toothHeight]),
    toothWidth: cm(params[keys.toothWidth]),
  }
}

/**
 * 根据上下游方向和断面位置生成渐变断面
 * @param params
 * @param derived
 * @param isUpstream
 * @param section
 */
function makeTransitionSection(params, derived, isUpstream, section) {
  if (isUpstream && section === 'upper') {
    return {
      floorWidth: cm(params.上游渐变段上断面铺盖宽),
      bottomWidth: cm(params.上游渐变段上断面底宽),
      slopeWidth: cm(params.上游渐变段上断面坡宽),
      slopeHeight: cm(params.上游渐变段上断面坡高),
    }
  }
  if (isUpstream && section === 'middle') {
    return {
      floorWidth: cm(derived.上游渐变段中断面铺盖宽),
      bottomWidth: cm(params.上游渐变段中断面底宽),
      slopeWidth: cm(params.上游渐变段中断面坡宽),
      slopeHeight: cm(params.上游渐变段中断面坡高),
    }
  }
  if (isUpstream) {
    return {
      floorWidth: cm(derived.上游渐变段下断面铺盖宽),
      bottomWidth: cm(params.上游渐变段下断面底宽),
      slopeWidth: cm(params.上游渐变段中断面坡宽),
      slopeHeight: cm(params.上游渐变段下断面坡高),
    }
  }
  if (section === 'upper') {
    return {
      floorWidth: cm(derived.下游渐变段上断面铺盖宽),
      bottomWidth: cm(params.下游渐变段上断面底宽),
      slopeWidth: cm(params.下游渐变段中断面坡宽),
      slopeHeight: cm(derived.下游渐变段上断面坡高),
    }
  }
  if (section === 'middle') {
    return {
      floorWidth: cm(derived.下游渐变段中断面铺盖宽),
      bottomWidth: cm(params.下游渐变段中断面底宽),
      slopeWidth: cm(params.下游渐变段中断面坡宽),
      slopeHeight: cm(derived.下游渐变段中断面坡高),
    }
  }
  return {
    floorWidth: cm(params.下游渐变段下断面铺盖宽),
    bottomWidth: cm(params.下游渐变段下断面底宽),
    slopeWidth: cm(params.下游渐变段下断面坡宽),
    slopeHeight: cm(derived.下游渐变段中断面坡高),
  }
}

/**
 * 计算两个渐变断面之间的插值断面
 * 用于把连续渐变段拆成可高亮的几段   同时保持尺寸线性变化
 * @param start   起点断面
 * @param end     终点断面
 * @param ratio   插值比例  0 表示起点  1 表示终点
 */
function mixSection(start, end, ratio) {
  return {
    floorWidth: start.floorWidth + (end.floorWidth - start.floorWidth) * ratio,
    bottomWidth:
      start.bottomWidth + (end.bottomWidth - start.bottomWidth) * ratio,
    slopeWidth: start.slopeWidth + (end.slopeWidth - start.slopeWidth) * ratio,
    slopeHeight:
      start.slopeHeight + (end.slopeHeight - start.slopeHeight) * ratio,
  }
}
