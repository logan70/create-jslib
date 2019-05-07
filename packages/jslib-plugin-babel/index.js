const path = require('path')
const { isWindows } = require('jslib-util')

function genTranspileDepArray (transpileDependencies) {
  const deps = transpileDependencies.map(dep => {
    if (typeof dep === 'string') {
      const depPath = path.join('node_modules', dep, '/') + '**'
      return isWindows
        ? depPath.replace(/\\/g, '\\\\') // double escape for windows style path
        : depPath
    } else if (dep instanceof RegExp) {
      return dep.source
    }
  })
  return deps
}

module.exports = (api, options) => {
  const babel = require('rollup-plugin-babel')
  const transpileDepArray = genTranspileDepArray(options.transpileDependencies)
  const defaultFilesToCompile = ['src/**'].concat(transpileDepArray)
  const babelPlugin = babel({
    include: defaultFilesToCompile,
    runtimeHelpers: true,
    extensions: api.hasPlugin('typescript') ? ['.ts', '.tsx'] : ['.js', '.jsx']
  })
  api.configureRollup((rollupConfig) => {
    rollupConfig.plugins.push(babelPlugin)
  })
}
