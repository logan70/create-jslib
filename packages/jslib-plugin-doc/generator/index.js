module.exports = api => {
  const pkg = {
    scripts: {
      doc: 'jslib-service doc'
    },
    devDependencies: {
      rimraf: '^2.6.3'
    }
  }

  if (api.hasPlugin('typescript')) {
    Object.assign(pkg.devDependencies, {
      typedoc: '^0.14.2',
      'typedoc-plugin-external-module-name': '^2.0.0'
    })
  } else {
    Object.assign(pkg.devDependencies, {
      docdash: '^1.1.0',
      jsdoc: '^3.5.5'
    })
  }
  api.render('template', {
    useTS: api.hasPlugin('typescript')
  })

  api.extendPackage(pkg)
}
