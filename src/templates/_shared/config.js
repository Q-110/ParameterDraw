// ==================== 基础设置 ====================

export const sluiceBasicFields = [
  { key: '底板顶部标高', label: '底板顶部标高', unit: 'm', step: 0.01 },
  { key: '垫层超出底面距离', label: '垫层超出底面距离', unit: 'cm' },
  { key: '垫层厚度', label: '垫层厚度', unit: 'cm' },
  { key: '止水偏移表面', label: '止水偏移表面', unit: 'cm' },
]

// ==================== 高程推算 ====================

export const sluiceDerivedSections = [
  {
    id: 'elevation',
    fields: [
      { key: '底板高程', label: '底板高程', unit: 'm' },
      { key: '闸顶高程', label: '闸顶高程', unit: 'm' },
      { key: '上游墙顶高程', label: '上游墙顶高程', unit: 'm' },
      { key: '消力池底板高程', label: '消力池底板高程', unit: 'm' },
      { key: '下游底板高程', label: '下游底板高程', unit: 'm' },
      { key: '下游墙顶高程', label: '下游墙顶高程', unit: 'm' },
      { key: '坡比值', label: '坡比值', decimals: 1 },
      { key: '渠坡比', label: '渠坡比' },
      { key: '陡坡比值', label: '陡坡比值', decimals: 1 },
      { key: '陡坡比', label: '陡坡比' },
    ],
  },
]

// ==================== 项目默认 ====================

export const defaultProject = {
  工程名称: '参数化自动出图',
  文档名称: 'XXX水闸结构图',
  图纸编号规则: 'HN-CBISHI-',
  设计专业: '水工',
  设计阶段: '施工图',
  出图时间: '2026.06',
  主材类型: 'C30钢筋混凝土',
  垫层类型1: 'C15混凝土垫层',
  垫层类型2: '碎石垫层',
}

// ==================== 输出默认 ====================

export const defaultOutput = {
  savepath: 'D:\\Desktop\\ParameterDrawOutput',
}
