<template>
  <main class="app-shell">
    <aside class="layout-column sidebar">
      <SchemePanel
        ref="schemePanel"
        :scheme-name="schemeName"
        :run-state="runState"
        :validation-error-count="validationErrors.length"
        :template-id="templateId"
        :templates="templateDefinitions"
        @update:scheme-name="schemeName = $event"
        @update:template-id="switchTemplate"
        @new="newScheme"
        @open="openScheme"
        @save="saveScheme"
        @save-as="saveSchemeAs"
        @run="runDrawing"
        @browser-file-change="handleBrowserFile"
      />

      <ProjectSettings
        :project="project"
        :output="output"
        :is-electron="isElectron"
        @update-project="updateProject"
        @select-output-directory="selectOutputDirectory"
      />
    </aside>

    <section class="layout-column center-column">
      <section class="parameter-area">
        <ParameterForm
          :groups="currentTemplate.groups"
          :active-group-id="activeGroupId"
          :active-group="activeGroup"
          :params="params"
          @update:active-group-id="activeGroupId = $event"
          @update-param="updateParam"
          @focus-field="setFieldFocus"
          @blur-field="clearFieldFocus"
        />

        <ValidationPanel
          v-if="validationErrors.length > 0"
          :errors="validationErrors"
        />
      </section>

      <section class="center-bottom">
        <BasicParameterPanel
          :fields="currentTemplate.basicFields"
          :params="params"
          @update-param="updateParam"
        />
        <DerivedPanel
          :sections="currentTemplate.derivedSections"
          :derived="derived"
        />
      </section>
    </section>

    <section class="layout-column right-column">
      <section class="panel preview-panel">
        <TemplatePreviewHost
          :template="currentTemplate"
          :params="params"
          :derived="derived"
          :focus="focused"
          :active-part-id="activeGroupId"
        />
      </section>
      <RunLogPanel :logs="logs" @clear="logs = []" />
    </section>
  </main>
</template>

<script setup>
import { computed, onBeforeUnmount, reactive, ref } from 'vue'
import BasicParameterPanel from './components/BasicParameterPanel.vue'
import DerivedPanel from './components/DerivedPanel.vue'
import ParameterForm from './components/ParameterForm.vue'
import ProjectSettings from './components/ProjectSettings.vue'
import RunLogPanel from './components/RunLogPanel.vue'
import SchemePanel from './components/SchemePanel.vue'
import TemplatePreviewHost from './components/TemplatePreviewHost.vue'
import ValidationPanel from './components/ValidationPanel.vue'
import { defaultProject } from './project'
import {
  defaultTemplate,
  getTemplateDefinition,
  templateDefinitions,
} from './templates'

/**
 * 维护当前方案的基础状态   所有派生值都由这些状态实时计算
 */
const schemeName = ref('默认水闸方案')
const schemePath = ref(null)
const templateId = ref(defaultTemplate.id)
const project = reactive({ ...defaultProject })
const output = reactive({ savepath: 'D:\\Desktop\\ParameterDrawOutput' })
const params = reactive({ ...defaultTemplate.defaults })
const templateParameterCache = new Map()
const activeGroupId = ref(defaultTemplate.groups[0].id)
const focused = ref(null)
const logs = ref([])
// 运行状态
// idle      空闲       初始值、清空日志、加载方案后
// running   出图中     调用 window.sluice.runDrawing() 之前
// success   出图成功   Python 进程退出码为 0
// failed    出图失败   校验没通过、浏览器模式、Python 进程退出码非 0
const runState = ref('idle')
const schemePanel = ref(null)

/**
 * 实时接收主进程转发的 Python 日志  浏览器预览模式下该接口不存在
 */
// Electron preload 注入的桌面能力；浏览器预览模式下该对象不存在。
const removeLogListener = window.sluice?.onDrawingLog((text) => {
  logs.value.push(text.trimEnd())
})

onBeforeUnmount(() => {
  removeLogListener?.()
})

