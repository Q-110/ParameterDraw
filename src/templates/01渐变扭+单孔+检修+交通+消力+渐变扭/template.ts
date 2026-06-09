import type { ParameterValue, TemplateDefinition, TemplateParameters } from '../../types'
import { sluiceBasicFields, sluiceDerivedSections } from '../shared/sluice/configuration'
import { computeDerived, defaultParams, fieldGroups, validateParams } from '../shared/sluice/model'
import SluicePreview from '../shared/sluice/preview/SluicePreview.vue'
import type { DerivedValues, SluicePreviewParameters } from '../shared/sluice/types'

const template: TemplateDefinition = {
  id: '01渐变扭+单孔+检修+交通+消力+渐变扭',
  name: '单孔检修交通桥水闸',
  order: 10,
  isDefault: true,
  defaults: { ...defaultParams },
  basicFields: sluiceBasicFields,
  groups: fieldGroups,
  derivedSections: sluiceDerivedSections,
  computeDerived(parameters, project) {
    return computeDerived(
      parameters as unknown as SluicePreviewParameters,
      project,
    ) as unknown as Record<string, ParameterValue>
  },
  validate(parameters, project) {
    const params = parameters as unknown as SluicePreviewParameters
    return validateParams(params, computeDerived(params, project), true)
  },
  preview: {
    component: SluicePreview,
    makeProps(parameters: TemplateParameters, derived, groups) {
      return {
        params: parameters as unknown as SluicePreviewParameters,
        derived: derived as unknown as DerivedValues,
        groups,
        previewOptions: {
          showTrafficBridge: true,
        },
      }
    },
  },
}

export default template
