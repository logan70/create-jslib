module.exports = cli => {
  const chalk = require('chalk')
  const { hasGit } = require('jslib-util')

  cli.injectFeature({
    name: 'Linter / Formatter',
    value: 'linter',
    short: 'Linter',
    description: 'Check and enforce code quality with ESLint or Prettier',
    link: 'https://github.com/logan70/create-jslib/tree/master/packages/jslib-plugin-eslint',
    plugins: ['eslint'],
    checked: true
  })

  cli.injectPrompt({
    name: 'eslintConfig',
    when: answers => answers.features.includes('linter'),
    type: 'list',
    message: 'Pick a linter / formatter config:',
    description: 'Checking code errors and enforcing an homogeoneous code style is recommended.',
    choices: answers => [
      {
        name: `ESLint + Airbnb config(${chalk.yellow('recommend')})`,
        value: 'airbnb',
        short: 'Airbnb'
      },
      {
        name: 'ESLint with error prevention only',
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
      },
      ...(
        answers.features.includes('ts')
          ? [{
            name: `TSLint`,
            value: 'tslint',
            short: 'TSLint'
          }]
          : []
      )
    ]
  })

  cli.injectPrompt({
    name: 'lintOn',
    message: 'Pick additional lint features:',
    when: answers => answers.features.includes('linter'),
    type: 'checkbox',
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
  })

  cli.onPromptComplete((answers, options) => {
    if (answers.features.includes('linter') && answers.eslintConfig !== 'tslint') {
      options.plugins['jslib-plugin-eslint'] = {
        config: answers.eslintConfig,
        lintOn: answers.lintOn
      }
    }
  })
}
