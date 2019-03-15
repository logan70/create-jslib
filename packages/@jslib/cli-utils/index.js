const fs = require('fs')
const path = require('path')

const filesToExport = fs.readdirSync('./lib')

console.log(filesToExport)

filesToExport.forEach((file) => {
  Object.assign(exports, require(`./lib/${file}`))
})

console.log(exports)