import { defineAsyncComponent, h } from 'vue'

/**
 * 延迟加载 Three.js 预览   避免桌面应用启动时加载完整三维模块
 */
export const SluicePreview = defineAsyncComponent({
  loader: () => import('./SluicePreview.vue'),
  delay: 0,
  loadingComponent: {
    /**
     * 渲染预览加载状态
     */
    setup() {
      return () => h('div', { class: 'preview-status' }, '正在加载三维预览')
    },
  },
  errorComponent: {
    /**
     * 渲染预览加载失败状态
     */
    setup() {
      return () => h('div', { class: 'preview-status failed' }, '三维预览加载失败')
    },
  },
})
