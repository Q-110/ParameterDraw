import {
  sluiceBasicFields,
  sluiceDerivedSections,
} from '../_shared/config'
import {
  computeDerived,
  defaults,
  groups,
  validate,
} from './model'
import { SluicePreview } from '../_shared/preview'

const template = {
  id: '01渐变扭+单孔+检修+交通+消力+渐变扭',
  name: '01渐变扭+单孔+检修+交通+消力+渐变扭',
  order: 10,
  isDefault: true,
  defaults: { ...defaults },
  basicFields: sluiceBasicFields,
  groups,
  derivedSections: sluiceDerivedSections,
  computeDerived,

  validate(parameters, project) {
    return validate(parameters, computeDerived(parameters, project))
  },

  preview: {
    component: SluicePreview,

    makeProps(parameters, derived, currentGroups) {
      return {
        params: parameters,
        derived,
        groups: currentGroups,
        previewOptions: {},
      }
    },
  },
}

export default template
