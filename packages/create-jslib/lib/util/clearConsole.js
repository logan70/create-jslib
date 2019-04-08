const chalk = require('chalk')
const { clearConsole } = require('jslib-util')
const currentVersion = require('../../package.json').version

exports.generateTitle = function () {
  let title = chalk.bold.blue(`Create-JSLib v${currentVersion}`)

  if (process.env.JSLIB_TEST) {
    title += ' ' + chalk.blue.bold('TEST')
  }
  if (process.env.JSLIB_DEBUG) {
    title += ' ' + chalk.magenta.bold('DEBUG')
  }

  return title
}

exports.clearConsole = function clearConsoleWithTitle () {
  const title = exports.generateTitle()
  clearConsole(title)
}
