# 打包

```powershell
pnpm dist
```
上线包 不包含模型模板   需要配置模板中 `params.py` `source_dir`

```powershell
pnpm dist:test
```
测试包 将项目根目录下的模板文件打包进 `resources/templates`

`PyInstaller` 编译 `Python` 后端   ->   `Vite` 编译前端   ->   `electron-builder` 打包桌面应用