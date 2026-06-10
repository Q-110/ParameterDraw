import {
  sluiceBasicFields,
  sluiceDerivedSections,
} from '../sluice/configuration'
import {
  computeDerived as computeSluiceDerived,
  defaultParams,
  fieldGroups,
  validateParams,
} from '../sluice/model'
import { SluicePreview } from '../sluice/preview'

const trafficParameterKeys = new Set([
  '交通桥宽',
  '交通桥厚',
  '桥边距上游',
  '搭板长',
  '交通桥护边厚',
  '交通桥护边高',
])

// 无交通桥模板直接过滤交通桥参数   避免保存和出图时传递无效字段
const defaults = Object.fromEntries(
  Object.entries(defaultParams).filter(
    ([key]) => !trafficParameterKeys.has(key),
  ),
)

const groups = fieldGroups.map((group) => ({
  ...group,
  fields: group.fields.filter((field) => !trafficParameterKeys.has(field.key)),
}))

const template = {
  id: '02渐变扭+单孔+检修+无交通+消力+渐变扭',
  name: '02渐变扭+单孔+检修+无交通+消力+渐变扭',
  order: 20,
  defaults,
  basicFields: sluiceBasicFields,
  groups,
  derivedSections: sluiceDerivedSections,

  /**
   * 计算无交通桥模板派生参数
   */
  computeDerived(parameters, project) {
    return computeSluiceDerived(parameters, project)
  },

  /**
   * 校验无交通桥模板参数
   */
  validate(parameters, project) {
    return validateParams(
      parameters,
      computeSluiceDerived(parameters, project),
      false,
    )
  },

  preview: {
    component: SluicePreview,

    /**
     * 生成无交通桥模板预览属性
     */
    makeProps(parameters, derived, currentGroups) {
      return {
        params: parameters,
        derived,
        groups: currentGroups,
        previewOptions: {
          showTrafficBridge: false,
        },
      }
    },
  },
}

export default template
