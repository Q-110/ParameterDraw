# ParameterDraw 桌面端

基于 Vue 3  Vite  Three.js 和 Electron 的参数化出图桌面端

## 模板目录

```text
01渐变扭+单孔+检修+交通+消力+渐变扭
02渐变扭+单孔+检修+无交通+消力+渐变扭
```

上线包默认不包含模型模板  出图时使用对应 `params.py` 中配置的 `source_dir`

测试包会将项目根目录下的两个模型模板打包到 `resources/templates`

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

生成不包含模型模板的安装包和便携版

```powershell
pnpm dist:test
```

生成包含模型模板的测试便携版

所有安装包均包含前端  Electron  Python 通用启动器和模板业务脚本

目标机器需要安装 Autodesk Inventor 2026
