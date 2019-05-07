const { error } = require('jslib-util')

module.exports = function getFormats (args, options) {
  if (args.formats && typeof args.formats === 'string') {
    return args.formats.split('.')
  } else if (Array.isArray(options.formats)) {
    return options.formats
  } else if (options.formats && typeof options.formats === 'string') {
    options.formats.split('.')
  } else {
    const errFormats = args.formats || options.formats
    const errMsg = errFormats
      ? `Unkonwd formats options ${errFormats}`
      : 'You must set "formats" in jslib.config.js'
    error(errMsg)
  }
}
