const fs = require('fs')
const path = require('path')
const zlib = require('zlib')
const cliui = require('cliui')
const chalk = require('chalk')
// format size to 'kb' unit
const formatSize = size => (size / 1024).toFixed(2) + ' kb'

const getSize = (filePath) => {
  const stat = fs.statSync(filePath)
  return formatSize(stat.size)
}
const getGzippedSize = (filePath) => {
  const buffer = fs.readFileSync(filePath)
  return formatSize(zlib.gzipSync(buffer).length)
}

const makeRow = (a, b, c) => `  ${a}\t    ${b}\t ${c}`

/**
 *
 * @param {String[]} files
 * @param {String} file - path of file relative to root directory
 */
module.exports = (args = {}, api) => {
  if (typeof args !== 'object' || !args.targetDir || !args.filesToShowStats) {

  }
  // get size and gzipped size of file
  const assets = args.filesToShowStats.map((file) => {
    const size = getSize(file)
    const gzippedSize = getGzippedSize(file)
    return {
      file: path.relative(api.service.context, file),
      size,
      gzippedSize
    }
  })

  assets.sort((a, b) => b.size - a.size)

  // output file status
  const ui = cliui({ width: 80 })
  ui.div(
    makeRow(
      chalk.cyan.bold(`File`),
      chalk.cyan.bold(`Size`),
      chalk.cyan.bold(`Gzipped`)
    ) + `\n\n` +
    assets.map(asset => makeRow(
      chalk.green(asset.file),
      asset.size,
      asset.gzippedSize
    )).join(`\n`)
  )
  return (`${ui.toString()}\n\n  ${chalk.gray(`Only JavaScript bundles included.`)}\n`)
}