/**
 * 派生值和校验集中从同一套参数计算
 */
// 派生值
const currentTemplate = computed(() => getTemplateDefinition(templateId.value))
const derived = computed(() =>
  currentTemplate.value.computeDerived(params, project),
)
// 一致性验证
const validationErrors = computed(() =>
  currentTemplate.value.validate(params, project),
)
// 参数分组
const activeGroup = computed(() =>
  currentTemplate.value.groups.find(
    (group) => group.id === activeGroupId.value,
  ),
)
// 是否运行在 Electron 环境中
const isElectron = computed(() => Boolean(window.sluice))

/**
 * 生成保存和出图共用的方案 JSON
 */
function makeScheme() {
  return {
    templateId: templateId.value,
    name: schemeName.value,
    project: { ...project },
    output: { ...output },
    parameters: { ...params },
    derived: derived.value,
  }
}

/**
 * 新方案 重置为默认参数
 */
function newScheme() {
  schemeName.value = '默认水闸方案'
  schemePath.value = null
  templateId.value = defaultTemplate.id
  templateParameterCache.clear()
  Object.assign(project, defaultProject)
  Object.assign(output, { savepath: 'D:\\Desktop\\ParameterDrawOutput' })
  Object.keys(params).forEach((key) => delete params[key])
  Object.assign(params, defaultTemplate.defaults)
  activeGroupId.value = defaultTemplate.groups[0].id
  logs.value = []
  runState.value = 'idle'
}

/**
 * lectron 模式使用系统文件对话框  浏览器模式退化为子组件内的 file input
 * Electron 模式直接读取本地方案  浏览器模式使用文件输入框
 */
async function openScheme() {
  if (window.sluice) {
    const file = await window.sluice.openScheme()
    if (file) {
      loadScheme(JSON.parse(file.content), file.filePath)
    }
    return
  }
  schemePanel.value?.openBrowserFilePicker()
}

/**
 * 保存方案
 */
async function saveScheme() {
  // 将当前方案序列化为 JSON 字符串
  const content = JSON.stringify(makeScheme(), null, 2)

  if (window.sluice) {
    // Electron 环境   通过 IPC 写入本地文件
    const savedPath = await window.sluice.saveScheme({
      filePath: schemePath.value,
      name: schemeName.value,
      content,
    })
    if (savedPath) {
      schemePath.value = savedPath //更新当前方案路径
    }
    return
  }

  // 浏览器预览模式降级   存 localStorage 并下载文件
  localStorage.setItem('sluice.scheme', content)
  downloadScheme(content)
}

/**
 * 另存为
 */
async function saveSchemeAs() {
  const content = JSON.stringify(makeScheme(), null, 2)
  if (window.sluice) {
    const savedPath = await window.sluice.saveSchemeAs({
      name: schemeName.value,
      content,
    })
    if (savedPath) {
      schemePath.value = savedPath
    }
    return
  }
  downloadScheme(content)
}

/**
 * 出图前先执行前端公式一致性校验  避免明显错误参数进入 Inventor 流程
 */
async function runDrawing() {
  logs.value = []

  // 前端校验参数
  if (validationErrors.value.length > 0) {
    runState.value = 'failed'
    logs.value.push('参数校验未通过，已停止出图。')
    validationErrors.value.forEach((error) => logs.value.push(error))
    return
  }

  // 检查 window.sluice 是否存在
  if (!window.sluice) {
    runState.value = 'failed'
    logs.value.push(
      '当前是浏览器预览模式，出图需要在 Electron 桌面窗口中执行。',
    )
    return
  }

  // 设置状态
  runState.value = 'running'

  // 进去 preload
  const result = await window.sluice.runDrawing(makeScheme())

  // 更新状态
  runState.value = result.success ? 'success' : 'failed'

  if (result.logs.length > 0) {
    logs.value.push(...result.logs.map((line) => line.trimEnd()))
  }
  logs.value.push(
    result.success ? `出图完成：${result.outputDir}` : '出图失败！',
  )
}

