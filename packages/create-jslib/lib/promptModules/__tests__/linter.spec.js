jest.mock('fs')
jest.mock('inquirer')

const assertPromptModule = require('jslib-test-utils/assertPromptModule')

const moduleToTest = require('../linter')

test('base', async () => {
  const expectedPrompts = [
    {
      message: 'features',
      choices: ['Linter'],
      check: [0]
    },
    {
      message: 'Pick a linter / formatter config',
      choices: ['Airbnb', 'error prevention only', 'Standard', 'Prettier'],
      choose: 1
    },
    {
      message: 'Pick additional lint features',
      choices: ['on save', 'on commit'],
      check: [0, 1]
    }
  ]

  const expectedOptions = {
    plugins: {
      'jslib-plugin-eslint': {
        config: 'base',
        lintOn: ['save', 'commit']
      }
    }
  }

  await assertPromptModule(
    moduleToTest,
    expectedPrompts,
    expectedOptions,
    { pluginsOnly: true }
  )
})

test('airbnb', async () => {
  const expectedPrompts = [
    {
      message: 'features',
      choices: ['Linter'],
      check: [0]
    },
    {
      choose: 0
    },
    {
      check: [1]
    }
  ]

  const expectedOptions = {
    plugins: {
      'jslib-plugin-eslint': {
        config: 'airbnb',
        lintOn: ['commit']
      }
    }
  }

  await assertPromptModule(
    moduleToTest,
    expectedPrompts,
    expectedOptions,
    { pluginsOnly: true }
  )
})

test('standard', async () => {
  const expectedPrompts = [
    {
      message: 'features',
      choices: ['Linter'],
      check: [0]
    },
    {
      choose: 2
    },
    {
      check: []
    }
  ]

  const expectedOptions = {
    plugins: {
      'jslib-plugin-eslint': {
        config: 'standard',
        lintOn: []
      }
    }
  }

  await assertPromptModule(
    moduleToTest,
    expectedPrompts,
    expectedOptions,
    { pluginsOnly: true }
  )
})

test('prettier', async () => {
  const expectedPrompts = [
    {
      message: 'features',
      choices: ['Linter'],
      check: [0]
    },
    {
      choose: 3
    },
    {
      check: [0]
    }
  ]

  const expectedOptions = {
    plugins: {
      'jslib-plugin-eslint': {
        config: 'prettier',
        lintOn: ['save']
      }
    }
  }

  await assertPromptModule(
    moduleToTest,
    expectedPrompts,
    expectedOptions,
    { pluginsOnly: true }
  )
})
