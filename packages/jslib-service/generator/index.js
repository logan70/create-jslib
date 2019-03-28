module.exports = (api, options) => {
  const additionalData = {
    doesCompile: api.hasPlugin('babel') || api.hasPlugin('typescript'),
    doesGenerateDocs: api.hasPlugin('doc')
  }

  const templatePath = api.hasPlugin('typescript') ? './templateTs' : './templateJs'


  api.render(templatePath, additionalData)

  api.extendPackage({
    scripts: {
      'dev': 'cross-env NODE_ENV=development jslib-service dev',
      'build': 'cross-env NODE_ENV=production jslib-service build'
    },
    devDependencies: {
      'cross-env': '^5.2.0'
    } 
  })

  // additional tooling configurations
  if (options.configs) {
    api.extendPackage(options.configs)
  }
}
