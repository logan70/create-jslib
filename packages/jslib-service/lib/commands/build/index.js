const defaults = {
  clean: true
}

module.exports = (api, options) => {
  const srcType = require('../../util/getSrcType')(api)
  api.registerCommand('build', {
    description: 'build for production',
    usage: 'jslib-service build [options]',
    options: {
      '--entry': `specify entry point (default: src/index.${srcType})`,
      '--dest': `specify output directory (default: ${options.outputDir})`,
      '--formats': `list of output formats for library builds (default: ${options.formats.join(',')})`,
      '--name': `name for umd bundle (default: "name" in package.json or entry filename)`,
      '--no-clean': `do not remove the dist directory before building the project`
    }
  }, async (args) => {
    for (const key in defaults) {
      if (args[key] == null) {
        args[key] = defaults[key]
      }
    }
    args.entry = args.entry || args._[0] || options.entry || `src/index.${srcType}`
    await build(args, api, options)
  })
}

function build (args, api, options) {
  const fs = require('fs-extra')
  const debug = require('debug')
  const rollup = require('rollup')
  const formatStats = require('../../util/formatStats')
  const {
    log,
    done,
    logWithSpinner,
    clearConsole,
    stopSpinner
  } = require('jslib-util')
  const startTime = new Date().getTime()

  return new Promise(async (resolve, reject) => {
    await api.runBeforeFns('build', args, api, options)

    log()

    const targetDir = api.resolve(args.dest || options.outputDir)

    if (args.clean && !args.noClean) {
      await fs.remove(targetDir)
    }

    args.formats = args.formats ? args.formats.split(',') : options.formats
    debug('jslib-service: build formats')(args.formats)

    logWithSpinner('Generating bundles...')
    args.filesToShowStats = []
    await Promise.all(args.formats.map(format => {
      return new Promise(async (resolve) => {
        const { inputOption, outputOption } = api.service.resolveRollupConfig(format, args, api, options)

        // create bundle task
        const bundle = await rollup.rollup(inputOption)

        // generate bundle
        await bundle.write(outputOption)

        // record bundle path in order to log stats
        args.filesToShowStats.push(outputOption.file)
        resolve()
      })
    }))

    await api.runAfterFns('build', args, api, options)

    process.env.JSLIB_TEST && console.log('Build complete.')

    const endTime = new Date().getTime()
    stopSpinner()
    clearConsole()
    done(`Compiled successfully in ${endTime - startTime}ms`)
    log()

    // log file stats
    log(formatStats(args, api))

    resolve()
  })
}

module.exports.defaultModes = {
  build: 'production'
}
