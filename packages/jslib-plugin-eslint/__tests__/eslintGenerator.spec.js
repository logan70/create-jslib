const generateWithPlugin = require('jslib-test-utils/generateWithPlugin')
const create = require('jslib-test-utils/createTestProject')

test('base', async () => {
  const { pkg } = await generateWithPlugin({
    id: 'eslint',
    apply: require('../generator'),
    options: {}
  })

  expect(pkg.scripts.lint).toBe('jslib-service lint')
  expect(pkg.eslintConfig.extends).toEqual([
    'eslint:recommended'
  ])
  expect(pkg.eslintConfig.parserOptions.parser).toBe('babel-eslint')
})

test('airbnb', async () => {
  const { pkg } = await generateWithPlugin({
    id: 'eslint',
    apply: require('../generator'),
    options: {
      config: 'airbnb'
    }
  })

  expect(pkg.scripts.lint).toBe('jslib-service lint')
  expect(pkg.eslintConfig.extends).toEqual([
    'airbnb-base'
  ])
  expect(pkg.eslintConfig.parserOptions.parser).toBe('babel-eslint')
  expect(pkg.devDependencies).toHaveProperty('eslint-config-airbnb-base')
  expect(pkg.devDependencies).toHaveProperty('eslint-plugin-import')
})

test('standard', async () => {
  const { pkg } = await generateWithPlugin({
    id: 'eslint',
    apply: require('../generator'),
    options: {
      config: 'standard'
    }
  })

  expect(pkg.scripts.lint).toBe('jslib-service lint')
  expect(pkg.eslintConfig.extends).toEqual([
    'standard'
  ])
  expect(pkg.eslintConfig.parserOptions.parser).toBe('babel-eslint')
  expect(pkg.devDependencies).toHaveProperty('eslint-config-standard')
})

test('prettier', async () => {
  const { pkg } = await generateWithPlugin({
    id: 'eslint',
    apply: require('../generator'),
    options: {
      config: 'prettier'
    }
  })

  expect(pkg.scripts.lint).toBe('jslib-service lint')
  expect(pkg.eslintConfig.extends).toEqual([
    'prettier'
  ])
  expect(pkg.eslintConfig.parserOptions.parser).toBe('babel-eslint')
  expect(pkg.devDependencies).toHaveProperty('eslint-config-prettier')
})

test('typescript', async () => {
  const { pkg } = await generateWithPlugin([
    {
      id: 'eslint',
      apply: require('../generator'),
      options: {
        config: 'prettier'
      }
    },
    {
      id: 'typescript',
      apply: require('jslib-plugin-typescript/generator'),
      options: {}
    }
  ])

  expect(pkg.scripts.lint).toBe('jslib-service lint')
  expect(pkg.eslintConfig.extends).toEqual([
    'prettier',
    'plugin:@typescript-eslint/recommended'
  ])
  expect(pkg.eslintConfig.parserOptions.parser).toBe('@typescript-eslint/parser')
  expect(pkg.devDependencies).toHaveProperty('eslint-config-prettier')
  expect(pkg.devDependencies).toHaveProperty('@typescript-eslint/eslint-plugin')
  expect(pkg.devDependencies).toHaveProperty('@typescript-eslint/parser')
})

test('lint on save', async () => {
  const { pkg } = await generateWithPlugin({
    id: 'eslint',
    apply: require('../generator'),
    options: {
      lintOn: 'save'
    }
  })
  // lintOnSave defaults to true so no need for the jslib config
  expect(pkg.jslib).toBeFalsy()
})

test('lint on commit', async () => {
  const { pkg } = await generateWithPlugin({
    id: 'eslint',
    apply: require('../generator'),
    options: {
      lintOn: 'commit'
    }
  })
  expect(pkg.husky.hooks['pre-commit']).toBe('lint-staged')
  expect(pkg.devDependencies).toHaveProperty('lint-staged')
  expect(pkg['lint-staged']).toEqual({
    '*.{js, jsx}': ['jslib-service lint --fix', 'git add']
  })
  expect(pkg.jslib).toEqual({
    lintOnSave: false
  })
})

test('generate .editorconfig for new projects', async () => {
  const { files } = await generateWithPlugin({
    id: 'eslint',
    apply: require('../generator'),
    options: {
      config: 'airbnb'
    }
  })
  expect(files['.editorconfig']).toBeTruthy()
})

test('append to existing .editorconfig', async () => {
  const { dir, read, write } = await create('eslint-editorconfig', {
    plugins: {
      'jslib-plugin-eslint': {}
    }
  }, null, true)
  await write('.editorconfig', 'root = true\n')

  const invoke = require('create-jslib/lib/invoke')
  await invoke(`eslint`, { config: 'airbnb' }, dir)

  const editorconfig = await read('.editorconfig')
  expect(editorconfig).toMatch('root = true')
  expect(editorconfig).toMatch('[*.{js,jsx,ts,tsx}]')
})

test('airbnb config + typescript + unit-mocha', async () => {
  await create('eslint-airbnb-typescript', {
    plugins: {
      'jslib-plugin-eslint': {
        config: 'airbnb',
        lintOn: 'commit'
      },
      'jslib-plugin-typescript': {},
      'jslib-plugin-unit-mocha': {}
    }
  })
}, 30000)
