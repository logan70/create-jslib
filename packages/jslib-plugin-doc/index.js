const generateDoc = require('./doc')

module.exports = (api, options) => {
  api.buildEnd('Generating documentation...', async (args) => {
    await generateDoc(args, api)
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
    return generateDoc(args, api)
  })
}
