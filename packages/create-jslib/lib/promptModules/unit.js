module.exports = cli => {
  cli.injectFeature({
    name: 'Unit Testing',
    value: 'unit',
    short: 'Unit',
    description: 'Add a Unit Testing solution', //  like Jest or Mocha
    plugins: ['unit-jest']
  })

  cli.injectPrompt({
    name: 'unit',
    when: answers => answers.features.includes('unit'),
    type: 'list',
    message: 'Pick a unit testing solution:',
    choices: [
      {
        name: 'Jest',
        value: 'jest',
        short: 'Jest'
      },
      {
        name: 'Mocha + Chai',
        value: 'mocha',
        short: 'Mocha'
      }
    ]
  })

  cli.onPromptComplete((answers, options) => {
    if (answers.unit === 'mocha') {
      options.plugins['jslib-plugin-unit-mocha'] = {}
    } else if (answers.unit === 'jest') {
      options.plugins['jslib-plugin-unit-jest'] = {}
    }
  })
}
