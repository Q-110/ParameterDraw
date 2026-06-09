import type { FieldGroup, ParameterValue, TemplateDefinition, TemplateParameters } from '../../types'
import { sluiceBasicFields, sluiceDerivedSections } from '../shared/sluice/configuration'
import { computeDerived, defaultParams, fieldGroups, validateParams } from '../shared/sluice/model'
import SluicePreview from '../shared/sluice/preview/SluicePreview.vue'
import type { DerivedValues, SluicePreviewParameters } from '../shared/sluice/types'

const trafficParameterKeys = new Set([
  '交通桥宽',
  '交通桥厚',
  '桥边距上游',
  '搭板长',
  '交通桥护边厚',
  '交通桥护边高',
])

const defaults = Object.fromEntries(
  Object.entries(defaultParams).filter(([key]) => !trafficParameterKeys.has(key)),
)

const groups: FieldGroup[] = fieldGroups.map((group) => ({
  ...group,
  fields: group.fields.filter((field) => !trafficParameterKeys.has(field.key)),
}))

const template: TemplateDefinition = {
  id: '02渐变扭+单孔+检修+无交通+消力+渐变扭',
  name: '单孔检修无交通桥水闸',
  order: 20,
  defaults,
  basicFields: sluiceBasicFields,
  groups,
  derivedSections: sluiceDerivedSections,
  computeDerived(parameters, project) {
    return computeDerived(
      { ...defaultParams, ...parameters } as SluicePreviewParameters,
      project,
    ) as unknown as Record<string, ParameterValue>
  },
  validate(parameters, project) {
    const params = { ...defaultParams, ...parameters } as SluicePreviewParameters
    return validateParams(params, computeDerived(params, project), false)
  },
  preview: {
    component: SluicePreview,
    makeProps(parameters: TemplateParameters, derived, currentGroups) {
      return {
        params: { ...defaultParams, ...parameters } as SluicePreviewParameters,
        derived: derived as unknown as DerivedValues,
        groups: currentGroups,
        previewOptions: {
          showTrafficBridge: false,
        },
      }
    },
  },
}

export default template
