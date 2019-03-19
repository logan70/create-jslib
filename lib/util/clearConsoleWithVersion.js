const chalk = require('chalk')
const { clearConsole } = require('jslib-util')
const currentVersion = require('../../package.json').version

exports.clearConsoleWithVersion = () => {
  const title = chalk.bold.blue(`JSLib CLI v${currentVersion}`)
  clearConsole(title)
}