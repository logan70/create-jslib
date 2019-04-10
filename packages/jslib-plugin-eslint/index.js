const { logWithSpinner, stopSpinner, log } = require('jslib-util')
const lint = require('./lint')

module.exports = (api, options) => {
  if (options.lintOnSave) {
    api.addBeforeFn('build', async (args) => {
      logWithSpinner('Linting code...')
      log('\n')
      await lint({
        ...options.lintConfig,
        ...args
      }, api)
      stopSpinner()
    })

    api.addBeforeFn('dev', async (args) => {
      args.hasErrorOrWarning = await lint({
        maxErrors: Infinity,
        maxWarnings: Infinity,
        ...options.lintConfig,
        ...args
      }, api)
    })
  }
  api.registerCommand('lint', {
    description: 'lint and fix source files',
    usage: 'jslib-service lint [options] [...files]',
    options: {
      '--format [formatter]': 'specify formatter (default: codeframe)',
      '--no-fix': 'do not fix errors or warnings',
      '--fix-errors': 'fix errors, but do not fix warnings',
      '--max-errors [limit]': 'specify number of errors to make build failed (default: 0)',
      '--max-warnings [limit]': 'specify number of warnings to make build failed (default: Infinity)'
    },
    details: 'For more options, see https://eslint.org/docs/user-guide/command-line-interface#options'
  }, args => {
    return lint({
      fix: true,
      ...options.lintConfig,
      ...args
    }, api)
  })
}
