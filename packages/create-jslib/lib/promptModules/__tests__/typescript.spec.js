jest.mock('fs')
jest.mock('inquirer')

const assertPromptModule = require('jslib-test-utils/assertPromptModule')

const moduleToTest = require('../typescript')
const linterModule = require('../linter')

test('with TSLint', async () => {
  const expectedPrompts = [
    {
      message: 'features',
      choices: ['TypeScript', 'Linter'],
      check: [0, 1]
    },
    {
      message: 'Use Babel',
      confirm: true
    },
    {
      message: 'Pick a linter / formatter',
      choices: ['Airbnb', 'error prevention', 'Standard', 'Prettier', 'TSLint'],
      choose: [4]
    },
    {
      message: 'Pick additional lint features',
      choices: ['on save', 'on commit'],
      check: [0, 1]
    }
  ]

  const expectedOptions = {
    plugins: {
      'jslib-plugin-typescript': {
        tsLint: true,
        lintOn: ['save', 'commit'],
        useTsWithBabel: true
      }
    }
  }

  await assertPromptModule(
    [moduleToTest, linterModule],
    expectedPrompts,
    expectedOptions,
    { pluginsOnly: true }
  )
})

test('with ESLint', async () => {
  const expectedPrompts = [
    {
      message: 'features',
      choices: ['TypeScript', 'Linter'],
      check: [0, 1]
    },
    {
      message: 'Use Babel',
      confirm: true
    },
    {
      message: 'Pick a linter / formatter',
      choices: ['Airbnb', 'error prevention', 'Standard', 'Prettier', 'TSLint'],
      choose: [0]
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
        config: 'airbnb',
        lintOn: ['save', 'commit']
      },
      'jslib-plugin-typescript': {
        useTsWithBabel: true
      }
    }
  }

  await assertPromptModule(
    [moduleToTest, linterModule],
    expectedPrompts,
    expectedOptions,
    { pluginsOnly: true }
  )
})
