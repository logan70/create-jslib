const chalk = require('chalk')
const { hasYarn } = require('jslib-util')
const { getPromptModules } = require('./util/createTools')

const isManualMode = answers => answers.preset === '__manual__'

module.exports = class Prompter {
  constructor () {
    this.injectedPrompts = []
    this.promptCompleteCbs = []
    this.presetPrompt = {
      name: 'preset',
      type: 'list',
      message: `Please pick a preset:`,
      choices: [
        {
          name: `default (${chalk.yellow('babel')}, ${chalk.yellow('eslint')})`,
          value: 'default'
        },
        {
          name: 'Manually select features',
          value: '__manual__'
        }
      ]
    }
    this.featurePrompt = {
      name: 'features',
      when: isManualMode,
      type: 'checkbox',
      message: 'Check the features needed for your project:',
      choices: [],
      pageSize: 10
    }
    this.outroPrompts = [{
      name: 'useConfigFiles',
      when: isManualMode,
      type: 'list',
      message: 'Where do you prefer placing config for Babel, PostCSS, ESLint, etc.?',
      choices: [
        {
          name: 'In dedicated config files',
          value: 'files'
        },
        {
          name: 'In package.json',
          value: 'pkg'
        }
      ]
    }]
    if (hasYarn()) {
      this.outroPrompts.push({
        name: 'packageManager',
        type: 'list',
        message: 'Pick the package manager to use when installing dependencies:',
        choices: [
          {
            name: 'Use Yarn',
            value: 'yarn',
            short: 'Yarn'
          },
          {
            name: 'Use NPM',
            value: 'npm',
            short: 'NPM'
          }
        ]
      })
    }

    // inject choices of feature, prompts and success callbacks
    const promptModules = getPromptModules()
    promptModules.forEach(injector => injector(this))
  }

  injectFeature (feature) {
    this.featurePrompt.choices.push(feature)
  }

  injectPrompt (prompt) {
    this.injectedPrompts.push(prompt)
  }

  injectOptionForPrompt (name, option) {
    this.injectedPrompts.find(f => {
      return f.name === name
    }).choices.push(option)
  }

  onPromptComplete (cb) {
    this.promptCompleteCbs.push(cb)
  }

  resolveFinalPrompts () {
    // patch generator-injected prompts to only show in manual mode
    this.injectedPrompts.forEach(prompt => {
      const originalWhen = prompt.when || (() => true)
      prompt.when = answers => {
        return isManualMode(answers) && originalWhen(answers)
      }
    })
    const finalPrompts = [
      this.presetPrompt,
      this.featurePrompt,
      ...this.injectedPrompts,
      ...this.outroPrompts
    ]
    return finalPrompts
  }
}
