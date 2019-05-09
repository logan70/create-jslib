module.exports = api => {
  const babel = require('./babelOptions').config(api)

  const pkg = {
    babel,
    devDependencies: {
      '@babel/core': '^7.4.3',
      '@babel/preset-env': '^7.4.3',
      '@babel/plugin-transform-runtime': '^7.4.3',
      '@babel/plugin-syntax-dynamic-import': '^7.2.0'
    },
    dependencies: {
      '@babel/runtime': '^7.4.3',
      '@babel/polyfill': '^7.4.3',
      'core-js': '^3.0.0'
    }
  }

  if (api.hasPlugin('typescript')) {
    applyTS(api)
  }

  if (api.hasPlugin('unit-mocha') || api.hasPlugin('unit-jest')) {
    babel.env = {
      test: {
        presets: [
          [
            '@babel/preset-env',
            {
              modules: 'commonjs',
              debug: false
            }
          ]
        ]
      }
    }
  }

  api.extendPackage(pkg)
}

const applyTS = module.exports.applyTS = api => {
  api.extendPackage({
    babel: {
      overrides: [
        {
          presets: ['@babel/preset-typescript'],
          test: /\.tsx?$/
        }
      ]
    },
    devDependencies: {
      '@babel/preset-typescript': '^7.3.3'
    }
  })
}
