const { logWithSpinner, stopSpinner, log } = require('jslib-util')
const doc = require('./doc')

module.exports = (api, options) => {
  api.addBeforeFn('build', async (args) => {
    logWithSpinner('Generating documentation...')
    log('\n')
    await doc(args, api)
    stopSpinner()
  })

  api.addBeforeFn('dev', async (args) => {
    await doc(args, api)
  })

  const details = api.hasPlugin('typescript') ? 'https://typedoc.org' : 'http://usejsdoc.org'

  api.registerCommand('doc', {
    description: 'generate documentation based on comments in your source code',
    usage: 'jslib-service doc [options]',
    options: {
      '--config [path]': 'path to the configuration file'
    },
    details: details
  }, args => {
    return doc(args, api)
  })
}
