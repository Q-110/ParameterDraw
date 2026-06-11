import { createApp } from 'vue'
import './styles/index.less'
import App from './App.vue'

// 非 Electron 环境时挂空壳 stub
if (!window.sluice) {
  window.sluice = {
    openScheme: async () => null,
    saveScheme: async () => null,
    saveSchemeAs: async () => null,
    selectOutputDirectory: async () => null,
    openOutputDirectory: async () => '',
    runDrawing: async () => ({
      success: false,
      outputDir: '',
      logPath: '',
    }),
    onDrawingProgress: () => () => {},
  }
}

// 挂载 Vue 渲染进程入口   桌面能力由 Electron preload 注入
createApp(App).mount('#app')
