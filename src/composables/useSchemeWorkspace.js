import { computed, onBeforeUnmount, reactive, ref } from 'vue'
import { defaultOutput, defaultProject } from '../templates/_shared/config'
import {
  defaultTemplate,
  getTemplateDefinition,
  templateDefinitions,
} from '../templates'

/**
 * 管理方案编辑  模板切换和 Electron 桌面操作
 */
export function useSchemeWorkspace() {
  /**
   * 维护当前方案的基础状态   所有派生值都由这些状态实时计算
   */
  const schemeName = ref('默认水闸方案')
  const schemePath = ref(null)
  const templateId = ref(defaultTemplate.id)
  const project = reactive({ ...defaultProject })
  const output = reactive({ ...defaultOutput })
  const params = reactive({ ...defaultTemplate.defaults })
  const templateParameterCache = new Map()
  const activeGroupId = ref(defaultTemplate.groups[0].id)
  const focused = ref(null)
  const drawingProgress = reactive({
    percent: 0,
    stage: '',
  })
  // 运行状态
  // idle      空闲       初始值  清空日志  加载方案后
  // running   出图中     调用 window.sluice.runDrawing() 之前
  // success   出图成功   Python 进程退出码为 0
  // failed    出图失败   校验未通过或 Python 进程退出码非 0
  const runState = ref('idle')

  const removeProgressListener = window.sluice.onDrawingProgress((progress) => {
    drawingProgress.percent = progress.percent
    drawingProgress.stage = progress.stage
  })

  onBeforeUnmount(() => {
    removeProgressListener()
  })

  /**
   * 派生值和校验集中从同一套参数计算
   */
  const currentTemplate = computed(() =>
    getTemplateDefinition(templateId.value),
  )
  const derived = computed(() =>
    currentTemplate.value.computeDerived(params, project),
  )
  const validationErrors = computed(() =>
    currentTemplate.value.validate(params, project),
  )
  const activeGroup = computed(() =>
    currentTemplate.value.groups.find(
      (group) => group.id === activeGroupId.value,
    ),
  )

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
   * 新方案   重置为默认参数
   */
  function newScheme() {
    schemeName.value = '默认水闸方案'
    schemePath.value = null
    templateId.value = defaultTemplate.id
    templateParameterCache.clear()
    Object.assign(project, defaultProject)
    Object.assign(output, defaultOutput)
    Object.keys(params).forEach((key) => delete params[key])
    Object.assign(params, defaultTemplate.defaults)
    activeGroupId.value = defaultTemplate.groups[0].id
    focused.value = null
    drawingProgress.percent = 0
    drawingProgress.stage = ''
    runState.value = 'idle'
  }

  /**
   * 通过系统文件对话框打开本地方案
   */
  async function openScheme() {
    const file = await window.sluice.openScheme()
    if (file) {
      loadScheme(JSON.parse(file.content), file.filePath)
    }
  }

  /**
   * 保存方案
   */
  async function saveScheme() {
    // 将当前方案序列化为 JSON 字符串
    const content = JSON.stringify(makeScheme(), null, 2)
    const savedPath = await window.sluice.saveScheme({
      filePath: schemePath.value,
      name: schemeName.value,
      content,
    })
    if (savedPath) {
      schemePath.value = savedPath
    }
  }

  /**
   * 另存为
   */
  async function saveSchemeAs() {
    const content = JSON.stringify(makeScheme(), null, 2)
    const savedPath = await window.sluice.saveSchemeAs({
      name: schemeName.value,
      content,
    })
    if (savedPath) {
      schemePath.value = savedPath
    }
  }

  /**
   * 出图前先执行前端公式一致性校验   避免明显错误参数进入 Inventor 流程
   */
  async function runDrawing() {
    drawingProgress.percent = 0
    drawingProgress.stage = '正在启动出图程序'

    // 前端校验参数
    if (validationErrors.value.length > 0) {
      runState.value = 'failed'
      drawingProgress.stage = '参数校验未通过'
      return
    }

    // 设置状态
    runState.value = 'running'

    // 进入 preload
    const result = await window.sluice.runDrawing(makeScheme())

    // 更新状态
    runState.value = result.success ? 'success' : 'failed'
    if (result.success) {
      drawingProgress.percent = 100
      drawingProgress.stage = '出图完成'
      await window.sluice.openOutputDirectory(result.outputDir)
    } else {
      drawingProgress.stage = `出图失败  停止于${drawingProgress.stage}`
    }
  }

  /**
   * 按当前模板结构加载方案并重置编辑状态
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
    focused.value = null
    drawingProgress.percent = 0
    drawingProgress.stage = ''
    runState.value = 'idle'
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
    const selectedPath = await window.sluice.selectOutputDirectory()
    if (selectedPath) {
      output.savepath = selectedPath
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
   * @param nextTemplateId
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
    drawingProgress.percent = 0
    drawingProgress.stage = ''
    runState.value = 'idle'
  }

  /**
   * 输入框聚焦时把字段映射到 3D 部件区域   高亮对应几何
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

  return {
    activeGroup,
    activeGroupId,
    clearFieldFocus,
    currentTemplate,
    derived,
    drawingProgress,
    focused,
    newScheme,
    openScheme,
    output,
    params,
    project,
    runDrawing,
    runState,
    saveScheme,
    saveSchemeAs,
    schemeName,
    selectOutputDirectory,
    setFieldFocus,
    switchTemplate,
    templateDefinitions,
    templateId,
    updateParam,
    updateProject,
    validationErrors,
  }
}
