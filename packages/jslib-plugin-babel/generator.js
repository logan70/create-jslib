module.exports = api => {
  const babel = require('./babelOptions').config(api)

  const pkg = {
    babel,
    devDependencies: {
      '@babel/core': '^7.3.4',
      '@babel/plugin-transform-runtime': '^7.3.4',
      '@babel/preset-env': '^7.3.4'
    },
    dependencies: {
      '@babel/runtime': '^7.3.4',
      '@babel/polyfill': '^7.2.5',
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
          ],
        ]
      }
    }
  }

  api.extendPackage(pkg)
}
