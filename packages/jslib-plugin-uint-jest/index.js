module.exports = api => {
  api.registerCommand('test:unit', {
    description: 'run unit tests with jest',
    usage: 'jslib-service test:unit [options] <regexForTestFiles>',
    options: {
      '--watch': 'run tests in watch mode'
    },
    details:
      `All jest command line options are supported.\n` +
      `See https://facebook.github.io/jest/docs/en/cli.html for more details.`
  }, (args) => {
    require('jest').run(args._)
  })
}

module.exports.defaultModes = {
  'test:unit': 'test'
}
