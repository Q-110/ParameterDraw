import type {
  FieldGroup,
  ParameterValue,
  ProjectInfo,
  SluicePreviewParameters,
  TemplateDefinition,
  TemplateParameters,
} from '../types'
import { computeDerived, defaultParams, fieldGroups, validateParams } from './parameters'

export const TEMPLATE_WITH_TRAFFIC = '01渐变扭+单孔+检修+交通+消力+渐变扭'
export const TEMPLATE_WITHOUT_TRAFFIC = '02渐变扭+单孔+检修+无交通+消力+渐变扭'

const trafficParameterKeys = new Set([
  '交通桥宽',
  '交通桥厚',
  '桥边距上游',
  '搭板长',
  '交通桥护边厚',
  '交通桥护边高',
])

const commonGroups: FieldGroup[] = fieldGroups.map((group) => ({
  ...group,
  fields: group.fields.filter((field) => !trafficParameterKeys.has(field.key)),
}))

const commonDefaults = Object.fromEntries(
  Object.entries(defaultParams).filter(([key]) => !trafficParameterKeys.has(key)),
)

/**
 * 将动态模板参数交给当前水闸公式
 * 模板定义负责保证字段完整   预览公式不承担模板参数管理
 */
function computeSluiceDerived(parameters: TemplateParameters, project: ProjectInfo) {
  return computeDerived(parameters as unknown as SluicePreviewParameters, project) as unknown as Record<string, ParameterValue>
}

/**
 * 校验有交通桥模板
 */
function validateTrafficTemplate(parameters: TemplateParameters) {
  const params = parameters as unknown as SluicePreviewParameters
  return validateParams(params, computeDerived(params, defaultProjectForValidation), true)
}

/**
 * 校验无交通桥模板
 * 公式计算需要交通桥字段时使用预览默认值补齐   后端方案仍不会收到这些字段
 */
function validateNoTrafficTemplate(parameters: TemplateParameters) {
  const params = { ...defaultParams, ...parameters } as SluicePreviewParameters
  return validateParams(params, computeDerived(params, defaultProjectForValidation), false)
}

const defaultProjectForValidation: ProjectInfo = {
  工程名称: '',
  文档名称: '',
  图纸编号规则: '',
  设计专业: '',
  设计阶段: '',
  出图时间: '',
  主材类型: '',
  垫层类型1: '',
  垫层类型2: '',
}

export const templateDefinitions: TemplateDefinition[] = [
  {
    id: TEMPLATE_WITH_TRAFFIC,
    name: '单孔检修交通桥水闸',
    defaults: { ...defaultParams },
    groups: fieldGroups,
    validate: validateTrafficTemplate,
    computeDerived: computeSluiceDerived,
    previewAdapter: 'sluice',
    previewOptions: {
      showTrafficBridge: true,
    },
  },
  {
    id: TEMPLATE_WITHOUT_TRAFFIC,
    name: '单孔检修无交通桥水闸',
    defaults: commonDefaults,
    groups: commonGroups,
    validate: validateNoTrafficTemplate,
    computeDerived: (parameters, project) => computeSluiceDerived({ ...defaultParams, ...parameters }, project),
    previewAdapter: 'sluice',
    previewOptions: {
      showTrafficBridge: false,
    },
  },
]

export const defaultTemplate = templateDefinitions[0]

/**
 * 根据模板标识获取前端模板定义
 */
export function getTemplateDefinition(templateId: string) {
  return templateDefinitions.find((template) => template.id === templateId)
}
