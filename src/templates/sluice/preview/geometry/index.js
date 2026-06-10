import { addSluicePreviewGuides } from '../guides'
import { buildConnection } from './connection'
import { buildGate } from './gate'
import { buildStilling } from './stilling'
import { buildTransition } from './transition'

/**
 * 按部件分派几何构建函数
 * @param context
 * @param params
 * @param derived
 * @param options
 */
export function buildSluicePart(context, params, derived, options) {
  if (context.part === 'gate') {
    buildGate(context, params, derived, options.showTrafficBridge)
  } else if (context.part === 'stilling') {
    buildStilling(context, params, derived)
  } else if (context.part === 'upstreamConnection') {
    buildConnection(context, params, derived, true)
  } else if (context.part === 'downstreamConnection') {
    buildConnection(context, params, derived, false)
  } else if (context.part === 'upstreamTransition') {
    buildTransition(context, params, derived, true)
  } else {
    buildTransition(context, params, derived, false)
  }
  addSluicePreviewGuides(context, params, derived, options)
}
