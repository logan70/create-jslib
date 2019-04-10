jest.setTimeout(20000)
jest.mock('inquirer')

const invoke = require('../lib/invoke')
const { expectPrompts } = require('inquirer')
const create = require('jslib-test-utils/createTestProject')

const parseJS = file => {
  const res = {}
  ;(new Function('module', file))(res)
  return res.exports
}

const baseESLintConfig = Object.assign({}, require('jslib-plugin-eslint/eslintOptions').config({
  hasPlugin: () => false
}), {
  rules: {
    'no-console': 'off',
    'no-debugger': 'off'
  }
})

async function createAndInstall (name) {
  const project = await create(name, {
    plugins: {
      'jslib-plugin-babel': {}
    }
  })
  // mock install
  const pkg = JSON.parse(await project.read('package.json'))
  pkg.devDependencies['jslib-plugin-eslint'] = '*'
  await project.write('package.json', JSON.stringify(pkg, null, 2))
  return project
}

async function assertUpdates (project) {
  const updatedPkg = JSON.parse(await project.read('package.json'))
  expect(updatedPkg.scripts.lint).toBe('jslib-service lint')
  expect(updatedPkg.devDependencies).toHaveProperty('lint-staged')
  expect(updatedPkg.husky.hooks).toEqual({
    'pre-commit': 'lint-staged'
  })

  const eslintrc = parseJS(await project.read('.eslintrc.js'))
  expect(eslintrc).toEqual(Object.assign({}, baseESLintConfig, {
    extends: ['airbnb-base']
  }))

  const lintedMain = await project.read('src/index.js')
  expect(lintedMain).toMatch(';') // should've been linted in post-generate hook
}

test('invoke with inline options', async () => {
  const project = await createAndInstall(`invoke-inline`)
  await project.run(`${require.resolve('../bin/create-jslib')} invoke eslint --config airbnb --lintOn save,commit`)
  await assertUpdates(project)
})

test('invoke with prompts', async () => {
  const project = await createAndInstall(`invoke-prompts`)
  expectPrompts([
    {
      message: `Pick an ESLint config`,
      choices: [`Airbnb`, `Error prevention only`, `Standard`, `Prettier`],
      choose: 0
    },
    {
      message: `Pick additional lint features`,
      choices: [`on save`, 'on commit'],
      check: [0, 1]
    }
  ])
  // need to be in the same process to have inquirer mocked
  // so calling directly
  await invoke(`eslint`, {}, project.dir)
  await assertUpdates(project)
})

test('invoke with ts', async () => {
  const project = await create(`invoke-existing`, {
    useConfigFiles: true,
    plugins: {
      'jslib-plugin-babel': {},
      'jslib-plugin-eslint': { config: 'base' }
    }
  })
  // mock install
  const pkg = JSON.parse(await project.read('package.json'))
  pkg.devDependencies['jslib-plugin-typescript'] = '*'
  await project.write('package.json', JSON.stringify(pkg, null, 2))

  // mock existing jslib.config.js
  await project.write('jslib.config.js', `module.exports = { lintOnSave: true }`)

  const eslintrc = parseJS(await project.read('.eslintrc.js'))
  expect(eslintrc).toEqual(Object.assign({}, baseESLintConfig, {
    extends: ['eslint:recommended']
  }))
  // await invoke(`typescript`, {}, project.dir)
  await project.run(`${require.resolve('../bin/create-jslib')} invoke typescript --useTsWithBabel`)

  const updatedESLintrc = parseJS(await project.read('.eslintrc.js'))
  expect(updatedESLintrc).toEqual(Object.assign({}, baseESLintConfig, {
    extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
    parserOptions: {
      parser: '@typescript-eslint/parser',
      project: './tsconfig.json',
      sourceType: 'module',
      ecmaVersion: 9
    },
    plugins: ['@typescript-eslint']
  }))
})

test('invoke with existing files (yaml)', async () => {
  const project = await create(`invoke-existing-yaml`, {
    useConfigFiles: true,
    plugins: {
      'jslib-plugin-babel': {},
      'jslib-plugin-eslint': {}
    }
  })

  const eslintrc = parseJS(await project.read('.eslintrc.js'))
  expect(eslintrc).toEqual(Object.assign({}, baseESLintConfig, {
    extends: ['eslint:recommended']
  }))

  await project.rm(`.eslintrc.js`)
  await project.write(`.eslintrc.yml`, `
root: true
extends:
  - 'eslint:recommended'
  `.trim())

  await project.run(`${require.resolve('../bin/create-jslib')} invoke eslint --config airbnb`)

  const updated = await project.read('.eslintrc.yml')
  expect(updated).toMatch(`
extends:
  - 'eslint:recommended'
  - airbnb-base
`.trim())
})

test('invoking a plugin that renames files', async () => {
  const project = await create(`invoke-rename`, { plugins: {}})
  const pkg = JSON.parse(await project.read('package.json'))
  pkg.devDependencies['jslib-plugin-typescript'] = '*'
  await project.write('package.json', JSON.stringify(pkg, null, 2))
  await project.run(`${require.resolve('../bin/create-jslib')} invoke typescript -d`)
  expect(project.has('src/index.js')).toBe(false)
})
