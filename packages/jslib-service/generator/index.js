module.exports = (api, options) => {
  api.render('template', {
    doesCompile: api.hasPlugin('babel') || api.hasPlugin('typescript'),
    doesGenerateDocs: api.hasPlugin('doc'),
    useTS: api.hasPlugin('typescript')
  })

  api.extendPackage({
    scripts: {
      'dev': 'jslib-service dev',
      'build': 'jslib-service build'
    }
  })

  // additional tooling configurations
  if (options.configs) {
    api.extendPackage(options.configs)
  }

  // rollup format configuration
  if (options.formats && options.formats.join('') !== 'umd') {
    api.extendPackage({
      jslib: {
        formats: options.formats
      }
    })
  }
}
