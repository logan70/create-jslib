jest.mock('fs')
jest.mock('inquirer')

const { defaultPreset } = require('../lib/options')
const assertPromptModule = require('jslib-test-utils/assertPromptModule')

test('default', async () => {
  const epxectedPrompts = [
    {
      message: 'pick a preset',
      choices: [
        'default',
        'Manually select'
      ],
      choose: 0
    },
    {
      message: 'package manager',
      choices: ['Yarn', 'NPM'],
      choose: 0
    }
  ]
  await assertPromptModule([], epxectedPrompts, defaultPreset)
})

test('manual + PromptModuleAPI', async () => {
  const mockModule = api => {
    api.injectFeature({
      name: 'Foo',
      value: 'foo'
    })
    api.injectFeature({
      name: 'Bar',
      value: 'bar'
    })
    api.injectPrompt({
      name: 'customFoo',
      message: 'customFoo',
      when: answers => answers.features.includes('foo'),
      type: 'confirm'
    })
    api.injectPrompt({
      name: 'customBar',
      message: 'customBar',
      when: answers => answers.features.includes('bar'),
      type: 'list',
      choices: []
    })
    api.injectOptionForPrompt('customBar', {
      name: 'barChoice',
      value: 'barChoice'
    })
    api.onPromptComplete((answers, options) => {
      if (answers.features.includes('bar')) {
        options.plugins.bar = {}
      }
      if (answers.customBar === 'barChoice') {
        options.plugins.barChoice = {}
      }
    })
  }

  const expectedPrompts = [
    {
      message: 'pick a preset',
      choices: [
        'default',
        'Manually select'
      ],
      choose: 1
    },
    {
      message: 'Check the features',
      choices: ['Foo', 'Bar'],
      check: [1]
    },
    {
      message: 'customBar',
      choices: ['barChoice'],
      choose: 0
    },
    {
      message: 'Where do you prefer placing config',
      choices: ['dedicated', 'package.json'],
      choose: 0
    },
    {
      message: 'package manager',
      choices: ['Yarn', 'NPM'],
      choose: 0
    }
  ]

  const expectedOptions = {
    useConfigFiles: true,
    plugins: {
      bar: {},
      barChoice: {}
    }
  }

  await assertPromptModule(mockModule, expectedPrompts, expectedOptions)
})
