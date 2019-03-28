const fs = require('fs')
const path = require('path')

const filesToExport = fs.readdirSync(path.resolve(__dirname, './lib'))

filesToExport.forEach((file) => {
  Object.assign(exports, require(path.resolve(__dirname, './lib', file)))
})