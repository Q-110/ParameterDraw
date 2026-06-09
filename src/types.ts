export type PartId = 'gate' | 'stilling' | 'upstreamTransition' | 'upstreamConnection' | 'downstreamTransition' | 'downstreamConnection'
export type ParameterValue = string | number | boolean
export type TemplateParameters = Record<string, ParameterValue>
export type ParamKey = string

// 项目属性
// 写入方案 JSON  &&  在后端 params.py 中覆盖图纸相关默认值
export interface ProjectInfo {
  工程名称: string
  文档名称: string
  图纸编号规则: string
  设计专业: string
  设计阶段: string
  出图时间: string
  主材类型: string
  垫层类型1: string
  垫层类型2: string
}

// 输出目录
export interface OutputInfo {
  savepath: string
}

// 基础参数
/**
 * 水闸三维预览适配器使用的参数
 * 仅约束当前水闸预览   不作为方案参数的全局结构
 */
export interface SluicePreviewParameters {
  底板顶部标高: number
  垫层超出底面距离: number
  垫层厚度: number
  止水偏移表面: number
  闸室长: number
  闸孔净宽: number
  闸底板厚: number
  边墩厚: number
  中墙厚: number
  闸墩高: number
  齿墙高: number
  齿墙宽: number
  闸门距上游: number
  闸门厚: number
  门槽入闸墩深: number
  门槽深: number
  门槽二期宽: number
  检修桥入闸墩深: number
  检修桥板厚: number
  检修桥板宽: number
  交通桥宽: number
  交通桥厚: number
  桥边距上游: number
  搭板长: number
  交通桥护边厚: number
  交通桥护边高: number
  闸孔数: number
  上游渐变段中首断面距离: number
  上游渐变段中断面底宽: number
  上游渐变段中断面坡高: number
  上游渐变段中断面坡宽: number
  上游渐变段中断面趾高: number
  上游渐变段中断面趾宽: number
  上游渐变段中断面踵高: number
  上游渐变段中断面顶端高: number
  上游渐变段中断面顶端宽: number
  上游渐变段上断面铺盖宽: number
  上游渐变段上断面坡高: number
  上游渐变段上断面坡宽: number
  上游渐变段上断面底宽: number
  上游渐变段下断面底宽: number
  上游渐变段下断面坡高: number
  上游渐变段断面铺盖厚: number
  上游渐变段铺盖齿墙高: number
  上游渐变段铺盖齿墙宽: number
  上游连接段底板长度: number
  上游连接段底板厚度: number
  上游连接段底板齿墙高: number
  上游连接段底板齿墙宽: number
  上游连接段坡顶压坡宽: number
  上游连接段坡底槽宽: number
  上游连接段坡底槽高: number
  上游连接段坡底外槽宽: number
  上游连接段坡板厚度: number
  上游连接段坡齿厚度: number
  上游连接段坡齿宽度: number
  消力池陡坡段平直段长度: number
  消力池陡坡段长度: number
  消力池陡坡段高差: number
  消力池长度: number
  消力池底板厚度: number
  消力池齿墙底宽: number
  消力池齿墙高度: number
  消力池陡坡段上部墙宽: number
  消力池陡坡段下部墙宽: number
  消力池墙高: number
  消力池斜墙段高度: number
  消力坎高: number
  消力坎顶宽: number
  下游渐变段中末断面距离: number
  下游渐变段中断面底宽: number
  下游渐变段中断面坡宽: number
  下游渐变段中断面趾高: number
  下游渐变段中断面趾宽: number
  下游渐变段中断面踵高: number
  下游渐变段中断面顶端高: number
  下游渐变段中断面顶端宽: number
  下游渐变段上断面底宽: number
  下游渐变段下断面铺盖宽: number
  下游渐变段下断面底宽: number
  下游渐变段下断面坡宽: number
  下游渐变段断面铺盖厚: number
  下游渐变段铺盖齿墙高: number
  下游渐变段铺盖齿墙宽: number
  下游连接段底板长度: number
  下游连接段底板厚度: number
  下游连接段底板齿墙高: number
  下游连接段底板齿墙宽: number
  下游连接段坡顶压坡宽: number
  下游连接段坡底槽宽: number
  下游连接段坡底槽高: number
  下游连接段坡底外槽宽: number
  下游连接段坡板厚度: number
  下游连接段坡齿厚度: number
  下游连接段坡齿宽度: number
}

export type PreviewParamKey = keyof SluicePreviewParameters

// 字段配置
export interface FieldDefinition {
  key: ParamKey
  label: string
  unit: string
  part: PartId
  region: string
  guideRegion?: string
}

export interface FieldGroup {
  id: PartId
  title: string
  fields: FieldDefinition[]
}

// 派生值
export interface DerivedValues {
  闸门宽: number
  闸总宽: number
  上游渐变段中末断面距离: number
  上游渐变段下断面铺盖宽: number
  上游渐变段中断面铺盖宽: number
  上游连接段坡面高度: number
  上游连接段坡面宽度: number
  上游连接段渠底板宽: number
  消力池陡坡段墙高: number
  消力池底板宽度: number
  下游渐变段中断面坡高: number
  下游渐变段上断面铺盖宽: number
  下游渐变段上断面坡高: number
  下游渐变段中首断面距离: number
  下游渐变段中断面铺盖宽: number
  下游连接段坡面高度: number
  下游连接段坡面宽度: number
  下游连接段渠底板宽: number
  底板高程: string
  闸顶高程: string
  上游墙顶高程: string
  消力池底板高程: string
  下游底板高程: string
  下游墙顶高程: string
  渠坡比: string
  陡坡比: string
  上游连接段底板: string
  上游渐变段底板: string
  闸室底板: string
  消力池底板: string
  下游渐变段底板: string
  下游连接段底板: string
  C15垫层砼: string
  allParameters: Record<string, number | string>
}

export interface PreviewOptions {
  showTrafficBridge: boolean
}

export interface TemplateDefinition {
  id: string
  name: string
  defaults: TemplateParameters
  groups: FieldGroup[]
  validate: (parameters: TemplateParameters) => string[]
  computeDerived: (parameters: TemplateParameters, project: ProjectInfo) => Record<string, ParameterValue>
  previewAdapter: 'sluice'
  previewOptions: PreviewOptions
}

// 方案文件是前端保存、后端出图和 Electron IPC 的统一数据结构
export interface SchemeData {
  templateId: string
  name: string
  project: ProjectInfo
  output: OutputInfo
  parameters: TemplateParameters
  derived: Record<string, ParameterValue>
}

export interface FocusTarget {
  part: PartId
  region: string
  guideRegion?: string
  key: string
}

export interface RunResult {
  success: boolean
  outputDir: string
  logs: string[]
}

export type RunState = 'idle' | 'running' | 'success' | 'failed'

export interface ElectronSchemeFile {
  filePath: string
  content: string
}
