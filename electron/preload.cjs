const { contextBridge, ipcRenderer } = require('electron')

/**
 * 只暴露前端需要的方案管理和出图接口
 */
contextBridge.exposeInMainWorld('sluice', {
  // ipcRenderer.invoke 向主程序发送 'scheme:open' 等消息
  openScheme: () => ipcRenderer.invoke('scheme:open'),
  saveScheme: (payload) => ipcRenderer.invoke('scheme:save', payload),
  saveSchemeAs: (payload) => ipcRenderer.invoke('scheme:saveAs', payload),
  selectOutputDirectory: () => ipcRenderer.invoke('output:selectDirectory'),
  openOutputDirectory: (directoryPath) => ipcRenderer.invoke('output:openDirectory', directoryPath),
  runDrawing: (scheme) => ipcRenderer.invoke('drawing:run', scheme),
  onDrawingLog: (callback) => {
    // 返回取消监听函数  组件卸载时用于清理日志订阅
    const listener = (_event, text) => callback(text)
    ipcRenderer.on('drawing:log', listener)
    return () => ipcRenderer.removeListener('drawing:log', listener)
  },
  onDrawingProgress: (callback) => {
    const listener = (_event, progress) => callback(progress)
    ipcRenderer.on('drawing:progress', listener)
    return () => ipcRenderer.removeListener('drawing:progress', listener)
  },
})
