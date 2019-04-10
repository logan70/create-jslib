jest.mock('fs')
jest.mock('inquirer')

const assertPromptModule = require('jslib-test-utils/assertPromptModule')

const moduleToTest = require('../doc')

test('base', async () => {
  const expectedPrompts = [
    {
      message: 'features',
      choices: ['Documentation'],
      check: [0]
    }
  ]

  const expectedOptions = {
    plugins: {
      'jslib-plugin-doc': {}
    }
  }

  await assertPromptModule(
    [moduleToTest],
    expectedPrompts,
    expectedOptions,
    { pluginsOnly: true }
  )
})
