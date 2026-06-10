/**
 * 将 params.py 中的厘米尺寸换算为 Three.js 预览单位
 * 这里只做统一单位换算   最终显示大小由 fitPartToView 统一处理
 * @param value   厘米值
 */
export function cm(value) {
  return value * 0.01
}
