const chalk = require('chalk')
const semver = require('semver')

exports.checkNodeVersion = function checkNodeVersion(wanted = '>8.9.0', id = 'jslib-utils') {
  if (!semver.satisfies(process.version, wanted)) {
    console.log(chalk.red(
      'You are using Node ' + process.version + ', but this version of ' + id +
      ' requires Node ' + wanted + '.\nPlease upgrade your Node version.'
    ))
    process.exit(1)
  }
}