jest.mock('fs')
jest.mock('inquirer')

const assertPromptModule = require('jslib-test-utils/assertPromptModule')

const moduleToTest = require('../unit')

test('jest', async () => {
  const expectedPrompts = [
    {
      message: 'features',
      choices: ['Unit Testing'],
      check: [0]
    },
    {
      message: 'Pick a unit testing solution',
      choices: ['Jest', 'Mocha'],
      choose: 0
    }
  ]

  const expectedOptions = {
    plugins: {
      'jslib-plugin-unit-jest': {}
    }
  }

  await assertPromptModule(
    moduleToTest,
    expectedPrompts,
    expectedOptions,
    { pluginsOnly: true }
  )
})

test('mocha', async () => {
  const expectedPrompts = [
    {
      message: 'features',
      choices: ['Unit Testing'],
      check: [0]
    },
    {
      message: 'Pick a unit testing solution',
      choices: ['Jest', 'Mocha'],
      choose: 1
    }
  ]

  const expectedOptions = {
    plugins: {
      'jslib-plugin-unit-mocha': {}
    }
  }

  await assertPromptModule(
    moduleToTest,
    expectedPrompts,
    expectedOptions,
    { pluginsOnly: true }
  )
})
