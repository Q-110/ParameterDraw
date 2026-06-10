/**
 * 批量加载所有模板定义
 */
const templateModules = import.meta.glob('./*/template.js', {
  eager: true,        // 模块初始化时同步加载全部匹配
  import: 'default',  // 只取每个模块的 default export
})


/**
 * 排序并导出模板数组
 */
export const templateDefinitions = Object.values(templateModules).sort(
  (left, right) => left.order - right.order,
)


/**
 * 运行时检测模板 ID 重复
 */
const templateIds = new Set()
for (const template of templateDefinitions) {
  if (templateIds.has(template.id)) {
    throw new Error(`模板标识重复  ${template.id}`)
  }
  templateIds.add(template.id)
}


/**
 * 校验默认模板配置
 */
const defaultTemplates = templateDefinitions.filter(
  (template) => template.isDefault,
)

// 超过了一个默认模板
if (defaultTemplates.length > 1) {
  throw new Error('只能配置一个默认模板')
}

// 没有模板
if (templateDefinitions.length === 0) {
  throw new Error('未发现前端模板')
}


/**
 * 导出默认模板
 */
export const defaultTemplate = defaultTemplates[0] ?? templateDefinitions[0]

/**
 * 根据 ID 查找模板
 */
export function getTemplateDefinition(templateId) {
  return templateDefinitions.find((template) => template.id === templateId)
}
