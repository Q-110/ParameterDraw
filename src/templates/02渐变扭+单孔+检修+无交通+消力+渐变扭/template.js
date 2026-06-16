import {
  sluiceBasicFields,
  sluiceDerivedSections,
} from '../_shared/config'
import homeModelUrl from '../../../../02渐变扭+单孔+检修+无交通+消力+渐变扭/02整体模型.glb?url'
import {
  computeDerived,
  defaults,
  groups,
  validate,
} from './model'
import { SluicePreview } from '../_shared/preview'

const template = {
  id: '02渐变扭+单孔+检修+无交通+消力+渐变扭',
  name: '02渐变扭+单孔+检修+无交通+消力+渐变扭',
  category: 'sluice',
  order: 20,
  homeModelUrl,
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
