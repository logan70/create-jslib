jest.setTimeout(30000)

const Service = require('jslib-service/lib/Service')
const { assertDev, assertBuild } = require('./tsPlugin.helper')

test('using correct loader', () => {
  const service = new Service('/', {
    pkg: {},
    plugins: [
      { id: 'jslib-plugin-typescript', apply: require('../index') },
      { id: 'jslib-plugin-babel', apply: require('jslib-plugin-babel') }
    ]
  })

  service.init()
  const { output: outputOption, ...inputOption } = service.resolveRollupConfig()
  // rollup-plugin-typescript2
  expect(inputOption.plugins[0].name).toBe('rpt2')
  // rollup-plugin-node-resolve
  expect(inputOption.plugins[1].name).toBe('node-resolve')
  // rollup-plugin-commonjs
  expect(inputOption.plugins[2].name).toBe('commonjs')
  // rollup-plugin-json
  expect(inputOption.plugins[3].name).toBe('json')
  // rollup-plugin-babel
  expect(inputOption.plugins[4].name).toBe('babel')
  // default to compile to umd format
  expect(outputOption.format).toBe('umd')
})

const creatorOptions = {
  plugins: {
    'jslib-plugin-typescript': {},
    'jslib-plugin-babel': {}
  }
}

assertDev('ts-babel-dev', creatorOptions)
assertBuild('ts-babel-build', creatorOptions)

