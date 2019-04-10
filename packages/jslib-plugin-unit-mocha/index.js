module.exports = api => {
  const compiler = api.hasPlugin('typescript') ? 'ts-node/register' : '@babel/register'

  api.registerCommand('test:unit', {
    description: 'run unit tests with mocha-webpack',
    usage: 'jslib-service test:unit [options] [...files]',
    options: {
      '--watch, -w': 'run in watch mode',
      '--grep, -g': 'only run tests matching <pattern>',
      '--slow, -s': '"slow" test threshold in milliseconds',
      '--timeout, -t': 'timeout threshold in milliseconds',
      '--bail, -b': 'bail after first test failure',
      '--require, -r': 'require the given module before running tests'
    },
    details: (
      `The above list only includes the most commonly used options.\n` +
      `For a full list of available options, see\n` +
      `https://mochajs.org/#command-line-usage`
    )
  }, (args, rawArgv) => {
    // start runner
    const { execa } = require('jslib-util')
    const bin = require.resolve('mocha/bin/mocha')
    const hasInlineFilesGlob = args._ && args._.length
    const argv = [
      bin,
      '--recursive',
      '--require',
      require.resolve(compiler),
      '--require',
      require.resolve('./setup.js'),
      ...rawArgv,
      ...(hasInlineFilesGlob ? [] : [
        api.hasPlugin('typescript')
          ? `tests/unit/**/*.spec.ts`
          : `tests/unit/**/*.spec.js`
      ])
    ]

    return new Promise((resolve, reject) => {
      const child = execa('node', argv, { stdio: 'inherit' })
      child.on('error', reject)
      child.on('exit', code => {
        if (code !== 0) {
          reject(`mocha exited with code ${code}.`)
        } else {
          resolve()
        }
      })
    })
  })
}

module.exports.defaultModes = {
  'test:unit': 'test'
}
