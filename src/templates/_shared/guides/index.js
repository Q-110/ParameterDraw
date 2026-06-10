import { addConnectionGuides } from './connection'
import { addGateGuides } from './gate'
import { explicitGuideKeys } from './keys'
import { addStillingGuides } from './stilling'
import { addTransitionGuides } from './transition'

/**
 * 为当前部件创建全部显式尺寸辅助线
 * @param context
 * @param params
 * @param derived
 * @param options
 */
export function addSluicePreviewGuides(context, params, derived, options) {
  assertGuideCoverage(options.groups)
  if (context.part === 'gate') {
    addGateGuides(context, params, derived, options.showTrafficBridge)
  } else if (context.part === 'stilling') {
    addStillingGuides(context, params, derived)
  } else if (context.part === 'upstreamConnection') {
    addConnectionGuides(
      context,
      params,
      derived,
      true,
    )
  } else if (context.part === 'downstreamConnection') {
    addConnectionGuides(
      context,
      params,
      derived,
      false,
    )
  } else if (context.part === 'upstreamTransition') {
    addTransitionGuides(
      context,
      params,
      derived,
      true,
    )
  } else {
    addTransitionGuides(
      context,
      params,
      derived,
      false,
    )
  }
}

/**
 * 校验所有厘米字段都存在显式尺寸规则
 * @param groups
 */
function assertGuideCoverage(groups) {
  const missing = groups
    .flatMap((group) => group.fields)
    .filter((field) => field.unit === 'cm' && !field.readonly && !explicitGuideKeys.has(field.key))
    .map((field) => field.key)
  if (missing.length > 0) {
    throw new Error(`缺少预览尺寸规则 ${missing.join('  ')}`)
  }
}
