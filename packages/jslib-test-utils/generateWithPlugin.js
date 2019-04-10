// eslint-disable-next-line
const Generator = require('create-jslib/lib/Generator')

module.exports = async function generateWithPlugin (plugin, pkg) {
  process.env.JSLIB_SKIP_WRITE = true
  const generator = new Generator('/', {
    plugins: [].concat(plugin)
  })
  await generator.generate()
  return {
    pkg: generator.pkg,
    files: generator.files
  }
}
