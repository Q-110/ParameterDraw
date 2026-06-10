// 基础设置字段与后端 params.py 使用同名参数
export const sluiceBasicFields = [
  { key: '底板顶部标高', label: '底板顶部标高', unit: 'm', step: 0.01 },
  { key: '垫层超出底面距离', label: '垫层超出底面距离', unit: 'cm' },
  { key: '垫层厚度', label: '垫层厚度', unit: 'cm' },
  { key: '止水偏移表面', label: '止水偏移表面', unit: 'cm' },
]

// 派生值只负责展示   实际计算集中在 model 目录
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
    ],
  },
  {
    id: 'geometry',
    fields: [
      { key: '闸门宽', label: '闸门宽', unit: 'cm', decimals: 2 },
      { key: '闸总宽', label: '闸总宽', unit: 'cm', decimals: 2 },
      {
        key: '上游渐变段下断面铺盖宽',
        label: '上游下断面铺盖宽',
        unit: 'cm',
        decimals: 2,
      },
      {
        key: '下游渐变段上断面铺盖宽',
        label: '下游上断面铺盖宽',
        unit: 'cm',
        decimals: 2,
      },
      { key: '渠坡比', label: '渠坡比' },
      { key: '陡坡比', label: '陡坡比' },
    ],
  },
]
