module.exports = cli => {
  cli.injectPrompt({
    name: 'outputFormats',
    when: answers => answers.preset === '__manual__',
    type: 'checkbox',
    message: 'Check the formats you want to compile to:',
    description: 'Rollup will compile your code to selected formats.',
    choices: [{
      name: 'umd',
      value: 'umd',
      short: 'umd',
      description: 'Universal Module Definition, works as amd, cjs and iife all in one',
      checked: true
    }, {
      name: 'cjs',
      value: 'cjs',
      short: 'cjs',
      description: 'CommonJS, suitable for Node and other bundlers'
    }, {
      name: 'esm',
      value: 'esm',
      short: 'esm',
      description: 'Keep the bundle as an ES module file, suitable for other bundlers and inclusion as a <script type=module> tag in modern browsers'
    }, {
      name: 'iife',
      value: 'iife',
      short: 'iife',
      description: 'A self-executing function, suitable for inclusion as a <script> tag.'
    }, {
      name: 'amd',
      value: 'amd',
      short: 'amd',
      description: 'Asynchronous Module Definition, used with module loaders like RequireJS'
    }, {
      name: 'system',
      value: 'system',
      short: 'system',
      description: 'Native format of the SystemJS loader'
    }],
    pageSize: 10,
    validate (formats) {
      if (formats.length < 1) {
        return 'You must choose at least one format!'
      }
      return true
    }
  })

  cli.onPromptComplete((answers, options) => {
    options.formats = Array.from(new Set([...options.formats, ...answers.outputFormats]))
  })
}
