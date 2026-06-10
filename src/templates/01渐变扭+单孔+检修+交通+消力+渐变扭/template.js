import {
  sluiceBasicFields,
  sluiceDerivedSections,
} from '../configuration'
import {
  computeDerived as computeSluiceDerived,
  defaultParams,
  fieldGroups,
  validateParams,
} from '../model'
import { SluicePreview } from '../preview'

const template = {
  id: '01渐变扭+单孔+检修+交通+消力+渐变扭',
  name: '01渐变扭+单孔+检修+交通+消力+渐变扭',
  order: 10,
  isDefault: true,
  defaults: { ...defaultParams },
  basicFields: sluiceBasicFields,
  groups: fieldGroups,
  derivedSections: sluiceDerivedSections,

  /**
   * 计算交通桥模板派生参数
   */
  computeDerived(parameters, project) {
    return computeSluiceDerived(parameters, project)
  },

  /**
   * 校验交通桥模板参数
   */
  validate(parameters, project) {
    return validateParams(
      parameters,
      computeSluiceDerived(parameters, project),
      true,
    )
  },

  preview: {
    component: SluicePreview,

    /**
     * 生成交通桥模板预览属性
     */
    makeProps(parameters, derived, groups) {
      return {
        params: parameters,
        derived,
        groups,
        previewOptions: {
          showTrafficBridge: true,
        },
      }
    },
  },
}

export default template
