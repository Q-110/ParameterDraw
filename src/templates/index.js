const templateModules = import.meta.glob('./*/template.js', {
  eager: true,
  import: 'default',
})

export const templateDefinitions = Object.values(templateModules).sort(
  (left, right) => left.order - right.order,
)

const templateIds = new Set()
for (const template of templateDefinitions) {
  if (templateIds.has(template.id)) {
    throw new Error(`模板标识重复  ${template.id}`)
  }
  templateIds.add(template.id)
}

const defaultTemplates = templateDefinitions.filter(
  (template) => template.isDefault,
)
if (defaultTemplates.length > 1) {
  throw new Error('只能配置一个默认模板')
}
if (templateDefinitions.length === 0) {
  throw new Error('未发现前端模板')
}

export const defaultTemplate = defaultTemplates[0] ?? templateDefinitions[0]

/**
 * 根据模板标识获取模板定义
 * @param templateId   模板标识
 */
export function getTemplateDefinition(templateId) {
  return templateDefinitions.find((template) => template.id === templateId)
}
