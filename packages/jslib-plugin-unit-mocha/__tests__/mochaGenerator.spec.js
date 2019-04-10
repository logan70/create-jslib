const generateWithPlugin = require('jslib-test-utils/generateWithPlugin')

test('base', async () => {
  const { pkg, files } = await generateWithPlugin([
    {
      id: 'unit-mocha',
      apply: require('../generator'),
      options: {}
    },
    // mock presence of the eslint plugin
    {
      id: 'eslint',
      apply: () => {},
      options: {}
    }
  ])

  expect(pkg.scripts['test:unit']).toBe('jslib-service test:unit')
  expect(pkg.devDependencies).toHaveProperty('chai')
  expect(files['tests/unit/.eslintrc.js']).toMatch('mocha: true')

  const spec = files['tests/unit/example.spec.js']
  expect(spec).toMatch(`import { expect } from 'chai'`)
  expect(spec).toMatch(`expect(hello()).to.equal('Hello world!')`)
})

test('with TS', async () => {
  const { files } = await generateWithPlugin([
    {
      id: 'unit-mocha',
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
  expect(spec).toMatch(`import { expect } from 'chai'`)
  expect(spec).toMatch(`expect(hello()).to.equal('Hello world!')`)
})
