import { createApp } from 'vue'
import './style.less'
import App from './App.vue'

// 挂载 Vue 渲染进程入口，桌面能力由 Electron preload 注入。
createApp(App).mount('#app')
