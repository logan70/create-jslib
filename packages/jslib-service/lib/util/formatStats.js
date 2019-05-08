const fs = require('fs')
const path = require('path')
const zlib = require('zlib')
const cliui = require('cliui')
const chalk = require('chalk')

// get list of all files in target directory
const getFiles = (targetDir) => {
  let allFiles = []
  const files = fs.readdirSync(targetDir)
  files.forEach(file => {
    const filePath = path.join(targetDir, file)
    if (fs.statSync(filePath).isFile()) {
      allFiles.push(filePath)
    }
    if (fs.statSync(filePath).isDirectory()) {
      allFiles = [...allFiles, ...getFiles(filePath)]
    }
  })
  return allFiles
}

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
module.exports = (api = {}, options = {}) => {
  const context = api.service && api.service.context || process.cwd()
  const outputDir = options.outputDir || 'dist'
  const bundleReg = /\.js$/

  const files = getFiles(outputDir)
    .filter(file => bundleReg.test(file))
    .map((file) => {
      const size = getSize(file)
      const gzippedSize = getGzippedSize(file)
      return {
        file: path.relative(context, file),
        size,
        gzippedSize
      }
    })

  if (!files.length) {
    return ''
  }

  files.sort((a, b) => parseFloat(b.size) - parseFloat(a.size))

  // output file status
  const ui = cliui({ width: 80 })
  ui.div(
    makeRow(
      chalk.cyan.bold(`File`),
      chalk.cyan.bold(`Size`),
      chalk.cyan.bold(`Gzipped`)
    ) + `\n\n` +
    files.map(asset => makeRow(
      chalk.green(asset.file),
      asset.size,
      asset.gzippedSize
    )).join(`\n`)
  )
  return (`${ui.toString()}\n\n  ${chalk.gray(`Only JavaScript bundles included.`)}\n`)
}
