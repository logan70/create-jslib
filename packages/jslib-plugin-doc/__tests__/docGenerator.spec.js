const generateWithPlugin = require('jslib-test-utils/generateWithPlugin')

test('generate jsdoc.config.js for new projects', async () => {
  const { files } = await generateWithPlugin({
    id: 'doc',
    apply: require('jslib-plugin-doc/generator')
  })
  expect(files['jsdoc.config.js']).toBeTruthy()
})

test('generate typedoc.json for new projects', async () => {
  const { files } = await generateWithPlugin([{
    id: 'typescript',
    apply: require('jslib-plugin-typescript/generator'),
    options: {}
  }, {
    id: 'doc',
    apply: require('jslib-plugin-doc/generator')
  }])
  expect(files['typedoc.json']).toBeTruthy()
})
