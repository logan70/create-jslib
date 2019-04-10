// these prompts are used if the plugin is late-installed into an existing
// project and invoked by `create-jslib invoke`.

const { chalk, hasGit } = require('jslib-util')

module.exports = [
  {
    name: 'config',
    type: 'list',
    message: `Pick an ESLint config:`,
    choices: [
      {
        name: `ESLint + Airbnb config(${chalk.yellow('recommend')})`,
        value: 'airbnb',
        short: 'Airbnb'
      },
      {
        name: 'Error prevention only',
        value: 'base',
        short: 'Basic'
      },
      {
        name: 'ESLint + Standard config',
        value: 'standard',
        short: 'Standard'
      },
      {
        name: 'ESLint + Prettier',
        value: 'prettier',
        short: 'Prettier'
      }
    ]
  },
  {
    name: 'lintOn',
    type: 'checkbox',
    message: 'Pick additional lint features:',
    choices: [
      {
        name: 'Lint on save',
        value: 'save',
        checked: true
      },
      {
        name: 'Lint and fix on commit' + (hasGit() ? '' : chalk.red(' (requires Git)')),
        value: 'commit'
      }
    ]
  }
]
