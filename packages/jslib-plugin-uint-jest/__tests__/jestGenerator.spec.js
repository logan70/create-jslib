const generateWithPlugin = require('jslib-test-utils/generateWithPlugin')

test('base', async () => {
  const { pkg, files } = await generateWithPlugin([
    {
      id: 'unit-jest',
      apply: require('../generator'),
      options: {}
    },
    // mock presence of the babel & eslint plugin
    {
      id: 'babel',
      apply: () => {},
      options: {}
    },
    {
      id: 'eslint',
      apply: () => {},
      options: {}
    }
  ])

  expect(pkg.scripts['test:unit']).toBe('jslib-service test:unit')

  // should inject babel-jest
  expect(pkg.devDependencies).toHaveProperty('babel-jest')
  // eslint
  expect(files['tests/unit/.eslintrc.js']).toMatch('jest: true')

  const spec = files['tests/unit/example.spec.js']
  expect(spec).toMatch(`expect(hello()).toBe('Hello world!')`)
})

test('without babel/eslint', async () => {
  const { pkg, files } = await generateWithPlugin([
    {
      id: 'unit-jest',
      apply: require('../generator'),
      options: {}
    }
  ])

  // should inject babel-jest
  expect(pkg.devDependencies).toHaveProperty('babel-jest')
  // should inject @babel/core
  expect(pkg.devDependencies).toHaveProperty('@babel/core')
  // should inject @babel/preset-env
  expect(pkg.devDependencies).toHaveProperty('@babel/preset-env')
  expect(files['.babelrc']).toMatch(/@babel\/preset-env/)
  expect(files['.babelrc']).toMatch(/modules.*commonjs/)
})

test('with TS', async () => {
  const { files } = await generateWithPlugin([
    {
      id: 'unit-jest',
      apply: require('../generator'),
      options: {}
    },
    // mock presence of the ts plugin
    {
      id: 'typescript',
      apply: () => {},
      options: {}
    }
  ])

  const spec = files['tests/unit/example.spec.ts']
  expect(spec).toMatch(`expect(hello()).toBe('Hello world!')`)
})
