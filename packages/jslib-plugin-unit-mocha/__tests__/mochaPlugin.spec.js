jest.setTimeout(20000)

const create = require('jslib-test-utils/createTestProject')

test('should work', async () => {
  const project = await create('unit-mocha', {
    plugins: {
      'jslib-plugin-babel': {},
      'jslib-plugin-unit-mocha': {}
    }
  })
  await project.run(`jslib-service test:unit`)
})
