<template>
  <main class="template-home">
    <header class="home-header">
      <div class="home-brand">
        <img :src="appIconUrl" alt="" />
        <div>
          <strong>ParameterDraw</strong>
          <span>水闸参数化出图</span>
        </div>
      </div>
      <div class="home-heading">
        <h1>模板选择</h1>
      </div>
      <div class="home-header-search">
        <input
          v-model.trim="searchKeyword"
          class="template-search"
          type="search"
          placeholder="搜索模板名称或编号"
        />
      </div>
    </header>

    <section class="home-content">
      <aside class="template-tree panel">
        <div class="tree-heading">
          <h2>模板分类</h2>
          <span>{{ templates.length }} 个模板</span>
        </div>

        <div class="tree-category-list">
          <button
            v-for="category in categories"
            :key="category.id"
            type="button"
            :class="['tree-category-header', { active: category.id === activeCategoryId }]"
            @click="activeCategoryId = category.id"
          >
            <strong>{{ category.name }}</strong>
            <span>{{ category.templates.length }}</span>
          </button>
        </div>

        <div class="tree-empty">
          点击模板卡片可查看大图预览
        </div>
      </aside>

      <section class="home-template-list panel">
        <div class="template-card-scroll">
          <div
            v-if="filteredTemplates.length > 0"
            class="template-card-grid"
          >
            <article
              v-for="template in filteredTemplates"
              :key="template.id"
              class="template-card"
            >
              <button
                type="button"
                class="template-preview-button"
                @click="openPreview(template, $event)"
              >
                <SluiceGlbPreviewCanvas
                  :model-url="template.homeModelUrl"
                  :interactive="false"
                />
              </button>

              <div class="template-card-body">
                <div class="template-card-title">
                  <strong>{{ template.code }}</strong>
                  <h3>{{ template.title }}</h3>
                  <span class="template-type">{{ categoryNameMap[template.category] }}</span>
                </div>
                <div class="template-tags">
                  <span v-for="tag in template.tags" :key="tag">
                    {{ tag }}
                  </span>
                </div>
                <button
                  type="button"
                  class="primary-action use-template-button"
                  @click="emit('openTemplate', template.id)"
                >
                  使用此模板
                </button>
              </div>
            </article>
          </div>
          <div
            v-else
            class="template-list-empty"
          >
            暂无模板
          </div>
        </div>
      </section>
    </section>

    <div
      v-if="previewTemplate"
      :class="['template-preview-dialog', { closing: previewClosing }]"
      @click.self="closePreview"
    >
      <section
        class="template-preview-panel"
        :style="previewPanelStyle"
      >
        <header>
          <div>
            <span class="template-type">{{ categoryNameMap[previewTemplate.category] }}</span>
            <h2>{{ previewTemplate.code }} {{ previewTemplate.title }}</h2>
          </div>
          <button
            type="button"
            class="preview-close-button"
            @click="closePreview"
          >
            关闭
          </button>
        </header>
        <div class="template-preview-large">
          <SluiceGlbPreviewCanvas
            :model-url="previewTemplate.homeModelUrl"
            :interactive="true"
          />
        </div>
      </section>
    </div>
  </main>
</template>

<script setup>
import { computed, defineAsyncComponent, onBeforeUnmount, ref, watch } from 'vue'
import appIconUrl from '../../build/豫水设计.jpg?url'

// 异步加载 3D 模型预览组件
const SluiceGlbPreviewCanvas = defineAsyncComponent(
  () => import('../templates/_shared/SluiceGlbPreviewCanvas.vue'),
)

const props = defineProps([
  'templates',          // 全量模板列表
  'currentTemplateId',  // 当前编辑模板 ID
])

const emit = defineEmits(['openTemplate'])   // 使用模板

const searchKeyword = ref('')          // 搜索关键字
const previewTemplate = ref(null)     // 当前预览模板
const previewSourceRect = ref({       // 预览源矩形
  x: window.innerWidth / 2,          // 源矩形左上角 X 坐标
  y: window.innerHeight / 2,         // 源矩形左上角 Y 坐标
  width: 1,                          // 源矩形宽度
  height: 1,                         // 源矩形高度
})
const previewClosing = ref(false)     // 预览关闭中
let previewCloseTimer = null

const categoryDefinitions = [
  { id: 'all', name: '全部' },
  { id: 'sluice', name: '水闸' },
  { id: 'culvert', name: '桥涵' },
]

const categoryNameMap = computed(() => {
  const map = {}
  categoryDefinitions.forEach((c) => { map[c.id] = c.name })
  return map
})

const selectedTemplate = computed(() =>
  props.templates.find((t) => t.id === props.currentTemplateId),
)

const activeCategoryId = ref(selectedTemplate.value.category)

const categories = computed(() =>
  categoryDefinitions.map((category) => ({
    ...category,
    templates: category.id === 'all'
      ? props.templates
      : props.templates.filter((t) => t.category === category.id),
  })),
)

/**
 * 对模板预计算展示字段，模板中直接读取，避免每个卡片重复计算
 */
const enrichedTemplates = computed(() =>
  props.templates.map((t) => {
    const parts = t.name.replace(/^\d+/, '').split('+').filter(Boolean)
    return {
      ...t,
      code: String(t.order / 10).padStart(2, '0'),
      title: parts.slice(0, 2).join(' · '),
      tags: parts.slice(2),
    }
  }),
)

const filteredTemplates = computed(() => {
  const keyword = searchKeyword.value.trim().toLowerCase()
  return enrichedTemplates.value.filter((t) => {
    if (activeCategoryId.value !== 'all' && t.category !== activeCategoryId.value) return false
    if (!keyword) return true
    return t.code.includes(keyword) || t.name.toLowerCase().includes(keyword) || t.tags.join('').toLowerCase().includes(keyword)
  })
})

const previewPanelStyle = computed(() => ({
  '--preview-origin-x': `${previewSourceRect.value.x}px`,
  '--preview-origin-y': `${previewSourceRect.value.y}px`,
  '--preview-origin-width': `${previewSourceRect.value.width}px`,
  '--preview-origin-height': `${previewSourceRect.value.height}px`,
}))

/**
 * 打开可交互的大图预览
 */
function openPreview(template, event) {
  window.clearTimeout(previewCloseTimer)
  const rect = event.currentTarget.getBoundingClientRect()
  previewSourceRect.value = {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
    width: rect.width,
    height: rect.height,
  }
  previewClosing.value = false
  previewTemplate.value = template
}

/**
 * 关闭大图预览并等待缩放动画结束
 */
function closePreview() {
  if (previewClosing.value) {
    return
  }

  previewClosing.value = true
  window.clearTimeout(previewCloseTimer)
  previewCloseTimer = window.setTimeout(() => {
    previewTemplate.value = null
    previewClosing.value = false
  }, 260)
}

/**
 * 离开首页时清理关闭动画计时器
 */
onBeforeUnmount(() => {
  window.clearTimeout(previewCloseTimer)
})

/**
 * 返回首页时同步当前编辑模板
 */
watch(
  () => props.currentTemplateId,
  () => {
    activeCategoryId.value = selectedTemplate.value.category
  },
)
</script>
