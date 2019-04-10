const nodeResolve = require('rollup-plugin-node-resolve')
const commonjs = require('rollup-plugin-commonjs')
const { uglify } = require('rollup-plugin-uglify')

const outputMap = {
  umd: 'index.aio.js',
  cjs: 'index.js',
  esm: 'index.esm.js'
}

const defaultString = '__default__'
const getDefaultString = () => defaultString
const getDefaultArr = () => [defaultString]
const getDefaultObj = () => ({ val: defaultString })

const initialInputOption = {
  // core input options
  external: getDefaultArr(),
  input: getDefaultString(), // required
  plugins: getDefaultArr(),

  // advanced input options
  cache: getDefaultString(),
  inlineDynamicImports: getDefaultString(),
  manualChunks: getDefaultString(),
  onwarn: getDefaultString(),
  preserveModules: getDefaultString(),

  // danger zone
  acorn: getDefaultString(),
  acornInjectPlugins: getDefaultString(),
  context: getDefaultString(),
  moduleContext: getDefaultString(),
  preserveSymlinks: getDefaultString(),
  shimMissingExports: getDefaultString(),
  treeshake: getDefaultString(),

  // experimental
  chunkGroupingSize: getDefaultString(),
  experimentalCacheExpiry: getDefaultString(),
  experimentalOptimizeChunks: getDefaultString(),
  experimentalTopLevelAwait: getDefaultString(),
  perf: getDefaultString()
}

const initialOutputOption = {
  // core output options
  dir: getDefaultString(),
  file: getDefaultString(),
  format: getDefaultString(), // required
  globals: getDefaultObj(),
  name: getDefaultString(),

  // advanced output options
  assetFileNames: getDefaultString(),
  banner: getDefaultString(),
  chunkFileNames: getDefaultString(),
  compact: getDefaultString(),
  entryFileNames: getDefaultString(),
  extend: getDefaultString(),
  footer: getDefaultString(),
  interop: getDefaultString(),
  intro: getDefaultString(),
  outro: getDefaultString(),
  paths: getDefaultObj(),
  sourcemap: getDefaultString(),
  sourcemapExcludeSources: getDefaultString(),
  sourcemapFile: getDefaultString(),
  sourcemapPathTransform: getDefaultString(),

  // danger zone
  amd: getDefaultObj(),
  dynamicImportFunction: getDefaultString(),
  esModule: getDefaultString(),
  exports: getDefaultString(),
  freeze: getDefaultString(),
  indent: getDefaultString(),
  namespaceToStringTag: getDefaultString(),
  noConflict: getDefaultString(),
  preferConst: getDefaultString(),
  strict: getDefaultString()
}

class RollupConfig {
  constructor (format = 'umd', args = {}, api = {}, options = {}) {
    this.inputOption = initialInputOption
    this.outputOption = initialOutputOption

    // modify input options
    const srcType = 'hasPlugin' in api ? require('./util/getSrcType')(api) : 'js'
    this.inputOption.input = args.entry || `src/index.${srcType}` // required
    this.inputOption.plugins = [
      nodeResolve({
        mainFields: ['module', 'main'],
        extensions: ['.js']
      }),
      commonjs({
        include: 'node_modules/**'
      })
    ]
    args.uglify && this.inputOption.plugins.push(uglify())

    // modify output options
    this.outputOption.format = format
    this.outputOption.name = args.name || options.name || 'jslib-demo'
    this.outputOption.file = `${options.outputDir || 'dist'}/${outputMap[format] || 'index.' + format + '.js'}`
    this.outputOption.banner = options.banner || this.outputOption.banner
    this.outputOption.footer = options.footer || this.outputOption.footer
    this.outputOption.sourcemap = process.env.NODE_ENV === 'production'
      ? (typeof options.productionSourceMap === 'boolean' ? options.productionSourceMap : false) : true
  }

  getInputOption () {
    const finalInputOption = cleanOption(this.inputOption)
    return finalInputOption
  }

  getOutputOption () {
    const finalOutputOption = cleanOption(this.outputOption)
    if (finalOutputOption.dir && finalOutputOption.file) {
      delete finalOutputOption.file
    }
    if (finalOutputOption.format !== 'esm' && finalOutputOption.dynamicImportFunction) {
      delete finalOutputOption.dynamicImportFunction
    }
    return finalOutputOption
  }

  pushPlugin (plugin) {
    this.inputOption.plugins.push(plugin)
  }

  unshiftPlugin (plugin) {
    this.inputOption.plugins.unshift(plugin)
  }
}

module.exports = RollupConfig

const emptyValidator = {
  Object: obj => obj.val && obj.val === defaultString,
  Array: arr => arr[0] && arr[0] === defaultString,
  String: str => str === defaultString
}

function cleanOption (obj) {
  if (Object.prototype.toString.call(obj) !== '[object Object]') {
    return obj
  }
  const options = Object.assign({}, obj)
  Object.keys(options).forEach(key => {
    const val = options[key]
    const type = Object.prototype.toString.call(val).slice(8, -1)
    if (emptyValidator[type] && emptyValidator[type](val)) {
      delete options[key]
    }
  })
  return options
}
