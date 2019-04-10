module.exports = (api, _, invoking) => {
  api.render('./template', {
    hasTS: api.hasPlugin('typescript')
  })

  api.extendPackage({
    devDependencies: {
      'chai': '^4.1.2'
    },
    scripts: {
      'test:unit': 'jslib-service test:unit'
    }
  })

  if (api.hasPlugin('eslint')) {
    applyESLint(api)
  }

  if (api.hasPlugin('typescript')) {
    applyTS(api, invoking)
  }
}

const applyESLint = module.exports.applyESLint = api => {
  api.render(files => {
    files['tests/unit/.eslintrc.js'] = api.genJSConfig({
      env: { mocha: true }
    })
  })
}

const applyTS = module.exports.applyTS = (api, invoking) => {
  api.extendPackage({
    devDependencies: {
      '@types/mocha': '^5.2.6',
      '@types/chai': '^4.1.7'
    }
  })
  // inject mocha/chai types to tsconfig.json
  if (invoking) {
    api.render(files => {
      const tsconfig = files['tsconfig.json']
      if (tsconfig) {
        const parsed = JSON.parse(tsconfig)
        const types = parsed.compilerOptions.types
        if (types) {
          if (!types.includes('mocha')) {
            types.push('mocha')
          }
          if (!types.includes('chai')) {
            types.push('chai')
          }
        }
        files['tsconfig.json'] = JSON.stringify(parsed, null, 2)
      }
    })
  }
}
