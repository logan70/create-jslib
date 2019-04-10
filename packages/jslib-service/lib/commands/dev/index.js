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
      '--name': `name for umd bundle (default: "name" in package.json or entry filename)`
    }
  }, async function dev (args) {
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

    debug('jslib-service:devFormat')(formatToDev)

    // get rollup option
    const { inputOption, outputOption } = api.service.resolveRollupConfig(formatToDev, args, api, options)
    debug('jslib-service:rollupInput')(inputOption)
    debug('jslib-service:rollupOutput')(outputOption)
    args.filesToShowStats = [outputOption.file]

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
    let isFirstSuccess = true
    let isBeforeFnsFinished = false
    let isEnd = false

    const compileEndFn = async () => {
      if (args.hasErrorOrWarning) {
        log()
        log('  Waiting for changes...')
        process.env.JSLIB_TEST && console.log('  Compiled with warnings, waiting for changes...')
        return
      }

      await api.runAfterFns('dev', args, api, options)

      clearConsole()
      done(`Compiled successfully in ${new Date().getTime() - stamp}ms`)
      log()
      log(formatStats(args, api))
      if (isFirstSuccess) {
        isFirstSuccess = false
        const buildCommand = hasProjectYarn(api.getCwd()) ? `yarn build` : `npm run build`
        log(`  To create a production build, run ${chalk.cyan(buildCommand)}.`)
        log()
      }
      process.env.JSLIB_TEST && console.log('Compiled successfully')
      log('  Waiting for changes...')
    }

    const compileStartFn = async () => {
      stamp = new Date().getTime()
      clearConsole()
      info('Building for development...')
      log()

      await api.runBeforeFns('dev', args, api, options)
      isBeforeFnsFinished = true
      if (isEnd) {
        isEnd = false
        isBeforeFnsFinished = false
        await compileEndFn()
      }
    }

    watcher.on('event', async (event) => {
      if (event.code === 'START') {
        await compileStartFn()
      } else if (event.code === 'END') {
        isEnd = true
        if (isBeforeFnsFinished) {
          isEnd = false
          isBeforeFnsFinished = false
          await compileEndFn()
        }
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
