const {
  info,
  log,
  done,
  error,
  clearConsole,
  hasProjectYarn
} = require('jslib-util')

const defaults = {
  clean: true
}

module.exports = (api, options) => {
  const srcType = require('../../util/getSrcType')(api)
  api.registerCommand('dev', {
    description: 'build for development and watch on change',
    usage: 'jslib-service dev [options] [entry]',
    options: {
      '--entry': `specify entry point (default: src/index.${srcType})`,
      '--dest': `specify output directory (default: ${options.outputDir})`,
      '--formats': `list of output formats for library builds (default: ${options.formats.join(',')})`,
      '--name': `name for umd bundle (default: "name" in package.json or entry filename)`,
      '--no-clean': `do not remove the dist directory before building the project`
    }
  }, async function dev (args) {
    const fs = require('fs-extra')
    const chalk = require('chalk')
    const rollup = require('rollup')
    const getFormats = require('../../util/getFormats')

    for (const key in defaults) {
      if (args[key] == null) {
        args[key] = defaults[key]
      }
    }
    args.watch = true
    args.entry = args.entry || args._[0] || options.entry || `src/index.${srcType}`
    args.formats = getFormats(args, options)

    const targetDir = api.resolve(args.dest || options.outputDir)

    if (args.clean && !args.noClean) {
      await fs.remove(targetDir)
    }

    const rollupOptions = args.formats.map((format) => {
      return api.service.resolveRollupConfig(format, args, api, options)
    })

    // start to watch
    const watcher = rollup.watch(rollupOptions)

    // handle event
    let stamp
    let isFirstSuccess = true

    watcher.on('event', async (event) => {
      if (event.code === 'START') {
        stamp = new Date().getTime()
        clearConsole()
        info('Building for development...')
        log()
        log(isFirstSuccess ? '  Building...' : '  Rebuilding...')

        await api.fireHooks('devStart', args, api, options)
      } else if (event.code === 'END') {
        if (args.hasErrorOrWarning) {
          log()
          log('  Waiting for changes...')
          process.env.JSLIB_TEST && console.log('  Compiled with warnings, waiting for changes...')
          return
        }

        await api.fireHooks('devEnd', args, api, options)

        clearConsole()
        done(`Compiled successfully in ${new Date().getTime() - stamp}ms`)
        log()
        if (isFirstSuccess) {
          isFirstSuccess = false
          const buildCommand = hasProjectYarn(api.getCwd()) ? `yarn build` : `npm run build`
          log(`  To create a production build, run ${chalk.cyan(buildCommand)}.`)
          log()
        }
        process.env.JSLIB_TEST && console.log('Compiled successfully')
        log('  Waiting for changes...')
      } else if (event.code === 'ERROR' || event.code === 'FATAL') {
        error(event.error || 'rollup error!')
      }
    })
    if (process.env.JSLIB_TEST) {
      process.stdin.on('data', data => {
        if (data.toString() === 'close') {
          console.log('got close signal!')
          watcher.close()
          process.exit(0)
        }
      })
    }
  })
}

module.exports.defaultModes = {
  dev: 'development'
}
