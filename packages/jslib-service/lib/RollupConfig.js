const nodeResolve = require('rollup-plugin-node-resolve')
const commonjs = require('rollup-plugin-commonjs')

const outputMap = {
  umd: 'index.aio.js',
  cjs: 'index.js',
  esm: 'index.esm.js'
}

class RollupConfig {
  constructor (format = 'umd', args = {}, api = {}, options = {}) {
    // core input options
    this.external = []
    this.input = args.entry // required
    this.plugins = [
      nodeResolve({
        main: true,
        extensions: ['.js']
      }),
      commonjs({
        include: 'node_modules/**'
      })
    ]

    // advanced input options
    this.inlineDynamicImports = undefined
    this.manualChunks = undefined
    this.onwarn = undefined
    this.preserveModules = undefined

    // danger zone
    this.acorn = undefined
    this.acornInjectPlugins = undefined
    this.context = undefined
    this.moduleContext = undefined
    this.preserveSymlinks = undefined
    this.shimMissingExports = undefined
    this.treeshake = undefined

    // experimental
    this.chunkGroupingSize = undefined
    this.experimentalCacheExpiry = undefined
    this.experimentalOptimizeChunks = undefined
    this.experimentalTopLevelAwait = undefined
    this.perf = undefined

    if (/[\-\.]min$/.test(format)) {
      const { uglify } = require('rollup-plugin-uglify')
      this.plugins.push(uglify())
    }

    // output options
    this.output = {
      // core output options
      dir: undefined,
      file: `${options.outputDir || 'dist'}/${outputMap[format] || 'index.' + format + '.js'}`,
      format, // required
      globals: {},
      name: args.name || options.name || 'jslib',

      // advanced output options
      assetFileNames: 'assets/[name]-[hash][extname]',
      banner: options.banner || '',
      chunkFileNames: '[name]-[hash].js',
      compact: false,
      entryFileNames: '[name].js',
      extend: false,
      footer: options.footer || '',
      interop: true,
      intro: '',
      outro: '',
      paths: {},
      sourcemap: process.env.NODE_ENV === 'production' ? (typeof options.productionSourceMap === 'boolean' ? options.productionSourceMap : false) : false,
      sourcemapExcludeSources: false,
      sourcemapFile: '',
      sourcemapPathTransform: sourcePath => sourcePath,

      // danger zone
      amd: {},
      dynamicImportFunction: 'import',
      esModule: true,
      exports: 'auto',
      freeze: true,
      indent: true,
      namespaceToStringTag: false,
      noConflict: false,
      preferConst: false,
      strict: true
    }
  }

  getInputOption () {
    const inputOption = {
      // core input options
      external: this.external,
      input: this.input, // required
      plugins: this.plugins,

      // advanced input options
      inlineDynamicImports: this.inlineDynamicImports,
      manualChunks: this.manualChunks,
      onwarn: this.onwarn,
      preserveModules: this.preserveModules,

      // danger zone
      acorn: this.acorn,
      acornInjectPlugins: this.acornInjectPlugins,
      context: this.context,
      moduleContext: this.moduleContext,
      preserveSymlinks: this.preserveSymlinks,
      shimMissingExports: this.shimMissingExports,
      treeshake: this.treeshake,

      // experimental
      chunkGroupingSize: this.chunkGroupingSize,
      experimentalCacheExpiry: this.experimentalCacheExpiry,
      experimentalOptimizeChunks: this.experimentalOptimizeChunks,
      experimentalTopLevelAwait: this.experimentalTopLevelAwait,
      perf: this.perf
    }
    return cleanObject(inputOption)
  }

  getOutputOption () {
    const outputOptions = Object.assign({}, this.output)
    if (outputOptions.dir) {
      delete outputOptions.file
    }
    if (outputOptions.format !== 'esm') {
      delete outputOptions.dynamicImportFunction
    }
    return cleanObject(outputOptions)
  }

  pushPlugin (plugin) {
    this.plugins.push(plugin)
  }

  unshiftPlugin (plugin) {
    this.plugins.unshift(plugin)
  }
}

module.exports = RollupConfig

function cleanObject (obj) {
  if (Object.prototype.toString.call(obj) !== '[object Object]') {
    return obj
  }
  Object.keys(obj).forEach(key => {
    if (obj[key] === void 0 || obj[key] === null) {
      delete obj[key]
    }
  })
  return obj
}