/**
 * 加载方案时保留默认值作为兜底  旧方案缺字段时仍能打开
 * 当前版本停用旧方案兼容逻辑  仅按最新方案结构直接加载
 * @param raw
 * @param filePath
 */
function loadScheme(raw, filePath) {
  const template = getTemplateDefinition(raw.templateId)

  schemeName.value = raw.name
  schemePath.value = filePath
  templateId.value = template.id
  Object.assign(project, raw.project)
  Object.assign(output, raw.output)
  Object.keys(params).forEach((key) => delete params[key])
  Object.assign(params, raw.parameters)
  templateParameterCache.clear()
  templateParameterCache.set(template.id, { ...params })
  activeGroupId.value = template.groups[0].id
  logs.value = []
  runState.value = 'idle'
}

/**
 * 浏览器预览模式没有 Electron 文件系统能力  只用于本地调试方案导入
 * @param event
 */
function handleBrowserFile(event) {
  const input = event.target // 获取用户选择的文件
  const file = input.files?.[0]
  if (!file) {
    return
  }
  const reader = new FileReader()
  reader.onload = () => loadScheme(JSON.parse(String(reader.result)), file.name)
  reader.readAsText(file, 'utf-8')
  input.value = ''
}

/**
 * 子组件只上报字段变化
 * @param key
 * @param value
 */
function updateProject(key, value) {
  project[key] = value
}

/**
 * 选择出图保存目录
 */
async function selectOutputDirectory() {
  if (window.sluice) {
    const selectedPath = await window.sluice.selectOutputDirectory()
    if (selectedPath) {
      output.savepath = selectedPath
    }
    return
  }

  const directoryPicker = window.showDirectoryPicker
  if (!directoryPicker) {
    logs.value.push(
      '当前浏览器不支持选择本地文件夹，浏览器预览模式只能手动保留当前保存路径。',
    )
    return
  }

  try {
    const directory = await directoryPicker()
    if (directory.name) {
      output.savepath = directory.name
      logs.value.push(
        `浏览器预览模式无法获取绝对路径，已使用相对路径：${directory.name}`,
      )
    }
  } catch {
    // 用户取消浏览器目录选择时不更新路径
  }
}

/**
 * 参数变化
 * @param key
 * @param value
 */
function updateParam(key, value) {
  params[key] = value
}

/**
 * 切换模板
 * 首次进入使用目标模板默认值   再次进入恢复目标模板缓存
 */
function switchTemplate(nextTemplateId) {
  const nextTemplate = getTemplateDefinition(nextTemplateId)
  if (nextTemplate.id === templateId.value) {
    return
  }

  templateParameterCache.set(templateId.value, { ...params })
  const cached = templateParameterCache.get(nextTemplate.id)
  const nextParameters = cached ? { ...cached } : { ...nextTemplate.defaults }

  Object.keys(params).forEach((key) => delete params[key])
  Object.assign(params, nextParameters)
  templateId.value = nextTemplate.id
  activeGroupId.value = nextTemplate.groups[0].id
  focused.value = null
  logs.value = []
  runState.value = 'idle'
}

/**
 * 输入框聚焦时把字段映射到 3D 部件区域      高亮对应几何
 * @param field
 */
function setFieldFocus(field) {
  if (!field.part || !field.region) {
    return
  }
  focused.value = {
    part: field.part,
    region: field.region,
    guideRegion: field.guideRegion,
    key: field.label,
  }
}

/**
 * 清空当前聚焦字段
 */
function clearFieldFocus() {
  focused.value = null
}

/**
 * 浏览器预览模式下通过下载文件模拟“另存方案”
 * @param content
 */
function downloadScheme(content) {
  const blob = new Blob([content], { type: 'application/json;charset=utf-8' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `${schemeName.value || '水闸方案'}.json`
  link.click()
  URL.revokeObjectURL(link.href)
}
</script>
