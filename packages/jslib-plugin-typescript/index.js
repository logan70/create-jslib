const lint = require('./lib/tslint')

module.exports = (api, options) => {
  const typeScript = require('rollup-plugin-typescript2')
  const tsPlugin = typeScript({
    exclude: ['node_modules/**', '*.d.ts', '**/*.d.ts'],
    tsconfigOverride: { compilerOptions: { module: 'ES2015' }}
  })
  api.configureRollup((rollupConfig) => {
    rollupConfig.plugins.unshift(tsPlugin)
  })

  if (!api.hasPlugin('eslint')) {
    if (options.lintOnSave) {
      api.buildStart('Linting code...', async (args) => {
        await lint({
          ...options.lintConfig,
          ...args
        }, api)
      })

      api.devStart('Linting code...', async (args) => {
        args.hasErrorOrWarning = await lint({
          ...options.lintConfig,
          ...args,
          maxErrors: Infinity,
          maxWarnings: Infinity
        }, api)
      })
    }
    api.registerCommand('lint', {
      description: 'lint source files with TSLint',
      usage: 'jslib-service lint [options] [...files]',
      options: {
        '--format [formatter]': 'specify formatter (default: codeFrame)',
        '--no-fix': 'do not fix errors or warnings',
        '--max-errors [limit]': 'specify number of errors to make build failed (default: 0)',
        '--max-warnings [limit]': 'specify number of warnings to make build failed (default: Infinity)',
        '--formatters-dir [dir]': 'formatter directory',
        '--rules-dir [dir]': 'rules directory'
      }
    }, args => {
      return lint({
        fix: true,
        ...options.lintConfig,
        ...args
      }, api)
    })
  }
}
