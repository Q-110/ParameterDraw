const { app, BrowserWindow, Menu, dialog, ipcMain, shell } = require('electron')
const { spawn } = require('node:child_process')
const fs = require('node:fs')
const path = require('node:path')
const { TextDecoder } = require('node:util')

const isDev = !app.isPackaged
const drawingProgressPrefix = '@@DRAWING_PROGRESS@@'
let drawingRunning = false
const hasSingleInstanceLock = app.requestSingleInstanceLock()


/**
 * 定位 code/ 目录
 * @returns {string}
 */
function getCodeRoot() {
  if (isDev) {
    return path.resolve(__dirname, '..', '..', 'code')
  }
  return path.join(process.resourcesPath, 'code')
}


/**
 * 获取后端启动命令  开发环境使用虚拟环境  生产环境使用冻结后的独立程序
 * @param codeRoot
 * @param schemePath
 * @returns {{executable: string, args: string[]}}
 */
function getBackendCommand(codeRoot, schemePath) {
  if (isDev) {
    return {
      executable: path.join(codeRoot, '.venv', 'Scripts', 'python.exe'),
      args: [path.join(codeRoot, 'run_from_json.py'), schemePath],
    }
  }

  return {
    executable: path.join(process.resourcesPath, 'backend', 'run_from_json', 'run_from_json.exe'),
    args: [schemePath],
  }
}


/**
 * 创建桌面主窗口  渲染进程只通过 preload 暴露的白名单接口访问系统能力
 */
function createWindow() {
  const iconPath = path.join(__dirname, '..', 'build', 'icon.ico')
  const win = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1180,
    minHeight: 760,
    title: 'ParameterDraw',
    icon: iconPath,
    autoHideMenuBar: true,
    backgroundColor: '#f5f7f8',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  // 启动时默认最大化（保留任务栏）
  win.maximize()

  if (isDev) {
    win.loadURL('http://127.0.0.1:5173')
  } else {
    win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'))
  }
}

if (!hasSingleInstanceLock) {
  app.quit()
} else {
  app.on('second-instance', () => {
    const win = BrowserWindow.getAllWindows()[0]
    if (win) {
      if (win.isMinimized()) {
        win.restore()
      }
      win.focus()
    }
  })

  app.whenReady().then(() => {
    Menu.setApplicationMenu(null)
    createWindow()

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
      }
    })
  })
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})


/**
 * 打开本地 JSON 方案文件  并把文件内容返回给渲染进程
 */
ipcMain.handle('scheme:open', async () => {
  const result = await dialog.showOpenDialog({
    title: '打开方案',
    filters: [{ name: '水闸方案', extensions: ['json'] }],
    properties: ['openFile'],
  })

  if (result.canceled || result.filePaths.length === 0) {
    return null
  }

  const filePath = result.filePaths[0]
  return {
    filePath,
    content: fs.readFileSync(filePath, 'utf-8'),
  }
})


/**
 * 保存当前方案   首次保存时弹出保存对话框获取目标路径
 */
ipcMain.handle('scheme:save', async (_event, payload) => {
  let filePath = payload.filePath
  if (!filePath) {
    const result = await dialog.showSaveDialog({
      title: '保存方案',
      defaultPath: `${payload.name || '水闸方案'}.json`,
      filters: [{ name: '水闸方案', extensions: ['json'] }],
    })

    if (result.canceled || !result.filePath) {
      return null
    }

    filePath = result.filePath
  }
  fs.writeFileSync(filePath, payload.content, 'utf-8')
  return filePath
})


/**
 * 另存方案总是弹出保存对话框   避免覆盖当前方案文件
 */
ipcMain.handle('scheme:saveAs', async (_event, payload) => {
  const result = await dialog.showSaveDialog({
    title: '另存方案',
    defaultPath: `${payload.name || '水闸方案'}.json`,
    filters: [{ name: '水闸方案', extensions: ['json'] }],
  })

  if (result.canceled || !result.filePath) {
    return null
  }

  fs.writeFileSync(result.filePath, payload.content, 'utf-8')
  return result.filePath
})


