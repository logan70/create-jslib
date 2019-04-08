const fs = require('fs')

const igonreFiles = ['index.js']

const filesToExport = fs.readdirSync(__dirname).filter(file => !igonreFiles.includes(file))

filesToExport.forEach((file) => {
  Object.assign(exports, require(`./${file}`))
})
