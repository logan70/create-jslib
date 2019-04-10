const { fs } = require('memfs')

// overwrite config path and context when fs is mocked
process.env.JSLIB_CONTEXT = '/'
process.env.JSLIB_CONFIG_PATH = '/jslib.config.js'

module.exports = fs
