const includeTemplates = process.env.PARAMETER_DRAW_INCLUDE_TEMPLATES === 'true'

const extraResources = [
  {
    from: '../code',
    to: 'code',
    filter: [
      '**/*',
      '!**/.git/**',
      '!**/.idea/**',
      '!**/.opencode/**',
      '!**/.venv/**',
      '!**/__pycache__/**',
      '!**/*.pyc',
      '!requirements.txt',
    ],
  },
  {
    from: 'build/python-backend/run_from_json',
    to: 'backend/run_from_json',
    filter: ['**/*'],
  },
]

if (includeTemplates) {
  extraResources.push(
    {
      from: '../01渐变扭+单孔+检修+交通+消力+渐变扭',
      to: 'templates/01渐变扭+单孔+检修+交通+消力+渐变扭',
      filter: ['**/*'],
    },
    {
      from: '../02渐变扭+单孔+检修+无交通+消力+渐变扭',
      to: 'templates/02渐变扭+单孔+检修+无交通+消力+渐变扭',
      filter: ['**/*'],
    },
  )
}

/**
 * 根据打包命令决定是否携带模型模板
 */
module.exports = {
  appId: 'com.parameterdraw.desktop',
  productName: 'ParameterDraw',
  directories: {
    output: 'release',
  },
  files: [
    'dist/**/*',
    'electron/**/*',
    'build/icon.ico',
    'package.json',
  ],
  extraResources,
  win: {
    icon: 'build/icon.ico',
    target: ['nsis', 'portable'],
  },
  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true,
  },
}
