const path = require('path')
const Creator = require('./Creator')
const { error, stopSpinner, exit } = require('jslib-util')
const {
  validateProjectName,
  checkTargetDir
} = require('./util')

async function create (projectName, options) {
  if (options.proxy) {
    process.env.HTTP_PROXY = options.proxy
  }

  const cwd = options.cwd || process.cwd()
  const inCurrent = projectName === '.'
  const name = inCurrent ? path.relative('../', cwd) : projectName
  const targetDir = path.resolve(cwd, projectName || '.')

  // 校验项目名称，使用npm包名校验工具
  validateProjectName(name)

  // 目标文件夹存在，询问用户覆盖还是合并
  await checkTargetDir(targetDir, options.force, inCurrent)

  const creator = new Creator(name, targetDir)
  await creator.create(options)
}

module.exports = (...args) => {
  return create(...args).catch(err => {
    stopSpinner(false) // do not persist
    error(err.message)
    console.log(err)
    process.exit(1)
  })
}
