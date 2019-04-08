// dev only

const path = require('path')
const { linkBin } = require('./linkBin')

module.exports = function setupDevProject (targetDir) {
  return linkBin(
    require.resolve('jslib-service/bin/jslib-service'),
    path.join(targetDir, 'node_modules', '.bin', 'jslib-service')
  )
}
