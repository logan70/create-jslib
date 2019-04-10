const generateWithPlugin = require('jslib-test-utils/generateWithPlugin')

test('generate files', async () => {
  const { files } = await generateWithPlugin([
    {
      id: 'core',
      apply: require('jslib-service/generator'),
      options: {}
    },
    {
      id: 'ts',
      apply: require('../generator'),
      options: {}
    }
  ])

  expect(files['src/index.ts']).toBeTruthy()
  expect(files['src/index.js']).toBeFalsy()
})

test('use with Babel', async () => {
  const { files } = await generateWithPlugin([
    {
      id: 'babel',
      apply: require('jslib-plugin-babel/generator'),
      options: {}
    },
    {
      id: 'typescript',
      apply: require('../generator'),
      options: {
        useTsWithBabel: true
      }
    }
  ])

  expect(files['babel.config.js']).toMatch('@babel/preset-typescript')
  expect(files['tsconfig.json']).toMatch(`"target": "esnext"`)
})

test('lint', async () => {
  const { pkg, files } = await generateWithPlugin([
    {
      id: 'typescript',
      apply: require('../generator'),
      options: {
        tsLint: true,
        lintOn: ['save', 'commit']
      }
    }
  ])

  expect(pkg.scripts.lint).toBe(`jslib-service lint`)
  expect(pkg.devDependencies).toHaveProperty('lint-staged')
  expect(pkg.husky.hooks).toEqual({ 'pre-commit': 'lint-staged' })
  expect(pkg['lint-staged']).toEqual({
    '*.{ts, tsx}': ['jslib-service lint --fix', 'git add']
  })

  expect(files['tslint.json']).toBeTruthy()
})

test('lint with no lintOnSave', async () => {
  const { pkg } = await generateWithPlugin([
    {
      id: 'ts',
      apply: require('../generator'),
      options: {
        tsLint: true,
        lintOn: ['commit']
      }
    }
  ])
  expect(pkg.jslib).toEqual({ lintOnSave: false })
})

test('tsconfig.json should be valid json', async () => {
  const { files } = await generateWithPlugin([
    {
      id: 'ts',
      apply: require('../generator'),
      options: {}
    }
  ])
  expect(() => {
    JSON.parse(files['tsconfig.json'])
  }).not.toThrow()
  expect(files['tsconfig.json']).not.toMatch('"  ')
})

test('compat with unit-mocha', async () => {
  const { pkg, files } = await generateWithPlugin([
    {
      id: 'jslib-plugin-unit-mocha',
      apply: require('jslib-plugin-unit-mocha/generator'),
      options: {}
    },
    {
      id: 'jslib-plugin-typescript',
      apply: require('../generator'),
      options: {
        lint: true,
        lintOn: ['save', 'commit']
      }
    }
  ])

  expect(pkg.devDependencies).toHaveProperty('@types/mocha')
  expect(pkg.devDependencies).toHaveProperty('@types/chai')

  expect(files['tsconfig.json']).not.toMatch('"  ')
})

test('compat with unit-jest', async () => {
  const { pkg, files } = await generateWithPlugin([
    {
      id: 'jslib-plugin-unit-jest',
      apply: require('jslib-plugin-unit-jest/generator'),
      options: {}
    },
    {
      id: 'jslib-plugin-typescript',
      apply: require('../generator'),
      options: {
        lint: true,
        lintOn: ['save', 'commit']
      }
    }
  ])

  expect(pkg.devDependencies).toHaveProperty('@types/jest')

  expect(files['tsconfig.json']).not.toMatch('"  ')
})