/**
 * 选择出图保存目录
 */
ipcMain.handle('output:selectDirectory', async () => {
  const result = await dialog.showOpenDialog({
    title: '选择出图保存目录',
    properties: ['openDirectory'],
  })

  if (result.canceled || result.filePaths.length === 0) {
    return null
  }

  return result.filePaths[0]
})


/**
 * 使用系统文件管理器打开出图成果目录
 */
ipcMain.handle('output:openDirectory', async (_event, directoryPath) => {
  return shell.openPath(directoryPath)
})


/**
 * 将当前方案写入临时 JSON  在调用 Python 薄封装触发 Inventor 出图
 */
ipcMain.handle('drawing:run', async (event, scheme) => {
  const codeRoot = getCodeRoot()
  const templateRoot = isDev ? '' : path.join(process.resourcesPath, 'templates')
  const hasBundledTemplates = templateRoot && fs.existsSync(templateRoot)
  const tempDir = path.join(app.getPath('userData'), 'schemes')
  fs.mkdirSync(tempDir, { recursive: true })

  const schemePath = path.join(tempDir, 'active-scheme.json')
  const backendCommand = getBackendCommand(codeRoot, schemePath)

  return new Promise((resolve) => {
    if (drawingRunning) {
      resolve({
        success: false,
        outputDir: scheme.output.savepath,
        logPath: '',
        logs: ['已有出图任务正在执行'],
      })
      return
    }

    if (!fs.existsSync(backendCommand.executable)) {
      resolve({
        success: false,
        outputDir: scheme.output.savepath,
        logPath: '',
        logs: [`未找到后端入口：${backendCommand.executable}`],
      })
      return
    }

    const startedAt = new Date()
    const timestamp = [
      startedAt.getFullYear(),
      String(startedAt.getMonth() + 1).padStart(2, '0'),
      String(startedAt.getDate()).padStart(2, '0'),
      '-',
      String(startedAt.getHours()).padStart(2, '0'),
      String(startedAt.getMinutes()).padStart(2, '0'),
      String(startedAt.getSeconds()).padStart(2, '0'),
    ].join('')
    const logDir = path.join(app.getPath('userData'), 'logs')
    const logPath = path.join(logDir, `drawing-${timestamp}.log`)
    const logs = []
    let logStream
    let logFileDescriptor
    let logWriteError = null
    let child = null
    let childClosed = false
    let spawnError = null
    let resolved = false
    const outputEncoding = isDev ? 'utf-8' : 'gbk'
    const stdoutDecoder = new TextDecoder(outputEncoding)
    const stderrDecoder = new TextDecoder(outputEncoding)
    let stdoutLineBuffer = ''

    /**
     * 识别 Python 结构化进度  普通输出继续转发到日志通道
     * @param {string} line
     */
    const forwardStdoutLine = (line) => {
      const content = line.replace(/\r?\n$/, '')
      if (content.startsWith(drawingProgressPrefix)) {
        try {
          const progress = JSON.parse(content.slice(drawingProgressPrefix.length))
          if (typeof progress.percent === 'number' && typeof progress.stage === 'string') {
            event.sender.send('drawing:progress', progress)
            return
          }
        } catch {
          // 协议解析失败时作为普通日志保留
        }
      }

      logs.push(line)
      event.sender.send('drawing:log', line)
    }

    try {
      fs.mkdirSync(logDir, { recursive: true })
      logFileDescriptor = fs.openSync(logPath, 'wx')
      logStream = fs.createWriteStream(null, {
        fd: logFileDescriptor,
        encoding: 'utf-8',
        autoClose: true,
      })
      logStream.on('error', (error) => {
        if (logWriteError) {
          return
        }

        logWriteError = error
        const text = `写入出图日志失败：${error.message}`
        logs.push(text)
        event.sender.send('drawing:log', text)
        if (child && !childClosed) {
          child.kill()
        }
      })
      logStream.write(
        [
          `开始时间  ${startedAt.toLocaleString('zh-CN', { hour12: false })}`,
          `模板名称  ${scheme.templateId}`,
          `成果目录  ${scheme.output.savepath}`,
          `后端程序  ${backendCommand.executable}`,
          '',
        ].join('\n'),
      )
    } catch (error) {
      if (logFileDescriptor !== undefined && !logStream) {
        fs.closeSync(logFileDescriptor)
      }
      resolve({
        success: false,
        outputDir: scheme.output.savepath,
        logPath: '',
        logs: [`创建出图日志失败：${error.message}`],
      })
      return
    }

    // 通过运行锁和目录校验后再写入   避免重复调用覆盖当前任务方案
    fs.writeFileSync(schemePath, JSON.stringify(scheme, null, 2), 'utf-8')
    drawingRunning = true
    const backendEnv = {
      ...process.env,
      PYTHONIOENCODING: 'utf-8',
      SLUICE_CODE_ROOT: codeRoot,
    }
    delete backendEnv.PARAMETER_DRAW_TEMPLATE_ROOT
    if (hasBundledTemplates) {
      backendEnv.PARAMETER_DRAW_TEMPLATE_ROOT = templateRoot
    }
    child = spawn(backendCommand.executable, backendCommand.args, {
      cwd: codeRoot,
      env: backendEnv,
      windowsHide: true,
    })

    child.stdout.on('data', (chunk) => {
      const text = stdoutDecoder.decode(chunk, { stream: true })
      if (!logStream.destroyed) {
        logStream.write(text)
      }

      // 按完整行解析进度协议  避免多字节或分块输出截断 JSON
      stdoutLineBuffer += text
      let newlineIndex = stdoutLineBuffer.indexOf('\n')
      while (newlineIndex >= 0) {
        forwardStdoutLine(stdoutLineBuffer.slice(0, newlineIndex + 1))
        stdoutLineBuffer = stdoutLineBuffer.slice(newlineIndex + 1)
        newlineIndex = stdoutLineBuffer.indexOf('\n')
      }
    })

    child.stderr.on('data', (chunk) => {
      // 实时发送 错误日志 给渲染进程
      const text = stderrDecoder.decode(chunk, { stream: true })
      logs.push(text)
      event.sender.send('drawing:log', text)
      if (!logStream.destroyed) {
        logStream.write(text)
      }
    })

    child.on('close', (code) => {
      childClosed = true
      drawingRunning = false
      const stdoutTail = stdoutDecoder.decode()
      const stderrTail = stderrDecoder.decode()
      if (stdoutTail) {
        if (!logStream.destroyed) {
          logStream.write(stdoutTail)
        }
        stdoutLineBuffer += stdoutTail
      }
      if (stdoutLineBuffer) {
        forwardStdoutLine(stdoutLineBuffer)
        stdoutLineBuffer = ''
      }
      if (stderrTail) {
        logs.push(stderrTail)
        event.sender.send('drawing:log', stderrTail)
        if (!logStream.destroyed) {
          logStream.write(stderrTail)
        }
      }
      const endedAt = new Date()
      const footer = [
        '',
        `结束时间  ${endedAt.toLocaleString('zh-CN', { hour12: false })}`,
        `退出状态  ${logWriteError ? '日志写入失败' : spawnError ? '启动失败' : code}`,
        '',
      ].join('\n')

      // 等待日志文件写入完成后再返回最终状态
      if (logStream.closed) {
        resolved = true
        resolve({
          success: code === 0 && !spawnError && !logWriteError,
          outputDir: scheme.output.savepath,
          logPath,
          logs,
        })
        return
      }

      logStream.once('close', () => {
        if (resolved) {
          return
        }
        resolved = true
        resolve({
          success: code === 0 && !spawnError && !logWriteError,
          outputDir: scheme.output.savepath,
          logPath,
          logs,
        })
      })
      if (!logStream.destroyed) {
        logStream.end(footer)
      }
    })

    child.on('error', (error) => {
      spawnError = error
      const text = error.message
      logs.push(text)
      event.sender.send('drawing:log', text)
      if (!logStream.destroyed) {
        logStream.write(text)
      }
    })
  })
})
