module.exports = api => {
  const babel = require('./babelOptions').config(api)

  const pkg = {
    babel,
    devDependencies: {
      '@babel/core': '^7.4.3',
      '@babel/plugin-transform-runtime': '^7.4.3',
      '@babel/preset-env': '^7.4.3'
    },
    dependencies: {
      '@babel/runtime': '^7.4.3',
      '@babel/polyfill': '^7.4.3',
      'core-js': '^3.0.0'
    }
  }

  if (api.hasPlugin('typescript')) {
    babel.overrides = [
      {
        presets: ['@babel/preset-typescript'],
        test: /\.tsx?$/
      }
    ]
    Object.assign(pkg.devDependencies, {
      '@babel/preset-typescript': '^7.3.3'
    })
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
