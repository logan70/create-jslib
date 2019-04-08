module.exports = cli => {
  cli.injectFeature({
    name: 'Documentation',
    value: 'doc',
    short: 'Doc',
    description: 'Generate documentation from comments in your source code',
    plugins: ['doc'],
    checked: false
  })

  cli.onPromptComplete((answers, options) => {
    if (answers.features.includes('doc')) {
      options.plugins['jslib-plugin-doc'] = {}
    }
  })
}
