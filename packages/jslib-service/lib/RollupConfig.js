const nodeResolve = require('rollup-plugin-node-resolve')
const commonjs = require('rollup-plugin-commonjs')
const json = require('rollup-plugin-json')
const { uglify } = require('rollup-plugin-uglify')
const { terser } = require('rollup-plugin-terser')

const isDef = obj => obj !== null && obj !== undefined

const outputMap = {
  umd: 'index.aio.js',
  cjs: 'index.js',
  esm: 'index.esm.js'
}

class RollupConfig {
  constructor (format = 'umd', args = {}, api = {}, options = {}) {
    const srcType = 'hasPlugin' in api ? require('./util/getSrcType')(api) : 'js'
    this.input = args.entry || `src/index.${srcType}` // required
    this.plugins = [
      nodeResolve({
        extensions: ['.js', '.jsx', '.json'],
        preferBuiltins: true
      }),
      commonjs({ include: 'node_modules/**' }),
      json()
    ]

    // modify output options
    this.output = {
      format,
      name: args.name || options.name || 'jslib-project',
      file: `${options.outputDir || 'dist'}/${outputMap[format] || 'index.' + format + '.js'}`,
      banner: options.banner || '',
      sourcemap: isDef(options.productionSourceMap)
        ? Boolean(options.productionSourceMap)
        : process.env.NODE_ENV === 'production'
    }

    if (args.uglify) {
      const uglifyPlugin = format === 'esm' ? terser() : uglify()
      this.plugins.push(uglifyPlugin)
      this.output.file = this.output.file.replace(/(\.jsx?$)/, '.min$1')
    }

    if (args.watch) {
      this.watch = {
        // chokidar should be used instead of the built-in fs.watch
        chokidar: true,
        include: args.entry.replace(/\/.*/, '/**'),
        clearScreen: false
      }
    }
  }
}

module.exports = RollupConfig
