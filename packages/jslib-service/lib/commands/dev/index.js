const {
  info,
  log,
  done,
  clearConsole,
  hasProjectYarn
} = require('jslib-util')

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
    }
  }, async function dev (args) {
    const fs = require('fs')
    const path = require('path')
    const debug = require('debug')
    const chalk = require('chalk')
    const rollup = require('rollup')
    const getDevFormat = require('./getDevFormat')
    const formatStats = require('../../util/formatStats')

    args.entry = args.entry || args._[0] || options.entry || `src/index.${srcType}`
    args.formats = args.formats ? args.formats.split(',') : options.formats
    let formatToDev
    if (args.formats.length > 1) {
      formatToDev = await getDevFormat(args.formats)
    } else {
      formatToDev = args.formats[0] ? args.formats[0].replace(/[\-\.]min/, '') : 'umd'
    }

    debug('jslib-service: dev format')(formatToDev)

    // get rollup option
    const { inputOption, outputOption } = api.service.resolveRollupConfig(formatToDev, args, api, options)
    args.filesToShowStats= [outputOption.file]

    // rollup watch mode options
    const watchOption = {
      // chokidar should be used instead of the built-in fs.watch
      chokidar: true,
      include: args.entry.replace(/\/.*/, '/**'),
      clearScreen: false
    }
    const rollupOptions = {
      ...inputOption,
      output: outputOption,
      watch: watchOption
    }

    // start to watch
    const watcher = rollup.watch(rollupOptions)

    // handle event
    let stamp
    let isFirstCompile = true
    watcher.on('event', async (event) => {
      if (event.code === 'START') {
        stamp = new Date().getTime()
        clearConsole()
        info('Building for development...')
        console.log()
        const beforeFns = api.service.beforeFns['dev']
        if (beforeFns && beforeFns.length) {
          for (const beforeFn of beforeFns) {
            await beforeFn(args)
          }
        }
      } else if (event.code === 'END') {
        if (typeof args.errorCount === 'number' && args.errorCount > 0) {
          log()
          log('  Waiting for changes...')
          return
        }
        const afterFns = api.service.afterFns['dev']
        if (afterFns && afterFns.length) {
          for (const afterFn of afterFns) {
            await afterFn(args)
          }
        }
        clearConsole()
        done(`Compiled successfully in ${new Date().getTime() - stamp}ms`)
        log()
        log(formatStats(args, api))
        if (isFirstCompile) {
          isFirstCompile = false
          const buildCommand = hasProjectYarn(api.getCwd()) ? `yarn build` : `npm run build`
          log(`  To create a production build, run ${chalk.cyan(buildCommand)}.`)
          log()
        }
        log('  Waiting for changes...')
      }
    })
  })
}

module.exports.defaultModes = {
  dev: 'development'
}
