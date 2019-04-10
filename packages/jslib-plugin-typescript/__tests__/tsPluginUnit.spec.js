jest.setTimeout(40000)

const create = require('jslib-test-utils/createTestProject')

test('mocha', async () => {
  const project = await create('ts-unit-mocha', {
    plugins: {
      'jslib-plugin-typescript': {},
      'jslib-plugin-unit-mocha': {}
    }
  })
  await project.run(`jslib-service test:unit`)
})

test('jest', async () => {
  const project = await create('ts-unit-jest', {
    plugins: {
      'jslib-plugin-typescript': {},
      'jslib-plugin-unit-jest': {}
    }
  })
  await project.run(`jslib-service test:unit`)
})

test('jest w/ babel', async () => {
  const project = await create('ts-unit-jest-babel', {
    plugins: {
      'jslib-plugin-typescript': {},
      'jslib-plugin-babel': {},
      'jslib-plugin-unit-jest': {}
    }
  })
  await project.run(`jslib-service test:unit`)
})
