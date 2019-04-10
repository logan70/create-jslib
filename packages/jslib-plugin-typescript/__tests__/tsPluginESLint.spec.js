jest.setTimeout(60000)

const create = require('jslib-test-utils/createTestProject')

test('should work', async () => {
  const project = await create('ts-eslint', {
    plugins: {
      'jslib-plugin-eslint': {
        config: 'airbnb'
      },
      'jslib-plugin-typescript': {}
    }
  })
  const { read, write, run } = project
  const main = await read('src/index.ts')
  expect(main).toMatch(';')
  // remove semicolons
  const updatedMain = main.replace(/;/g, '')
  await write('src/index.ts', updatedMain)
  // lint
  await run('jslib-service lint')
  expect(await read('src/index.ts')).toMatch(';')
})
