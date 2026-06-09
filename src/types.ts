import type { Component } from 'vue'

export type ParameterValue = string | number | boolean
export type TemplateParameters = Record<string, ParameterValue>
export type ParamKey = string
export type PartId = string

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

export interface OutputInfo {
  savepath: string
}

export interface FieldDefinition {
  key: ParamKey
  label: string
  unit: string
  step?: number
  part?: PartId
  region?: string
  guideRegion?: string
}

export interface FieldGroup {
  id: PartId
  title: string
  fields: FieldDefinition[]
}

export interface DerivedFieldDefinition {
  key: string
  label: string
  unit?: string
  decimals?: number
}

export interface DerivedSectionDefinition {
  id: string
  title?: string
  fields: DerivedFieldDefinition[]
}

export interface TemplatePreviewDefinition {
  component: Component
  makeProps: (
    parameters: TemplateParameters,
    derived: Record<string, ParameterValue>,
    groups: FieldGroup[],
  ) => Record<string, unknown>
}

export interface TemplateDefinition {
  id: string
  name: string
  order: number
  isDefault?: boolean
  defaults: TemplateParameters
  basicFields: FieldDefinition[]
  groups: FieldGroup[]
  derivedSections: DerivedSectionDefinition[]
  validate: (parameters: TemplateParameters, project: ProjectInfo) => string[]
  computeDerived: (parameters: TemplateParameters, project: ProjectInfo) => Record<string, ParameterValue>
  preview: TemplatePreviewDefinition
}

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
