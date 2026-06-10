# ParameterDraw 桌面端

基于 Vue 3  Vite  Three.js 和 Electron 的参数化出图桌面端

## 模板目录

模板根目录已硬编码在 `electron/main.cjs`

```text
01渐变扭+单孔+检修+交通+消力+渐变扭
02渐变扭+单孔+检修+无交通+消力+渐变扭
```

模型模板不进入安装包  发布环境需修改 `electron/main.cjs` 中的模板根目录路径

## 开发

```powershell
pnpm install
pnpm dev
```

## Python 环境

```powershell
..\code\.venv\Scripts\python.exe -m pip install -r ..\code\requirements.txt
```

## 构建

```powershell
pnpm build
```

## 打包

```powershell
pnpm dist
```

安装包包含前端  Electron  Python 通用启动器和模板业务脚本

目标机器需要安装 Autodesk Inventor 2026 并配置服务器模板根目录
