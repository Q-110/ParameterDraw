import * as THREE from 'three'
import { LineMaterial } from 'three/addons/lines/LineMaterial.js'
import { LineSegments2 } from 'three/addons/lines/LineSegments2.js'

const partColors = {
  gate: 0x8aa3a0,
  stilling: 0x739072,
  upstreamConnection: 0x9b8c73,
  upstreamTransition: 0x6e8fa4,
  downstreamConnection: 0xa06f65,
  downstreamTransition: 0x7a87a8,
}

/**
 * 创建体块材质
 * @param part
 * @param highlighted
 * @param isGuide
 */
export function createMeshMaterial(part, highlighted, isGuide) {
  return new THREE.MeshStandardMaterial({
    color: highlighted ? 0xf4b942 : partColors[part],
    roughness: highlighted ? 0.45 : 0.72,
    metalness: highlighted ? 0.05 : 0.02,
    transparent: isGuide,
    opacity: isGuide ? 0.5 : 1,
  })
}

/**
 * 创建边线材质
 * @param highlighted
 * @param isGuide
 */
export function createEdgeMaterial(highlighted, isGuide) {
  return new THREE.LineBasicMaterial({
    color: highlighted ? 0x005f73 : 0x60706a,
    transparent: true,
    opacity: isGuide ? 0.9 : 0.55,
  })
}

/**
 * 创建尺寸线材质
 */
export function createDimensionMaterial(context) {
  const material = new LineMaterial({
    color: 0x2f5d62,
    linewidth: 4,
    transparent: true,
    opacity: 0.95,
    depthTest: false,
    depthWrite: false,
    alphaToCoverage: true,
  })
  material.resolution.copy(context.viewportSize)
  return material
}

/**
 * 更新体块材质
 * @param material
 * @param part
 * @param highlighted
 * @param isGuide
 * @param dimmed
 */
export function updateMeshMaterial(material, part, highlighted, isGuide, dimmed) {
  const materials = Array.isArray(material) ? material : [material]
  materials.forEach((item) => {
    if (item instanceof THREE.MeshStandardMaterial) {
      item.color.setHex(highlighted ? 0xf4b942 : partColors[part])
      item.roughness = highlighted ? 0.45 : 0.72
      item.metalness = highlighted ? 0.05 : 0.02
      const transparent = isGuide || dimmed
      if (item.transparent !== transparent) {
        item.transparent = transparent
        item.needsUpdate = true
      }
      // 聚焦辅助体 0.5   非聚焦 0.5      否则 1
      item.opacity = isGuide ? 0.5 : dimmed ? 0.5 : 1
      item.depthWrite = !dimmed
    }
  })
}

/**
 * 更新边线材质
 * @param material
 * @param highlighted
 * @param isGuide
 * @param dimmed
 */
export function updateEdgeMaterial(material, highlighted, isGuide, dimmed) {
  const materials = Array.isArray(material) ? material : [material]
  materials.forEach((item) => {
    if (item instanceof THREE.LineBasicMaterial) {
      item.color.setHex(highlighted ? 0x005f73 : 0x60706a)
      item.opacity = isGuide ? 0.9 : dimmed ? 0.2 : 0.7
      item.depthWrite = !dimmed
    }
  })
}

/**
 * 更新尺寸线材质
 * @param material
 * @param highlighted
 */
export function updateDimensionMaterial(material, highlighted) {
  const materials = Array.isArray(material) ? material : [material]
  materials.forEach((item) => {
    if (item instanceof LineMaterial) {
      item.color.setHex(highlighted ? 0x005f73 : 0x2f5d62)
      item.opacity = highlighted ? 1 : 0.95
    }
  })
}

/**
 * 释放 Three.js 对象占用的 geometry 和 material
 * @param object
 */
export function disposeObject(object) {
  if (
    object instanceof LineSegments2 ||
    object instanceof THREE.Mesh ||
    object instanceof THREE.LineSegments
  ) {
    object.geometry.dispose()
    if (Array.isArray(object.material)) {
      object.material.forEach((material) => material.dispose())
    } else {
      object.material.dispose()
    }
  }
}
