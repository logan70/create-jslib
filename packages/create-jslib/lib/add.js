const chalk = require('chalk')
const invoke = require('./invoke')
const { installPackage } = require('./util/installDeps')
const {
  log,
  error,
  hasProjectYarn,
  resolvePluginId,
  resolveModule
} = require('jslib-util')

async function add (pluginName, options = {}, context = process.cwd()) {
  const packageName = resolvePluginId(pluginName)

  log()
  log(`📦  Installing ${chalk.cyan(packageName)}...`)
  log()

  const packageManager = hasProjectYarn(context) ? 'yarn' : 'npm'
  await installPackage(context, packageManager, options.registry, packageName)

  log(`${chalk.green('✔')}  Successfully installed plugin: ${chalk.cyan(packageName)}`)
  log()

  const generatorPath = resolveModule(`${packageName}/generator`, context)
  if (generatorPath) {
    invoke(pluginName, options, context)
  } else {
    log(`Plugin ${packageName} does not have a generator to invoke`)
  }
}

module.exports = (...args) => {
  return add(...args).catch(err => {
    error(err)
    if (!process.env.JSLIB_TEST) {
      process.exit(1)
    }
  })
}
