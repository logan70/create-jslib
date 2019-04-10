module.exports = (api, _, invoking) => {
  api.render('./template', {
    hasTS: api.hasPlugin('typescript')
  })

  api.extendPackage({
    scripts: {
      'test:unit': 'jslib-service test:unit'
    },
    jest: {
      'moduleFileExtensions': [
        'js',
        'jsx',
        'json'
      ],
      'transformIgnorePatterns': ['/node_modules/'],
      // support the same @ -> src alias mapping in source code
      'moduleNameMapper': {
        '^@/(.*)$': '<rootDir>/src/$1'
      },
      'testMatch': [
        '**/tests/unit/**/*.spec.(js|jsx|ts|tsx)|**/__tests__/*.(js|jsx|ts|tsx)'
      ],
      // https://github.com/facebook/jest/issues/6766
      'testURL': 'http://localhost/',
      // Indicates whether each individual test should be reported during the run.
      verbose: true
    }
  })

  if (!api.hasPlugin('typescript')) {
    api.extendPackage({
      jest: {
        transform: {
          '^.+\\.jsx?$': 'babel-jest'
        }
      },
      devDependencies: {
        'babel-jest': '^24.7.1'
      }
    })
    if (!api.hasPlugin('babel')) {
      api.extendPackage({
        devDependencies: {
          '@babel/core': '^7.4.3',
          '@babel/preset-env': '^7.4.3',
          'babel-jest': '^24.7.1'
        }
      })
      api.render(files => {
        files['.babelrc'] = JSON.stringify({
          presets: [
            [
              '@babel/preset-env',
              {
                modules: 'commonjs',
                debug: false
              }
            ]
          ]
        }, null, 2)
      })
    }
  } else {
    applyTS(api, invoking)
  }

  if (api.hasPlugin('eslint')) {
    applyESLint(api)
  }
}

const applyTS = module.exports.applyTS = (api, invoking) => {
  api.extendPackage({
    jest: {
      moduleFileExtensions: ['ts', 'tsx']
    }
  })
  if (api.hasPlugin('babel')) {
    api.extendPackage({
      jest: {
        transform: {
          '^.+\\.tsx?$': 'babel-jest'
        }
      }
    })
  } else {
    api.extendPackage({
      jest: {
        transform: {
          '^.+\\.tsx?$': 'ts-jest'
        }
      },
      devDependencies: {
        '@types/jest': '^24.0.11',
        'ts-jest': '^24.0.2'
      }
    })
  }
  // inject jest type to tsconfig.json
  if (invoking) {
    api.render(files => {
      const tsconfig = files['tsconfig.json']
      if (tsconfig) {
        const parsed = JSON.parse(tsconfig)
        if (
          parsed.compilerOptions.types &&
          !parsed.compilerOptions.types.includes('jest')
        ) {
          parsed.compilerOptions.types.push('jest')
        }
        files['tsconfig.json'] = JSON.stringify(parsed, null, 2)
      }
    })
  }
}

const applyESLint = module.exports.applyESLint = api => {
  api.render(files => {
    files['tests/unit/.eslintrc.js'] = api.genJSConfig({
      env: { jest: true }
    })
  })
}
