/**
 * 对当前参数 + 派生值执行跨字段一致性验证
 * @param params
 * @param derived
 */
export function validateParams(params, derived, showTrafficBridge = true) {
  const errors = []
  for (const [key, value] of Object.entries(params)) {
    if (!Number.isFinite(value)) {
      errors.push(`${key} 必须是有效数字`)
    } else if (value <= 0) {
      errors.push(`${key} 必须大于 0`)
    }
  }
  if (params.闸门距上游 + params.闸门厚 >= params.闸室长) {
    errors.push('闸门距上游与闸门厚之和必须小于闸室长')
  }
  if (
    showTrafficBridge &&
    params.桥边距上游 + params.交通桥宽 >= params.闸室长
  ) {
    errors.push('桥边距上游与交通桥宽之和必须小于闸室长')
  }
  if (derived.上游渐变段下断面铺盖宽 <= 0) {
    errors.push('上游渐变段下断面铺盖宽推导值必须大于 0')
  }
  if (derived.下游渐变段上断面铺盖宽 <= 0) {
    errors.push('下游渐变段上断面铺盖宽推导值必须大于 0')
  }
  if (params.消力池陡坡段高差 === 0) {
    errors.push('消力池陡坡段高差不能为 0')
  }
  if (derived.上游连接段坡面高度 !== params.上游渐变段上断面坡高) {
    errors.push('上游连接段坡面高度必须等于上游渐变段上断面坡高')
  }
  if (derived.下游连接段坡面宽度 !== params.下游渐变段下断面坡宽) {
    errors.push('下游连接段坡面宽度必须等于下游渐变段下断面坡宽')
  }
  return errors
}
