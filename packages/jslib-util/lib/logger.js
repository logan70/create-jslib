const chalk = require('chalk')
const readline = require('readline')

const format = (label, msg) => {
  return msg.split('\n').map((line, i) => {
    return i === 0
      ? `${label} ${line}`
      : line
  }).join('\n')
}

const chalkTag = msg => chalk.bgBlackBright.white.dim(` ${msg} `)

exports.log = (msg = '', tag = null) => {
  tag ? console.log(format(chalkTag(tag), msg)) : console.log(msg)
}

exports.info = (msg = '', tag = null) => {
  const chalkMsg = format(chalk.bgBlue.black(' INFO ') + (tag ? chalkTag(tag) : ''), msg)
  console.log(chalkMsg)
}

exports.done = (msg = '', tag = null) => {
  const chalkMsg = format(chalk.bgGreen.black(' DONE ') + (tag ? chalkTag(tag) : ''), msg)
  console.log(chalkMsg)
}

exports.warn = (msg = '', tag = null) => {
  const chalkMsg = format(chalk.bgYellow.black(' WARN ') + (tag ? chalkTag(tag) : ''), msg)
  console.log(chalkMsg)
}

exports.error = (msg = '', tag = null) => {
  const chalkMsg = format(chalk.bgRed.black(' ERROR ') + (tag ? chalkTag(tag) : ''), msg)
  console.log(chalkMsg)
}

exports.clearConsole = (title) => {
  if (process.stdout.isTTY) {
    const blank = '\n'.repeat(process.stdout.rows)
    console.log(blank)
    readline.cursorTo(process.stdout, 0, 0)
    readline.clearScreenDown(process.stdout)
    if (title) {
      console.log(title)
    }
  }
}