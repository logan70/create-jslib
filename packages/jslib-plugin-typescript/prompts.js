// these prompts are used if the plugin is late-installed into an existing
// project and invoked by `create-jslib invoke`.

const { chalk, hasGit } = require('jslib-util')

const prompts = module.exports = [
  {
    name: `useTsWithBabel`,
    type: `confirm`,
    message: `Use Babel alongside TypeScript for auto-detected polyfills?`
  },
  {
    name: `lint`,
    type: `confirm`,
    message: `Use TSLint?`
  },
  {
    name: `lintOn`,
    type: `checkbox`,
    when: answers => answers.lint,
    message: `Pick lint features:`,
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

// in RC6+ the export can be function, but that would break invoke for RC5 and
// below, so this is a temporary compatibility hack until we release stable.
// TODO just export the function in 3.0.0
module.exports.getPrompts = pkg => {
  prompts[2].when = () => !('jslib-plugin-eslint' in (pkg.devDependencies || {}))
  return prompts
}
