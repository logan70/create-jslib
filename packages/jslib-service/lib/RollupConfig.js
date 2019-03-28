const path = require('path')
const nodeResolve = require('rollup-plugin-node-resolve')
const commonjs = require('rollup-plugin-commonjs')

const getRollupFormat = format => format.replace(/-\w*/, '')

const outputMap = {
  umd: 'index.aio.js',
  'umd-min': 'index.aio.min.js',
  'umd.min': 'index.aio.min.js',
  cjs: 'index.js',
  esm: 'index.esm.js',
}

class RollupConfig {
  constructor(format = 'umd', args = {}, api = {}, options = {}) {
    // input options
    this.input = args.entry
    this.plugins = [
      nodeResolve({
        main: true,
        extensions: ['.js']
      }),
      commonjs({
        include: 'node_modules/**',
      })
    ]
    // uglify bundle in umd-min format
    if (format === 'umd-min' || format === 'umd.min') {
      const { uglify } = require('rollup-plugin-uglify')
      this.plugins.push(uglify())
    }

    // output options
    this.file = path.resolve(api.service.context, args.dest || options.outputDir, outputMap[format] || `index.${format}.js`)
    this.format = getRollupFormat(format)
    this.banner = options.banner || ''
    this.footer = options.footer || ''
    if (format === 'umd-min' || 'umd' || 'umd.min' || 'iife') {
      this.name = args.name || options.name || '_'
    }
  }

  getInputOption() {
    return {
      input: this.input,
      plugins: this.plugins
    }
  }

  getOutputOption() {
    const outputOption = {
      file: this.file,
      format: this.format
    }
    this.banner && (outputOption.banner = this.banner)
    this.footer && (outputOption.footer = this.footer)
    this.name && (outputOption.name = this.name)
    return outputOption
  }

  pushPlugin(plugin) {
    this.plugins.push(plugin)
  }

  unshiftPlugin(plugin) {
    this.plugins.unshift(plugin)
  }
}

module.exports = RollupConfig