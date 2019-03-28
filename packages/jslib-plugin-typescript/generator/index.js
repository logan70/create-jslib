module.exports = (api, {
  tsLint,
  lintOn = []
}, _, invoking) => {
  if (typeof lintOn === 'string') {
    lintOn = lintOn.split(',')
  }

  api.extendPackage({
    devDependencies: {
      typescript: '^3.3.3333'
    }
  })

  if (tsLint) {
    const pkg = {
      scripts: {
        lint: 'cross-env NODE_ENV=production jslib-service lint'
      }
    }

    if (!lintOn.includes('save')) {
      pkg.jslib = {
        lintOnSave: false // lint configured in runtime plugin
      }
    }

    if (lintOn.includes('commit')) {
      Object.assign(pkg.devDependencies, {
        "husky": "^1.3.1",
        'lint-staged': '^8.1.5'
      })
      if (pkg.husky && pkg.husky.hooks) {
        pkg.husky.hooks['pre-commit'] = 'lint-staged'
      } else {
        pkg.husky = Object.assign({}, pkg.husky, {
          'pre-commit': 'lint-staged'
        })
      }
      pkg['lint-staged'] =  { '*.{ts, tsx}': ['jslib-service lint --fix', 'git add'] }
    }

    api.extendPackage(pkg)

    // lint and fix files on creation complete
    api.onCreateComplete(() => {
      return require('../lib/tslint')({ silent: true, fix: true }, api)
    })
  }

  // late invoke compat
  if (invoking) {
    if (api.hasPlugin('unit-mocha')) {
      // eslint-disable-next-line node/no-extraneous-require
      require('jslib-plugins-unit-mocha/generator').applyTS(api)
    }

    if (api.hasPlugin('unit-jest')) {
      // eslint-disable-next-line node/no-extraneous-require
      require('jslib-plugins-unit-jest/generator').applyTS(api)
    }

    if (api.hasPlugin('eslint')) {
      // eslint-disable-next-line node/no-extraneous-require
      require('jslib-plugins-eslint/generator').applyTS(api)
    }
  }

  api.render('./template', {
    hasMocha: api.hasPlugin('unit-mocha'),
    hasJest: api.hasPlugin('unit-jest')
  })

  require('./convert')(api, { tsLint })
}
