const fs = require('fs')
const path = require('path')

module.exports = (api, { config, lintOn = [] }, _, invoking) => {
  if (typeof lintOn === 'string') {
    lintOn = lintOn.split(',')
  }

  const eslintConfig = require('../eslintOptions').config(api)

  const pkg = {
    scripts: {
      lint: 'cross-env NODE_ENV=production jslib-service lint'
    },
    eslintConfig,
    // TODO:
    // Move these dependencies to package.json in v4.
    // Now in v3 we have to add redundant eslint related dependencies
    // in order to keep compatibility with v3.0.x users who defaults to ESlint v4.
    devDependencies: {
      'babel-eslint': '^10.0.1',
      'eslint': '^5.15.0'
    }
  }

  const injectEditorConfig = (config) => {
    const filePath = api.resolve('.editorconfig')
    if (fs.existsSync(filePath)) {
      // Append to existing .editorconfig
      api.render(files => {
        const configPath = path.resolve(__dirname, `./template/${config}/_editorconfig`)
        const editorconfig = fs.readFileSync(configPath, 'utf-8')

        files['.editorconfig'] += `\n${editorconfig}`
      })
    } else {
      api.render(`./template/${config}`)
    }
  }

  if (config === 'airbnb') {
    eslintConfig.extends.push('airbnb-base')
    Object.assign(pkg.devDependencies, {
      'eslint-config-airbnb-base': '^13.1.0',
      'eslint-plugin-import': '^2.16.0'
    })
    injectEditorConfig('airbnb')
  } else if (config === 'standard') {
    eslintConfig.extends.push('standard')
    Object.assign(pkg.devDependencies, {
      'eslint-config-standard': '^12.0.0'
    })
    injectEditorConfig('standard')
  } else if (config === 'prettier') {
    eslintConfig.extends.push('prettier')
    Object.assign(pkg.devDependencies, {
      'eslint-config-prettier': '^4.0.1'
    })
    // prettier & default config do not have any style rules
    // so no need to generate an editorconfig file
  } else {
    // default
    eslintConfig.extends.push('eslint:recommended')
  }

  if (!lintOn.includes('save')) {
    pkg.jslib = {
      lintOnSave: false // eslint configured in runtime plugin
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
    pkg['lint-staged'] =  api.hasPlugin('typescript')
      ? { '*.{ts, tsx}': ['jslib-service lint --fix', 'git add'] }
      : { '*.{js, jsx}': ['jslib-service lint --fix', 'git add'] }
  }

  api.extendPackage(pkg)

  // typescript support
  if (api.hasPlugin('typescript')) {
    applyTS(api)
  }

  // invoking only
  if (invoking) {
    if (api.hasPlugin('unit-mocha')) {
      // eslint-disable-next-line node/no-extraneous-require
      require('jslib-plugin-unit-mocha/generator').applyESLint(api)
    } else if (api.hasPlugin('unit-jest')) {
      // eslint-disable-next-line node/no-extraneous-require
      require('jslib-plugin-unit-jest/generator').applyESLint(api)
    }
  }

  // lint & fix after create to ensure files adhere to chosen config
  if (config && config !== 'base') {
    api.onCreateComplete(() => {
      require('../lint')({ silent: true, fix: true }, api)
    })
  }
}

const applyTS = module.exports.applyTS = api => {
  api.extendPackage({
    eslintConfig: {
      extends: ['plugin:@typescript-eslint/recommended'],
      parserOptions: {
        parser: '@typescript-eslint/parser'
      },
      plugins: ['@typescript-eslint']
    },
    devDependencies: {
      '@typescript-eslint/eslint-plugin': '^1.4.2',
      '@typescript-eslint/parser': '^1.4.2'
    }
  })
}
