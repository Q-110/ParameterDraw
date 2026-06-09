$ErrorActionPreference = "Stop"

$frontendRoot = Split-Path -Parent $PSScriptRoot
$codeRoot = Resolve-Path (Join-Path $frontendRoot "..\code")
$pythonPath = Join-Path $codeRoot ".venv\Scripts\python.exe"
$entryPath = Join-Path $codeRoot "run_from_json.py"
$distPath = Join-Path $frontendRoot "build\python-backend"
$workPath = Join-Path $frontendRoot "build\python-backend-work"
$specPath = Join-Path $frontendRoot "build\python-backend-spec"
$backendPath = Join-Path $distPath "run_from_json\run_from_json.exe"

if (-not (Test-Path -LiteralPath $pythonPath)) {
  throw "未找到 Python 虚拟环境：$pythonPath"
}

if (-not (Test-Path -LiteralPath $entryPath)) {
  throw "未找到 Python 后端入口：$entryPath"
}

& $pythonPath -c "import PyInstaller, openpyxl, win32com.client"
if ($LASTEXITCODE -ne 0) {
  throw "Python 构建依赖不完整，请先执行：$pythonPath -m pip install -r $codeRoot\requirements.txt"
}

& $pythonPath -m PyInstaller `
  --noconfirm `
  --clean `
  --onedir `
  --name run_from_json `
  --distpath $distPath `
  --workpath $workPath `
  --specpath $specPath `
  --hidden-import openpyxl `
  --hidden-import win32com.client `
  $entryPath

if ($LASTEXITCODE -ne 0) {
  throw "Python 后端构建失败"
}

if (-not (Test-Path -LiteralPath $backendPath)) {
  throw "Python 后端构建产物不存在：$backendPath"
}

Write-Host "Python 后端构建完成：$backendPath"
