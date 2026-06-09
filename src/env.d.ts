import type { ElectronSchemeFile, RunResult, SchemeData } from './types'

declare global {
  interface Window {
    // Electron preload 注入的桌面能力；浏览器预览模式下该对象不存在。
    sluice?: {
      openScheme: () => Promise<ElectronSchemeFile | null>
      saveScheme: (payload: { filePath: string | null; name: string; content: string }) => Promise<string | null>
      saveSchemeAs: (payload: { name: string; content: string }) => Promise<string | null>
      selectOutputDirectory: () => Promise<string | null>
      runDrawing: (scheme: SchemeData) => Promise<RunResult>
      onDrawingLog: (callback: (text: string) => void) => () => void
    }
  }
}

export {}
