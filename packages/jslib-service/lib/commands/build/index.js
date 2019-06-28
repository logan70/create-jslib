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
      '--uglify': `minify js bundles (default: false)`,
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

async function build (args, api, options) {
  const fs = require('fs-extra')
  const debug = require('debug')
  const rollup = require('rollup')
  const getFormats = require('../../util/getFormats')
  const formatStats = require('../../util/formatStats')
  const {
    log,
    done,
    logWithSpinner,
    clearConsole,
    stopSpinner
  } = require('jslib-util')
  const startTime = new Date().getTime()

  log()
  const targetDir = api.resolve(args.dest || options.outputDir)

  if (args.clean && !args.noClean) {
    await fs.remove(targetDir)
  }

  await api.fireHooks('buildStart', args, api, options, logWithSpinner)

  logWithSpinner('Generating bundles...')

  args.formats = getFormats(args, options)
  debug('jslib-service: build formats')(args.formats)

  const getTask = (format) => {
    const copyArgs = Object.assign({}, args)
    if (typeof copyArgs.uglify === 'undefined') {
      copyArgs.uglify = options.uglify
    }

    const { output: outputOption, ...inputOption } = api.service.resolveRollupConfig(format, copyArgs, api, options)

    // create bundle task
    return rollup.rollup(inputOption).then(bundle => {
      // generate bundle
      return bundle.write(outputOption)
    })
  }

  // generate bundle for each format
  await Promise.all(args.formats.map(format => getTask(format)))

  // execute hooks after bundle success
  await api.fireHooks('buildEnd', args, api, options, logWithSpinner)

  stopSpinner()

  process.env.JSLIB_TEST && console.log('Build complete.')

  const endTime = new Date().getTime()
  clearConsole()
  done(`Compiled successfully in ${endTime - startTime}ms`)
  log()

  // log file stats
  log(formatStats(api, options))
}

module.exports.defaultModes = {
  build: 'production'
}
