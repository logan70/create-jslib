const path = require('path')
const lint = require('./lib/tslint')
const { logWithSpinner, stopSpinner, log } = require('jslib-util')

module.exports = (api, options) => {
  const typeScript = require('rollup-plugin-typescript2')
  const tsPlugin = typeScript({
    exclude: [ 'node_modules/**', '*.d.ts', '**/*.d.ts' ]
  })
  api.changeRollup((rollupConfig) => {
    rollupConfig.unshiftPlugin(tsPlugin)
  })

  if (!api.hasPlugin('eslint')) {
    if (options.lintOnSave) {
      api.addBeforeFn('build', async (args) => {
        logWithSpinner('Linting code...')
        log()
        await lint(args, api)
        stopSpinner()
      })
  
      api.addBeforeFn('dev', async (args) => {
        args.errorCount = await lint(Object.assign({}, args, { maxErrors: Infinity, maxWarnings: Infinity}), api)
      })
    }
    api.registerCommand('lint', {
      description: 'lint source files with TSLint',
      usage: 'jslib-service lint [options] [...files]',
      options: {
        '--format [formatter]': 'specify formatter (default: codeFrame)',
        '--fix': 'fix errors',
        '--max-errors [limit]': 'specify number of errors to make build failed (default: 0)',
        '--max-warnings [limit]': 'specify number of warnings to make build failed (default: Infinity)',
        '--formatters-dir [dir]': 'formatter directory',
        '--rules-dir [dir]': 'rules directory'
      }
    }, args => {
      return lint(args, api)
    })
  }
}
